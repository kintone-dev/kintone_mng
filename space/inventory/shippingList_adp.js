(function () {
  'use strict';

  // 拠点情報取得＆繰り返し利用
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    var nStatus = event.nextStatus.value;

    //ステータスが集荷待ちの場合
    if (nStatus === "集荷待ち") {
      var deviceList = event.record.deviceList.value;
      var shipmentName = event.record.shipment.value;
      var sysShipmentCode = event.record.sys_shipmentCode.value;
      var sysArrivalCode = event.record.sys_arrivalCode.value;
      var stockData = [];
      for (var sdl in deviceList) {
        var stockDataBody = {
          'mCode': deviceList[sdl].value.mCode.value,
          'shipNum': deviceList[sdl].value.shipNum.value
        }
        stockData.push(stockDataBody);
      }
      var sNums = sNumRecords(event.record.deviceList.value, 'table');

      //ID更新
      if (shipmentName == '矢倉倉庫') {
        var postSnumData = [];
        for (var y in sNums) {
          var snRecord = {
            'sNum': {
              'value': sNums[y]
            },
            'shipment': event.record.shipment,
            'sendDate': event.record.sendDate,
            'shipType': event.record.shipType,
            'instName': event.record.instName
          };
          postSnumData.push(snRecord);
        }
        postRecords(sysid.DEV.app_id.sNum, postSnumData);
      } else {
        var putSnumData = [];
        for (var y in sNums) {
          var snRecord = {
            'updateKey': {
              'field': 'sNum',
              'value': sNums[y]
            },
            'record': {
              'shipment': event.record.shipment,
              'sendDate': event.record.sendDate,
              'shipType': event.record.shipType,
              'instName': event.record.instName
            }
          };
          putSnumData.push(snRecord);
        }
        putRecords(sysid.DEV.app_id.sNum, putSnumData);
      }
      //ID更新 end

      stockCtrl(event);

      // ステータスが出荷完了の場合
    } else if (nStatus === "出荷完了") {
      // 輸送情報連携
      setDeliveryInfo(event.record);

      // レポート処理
      if (event.record.shipType.value == '移動-販売' || event.record.shipType.value == '移動-サブスク') {
        reportCreate(event.record, 'distribute');
      } else if (event.record.shipType.value == '販売' || event.record.shipType.value == 'サブスク') {
        reportCreate(event.record, 'distribute');
      } else if (event.record.shipType.value == '移動-拠点間' || event.record.shipType.value == '移動-ベンダー') {
        reportCreate(event.record, 'arrival');
      } else if (event.record.shipType.value == '社内利用' || event.record.shipType.value == '貸与' || event.record.shipType.value == '修理') {
        reportCreate(event.record, 'shiponly');
      } else if (event.record.shipType.value == '返品') {
        reportCreate(event.record, 'shiponly');
      }
    } else if(nStatus === "受領待ち"){
      var txt = $('[name=setShipment] option:selected').text();
      var val = $('[name=setShipment] option:selected').val();
      if(val != 'noSelect'){
        event.record.shipment.value = txt;
        event.record.sys_shipmentCode.value = val;
      } else{
        event.error = '出荷ロケーションを選択して下さい。';
      }
    }

    return event;
  });

  // 納品情報未確定のものをステータス変更
  kintone.events.on('app.record.index.show', function (event) {
    if (sessionStorage.getItem('record_updated') === '1') {
      sessionStorage.setItem('record_updated', '0');
      return event;
    }
    var getShipBody = {
      'app': sysid.INV.app_id.shipment,
      'query': 'prjId != "" order by レコード番号'
    };
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getShipBody)
      .then(function (resp) {
        if (resp.records != 0) {
          var putStatusData = {
            'app': sysid.INV.app_id.shipment,
            'records': []
          }
          for (var i in resp.records) {
            if (resp.records[i].ステータス.value == '納品情報未確定') {
              var putStatusBody = {
                'id': resp.records[i].$id.value,
                'action': '処理開始'
              }
              putStatusData.records.push(putStatusBody);
            }
          }
          kintone.api(kintone.api.url('/k/v1/records/status.json', true), "PUT", putStatusData);
          sessionStorage.setItem('record_updated', '1');
          location.reload();
        }
      });
  });

  /* ---以下関数--- */
  // レポート処理
  const reportCreate = function (pageRecod, param) {
    var sendDate = pageRecod.sendDate.value;
    var deviceList = pageRecod.deviceList.value;
    var sysShipmentCode = pageRecod.sys_shipmentCode.value;
    var sysArrivalCode = pageRecod.sys_arrivalCode.value;
    var stockData = []
    for (var sdl in deviceList) {
      var stockDataBody = {
        'mCode': deviceList[sdl].value.mCode.value,
        'shipNum': deviceList[sdl].value.shipNum.value
      }
      stockData.push(stockDataBody);
    }
    sendDate = sendDate.replace(/-/g, '');
    sendDate = sendDate.slice(0, -2);
    const REPORT_KEY_YEAR = sendDate.substring(0, 4);
    const REPORT_KEY_MONTH = sendDate.substring(4, 7);
    //同じ月のレポート情報取得
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'sys_invoiceDate = "' + sendDate + '" order by 更新日時 asc'
    };
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
      .then(function (resp) {
        if (resp.records.length != 0) {
          //更新レポート情報格納配列
          var putReportData = [];
          //更新レポート情報
          var putReportBody = {
            'id': resp.records[0].$id.value,
            'record': {
              'inventoryList': {
                'value': resp.records[0].inventoryList.value
              }
            }
          }
          //レポート内sysコード格納
          var reportSysCode = [];
          var inventoryList = resp.records[0].inventoryList.value;
          for (var il in inventoryList) {
            var reportSysData = {
              'sysCode': inventoryList[il].value.sys_code.value,
              'rowId': inventoryList[il].id,
              'shipNum': inventoryList[il].value.shipNum.value
            }
            reportSysCode.push(reportSysData);
          }

          //作成したsysコードを格納
          var shipSysCode = [];
          for (var dl in deviceList) {
            var shipSysData = {
              'sysCode': deviceList[dl].value.mCode.value + '-' + sysShipmentCode,
              'shipNum': deviceList[dl].value.shipNum.value
            }
            shipSysCode.push(shipSysData);
          }

          for (var ssc in shipSysCode) {
            //サブテーブル追加
            if (reportSysCode.some(item => item.sysCode === shipSysCode[ssc].sysCode)) {
              for (var il in putReportBody.record.inventoryList.value) {
                if (putReportBody.record.inventoryList.value[il].value.sys_code.value == shipSysCode[ssc].sysCode) {
                  putReportBody.record.inventoryList.value[il].value.shipNum.value = (parseInt(shipSysCode[ssc].shipNum) || 0) + (parseInt(putReportBody.record.inventoryList.value[il].value.shipNum.value) || 0);
                  var totalShipNum = putReportBody.record.inventoryList.value[il].value.shipNum.value;
                }
              }
            } else {
              var putInventoryBody = {
                'value': {
                  'sys_code': shipSysCode[ssc].sysCode,
                  'stockLocation': pageRecod.shipment.value,
                  'shipNum': shipSysCode[ssc].shipNum
                }
              }
              putReportBody.record.inventoryList.value.push(putInventoryBody);
            }
          }

          if (param == 'arrival') {
            //作成したarrivalsysコード格納
            var arrivalSysCode = [];
            for (var dl in deviceList) {
              var arrivalSysData = {
                'sysCode': deviceList[dl].value.mCode.value + '-' + sysArrivalCode,
                'shipNum': deviceList[dl].value.shipNum.value,
                'location': pageRecod.Contractor.value
              }
              arrivalSysCode.push(arrivalSysData);
            }

            for (var asc in arrivalSysCode) {
              //arrivalテーブル追加
              if (reportSysCode.some(item => item.sysCode === arrivalSysCode[asc].sysCode)) {
                for (var il in putReportBody.record.inventoryList.value) {
                  if (putReportBody.record.inventoryList.value[il].value.sys_code.value == arrivalSysCode[asc].sysCode) {
                    putReportBody.record.inventoryList.value[il].value.arrivalNum.value = (parseInt(putReportBody.record.inventoryList.value[il].value.arrivalNum.value) || 0) + (parseInt(arrivalSysCode[asc].shipNum) || 0);
                    var totalArrivalNum = putReportBody.record.inventoryList.value[il].value.arrivalNum.value;
                  }
                }

              } else {
                var putArrivalBody = {
                  'value': {
                    'sys_code': arrivalSysCode[asc].sysCode,
                    'stockLocation': arrivalSysCode[asc].location,
                    'arrivalNum': arrivalSysCode[asc].shipNum
                  }
                }
                putReportBody.record.inventoryList.value.push(putArrivalBody);
              }
            }
          } else if (param == 'distribute') {
            //作成したdistributesyscode
            var shipDistributeCode = [];
            for (var dl in deviceList) {
              var shipDistributeData = {
                'sysCode': deviceList[dl].value.mCode.value + '-distribute',
                'shipNum': deviceList[dl].value.shipNum.value
              }
              shipDistributeCode.push(shipDistributeData);
            }

            for (var sdc in shipDistributeCode) {
              //distributeテーブル追加
              if (reportSysCode.some(item => item.sysCode === shipDistributeCode[sdc].sysCode)) {
                for (var il in putReportBody.record.inventoryList.value) {
                  if (putReportBody.record.inventoryList.value[il].value.sys_code.value == shipDistributeCode[sdc].sysCode) {
                    putReportBody.record.inventoryList.value[il].value.arrivalNum.value = (parseInt(putReportBody.record.inventoryList.value[il].value.arrivalNum.value) || 0) + (parseInt(shipDistributeCode[sdc].shipNum) || 0);
                    var totalArrivalNum = putReportBody.record.inventoryList.value[il].value.arrivalNum.value;
                  }
                }
              } else {
                var putDistributeBody = {
                  'value': {
                    'sys_code': shipDistributeCode[sdc].sysCode,
                    'stockLocation': '積送',
                    'arrivalNum': shipDistributeCode[sdc].shipNum
                  }
                }
                putReportBody.record.inventoryList.value.push(putDistributeBody);
              }
            }
          } else if (param == 'shiponly') {}

          putReportData.push(putReportBody);
          putRecords(sysid.INV.app_id.report, putReportData);
        } else {
          //レポート新規作成
          var postReportData = [];
          var postInventoryListArray = [];
          var postReportBody = {
            'invoiceYears': {
              'value': REPORT_KEY_YEAR
            },
            'invoiceMonth': {
              'value': REPORT_KEY_MONTH
            },
            'inventoryList': {
              'value': postInventoryListArray
            }
          }
          //作成したsysコードを格納
          var shipSysCode = [];
          for (var dl in deviceList) {
            var shipSysData = {
              'sysCode': deviceList[dl].value.mCode.value + '-' + sysShipmentCode,
              'shipNum': deviceList[dl].value.shipNum.value
            }
            shipSysCode.push(shipSysData);
          }

          for (var ssc in shipSysCode) {
            //サブテーブル追加
            var postInventoryBody = {
              'value': {
                'sys_code': shipSysCode[ssc].sysCode,
                'stockLocation': pageRecod.shipment.value,
                'shipNum': shipSysCode[ssc].shipNum
              }
            }
            postInventoryListArray.push(postInventoryBody);
          }

          if (param == 'arrival') {
            //作成したarrivalSysコード格納
            var arrivalSysCode = [];
            for (var dl in deviceList) {
              var arrivalSysData = {
                'sysCode': deviceList[dl].value.mCode.value + '-' + sysArrivalCode,
                'shipNum': deviceList[dl].value.shipNum.value,
                'location': pageRecod.Contractor.value
              }
              arrivalSysCode.push(arrivalSysData);
            }
            for (var asc in arrivalSysCode) {
              //arrivalテーブル追加
              var postArrivalBody = {
                'value': {
                  'sys_code': arrivalSysCode[asc].sysCode,
                  'stockLocation': arrivalSysCode[asc].location,
                  'arrivalNum': arrivalSysCode[asc].shipNum
                }
              }
              postInventoryListArray.push(postArrivalBody);
            }
          } else if (param == 'distribute') {
            //作成したdistributeSysCode
            var shipDistributeCode = [];
            for (var dl in deviceList) {
              var shipDistributeData = {
                'sysCode': deviceList[dl].value.mCode.value + '-distribute',
                'shipNum': deviceList[dl].value.shipNum.value
              }
              shipDistributeCode.push(shipDistributeData);
            }
            for (var sdc in shipDistributeCode) {
              //distributeテーブル追加
              var postDistributeBody = {
                'value': {
                  'sys_code': shipDistributeCode[sdc].sysCode,
                  'stockLocation': '積送',
                  'arrivalNum': shipDistributeCode[sdc].shipNum
                }
              }
              postInventoryListArray.push(postDistributeBody);
            }
          } else if (param == 'shiponly') {}

          postReportData.push(postReportBody);
          postRecords(sysid.INV.app_id.report, postReportData);
        }
      });
  }

  // 輸送情報連携
  const setDeliveryInfo = function (pageRecod) {
    var putDeliveryData = [];
    var putDeliveryBody = {
      'id': pageRecod.prjId.value,
      'record': {
        'deliveryCorp': {
          'value': pageRecod.deliveryCorp.value
        },
        'trckNum': {
          'value': pageRecod.trckNum.value
        },
        'sendDate': {
          'value': pageRecod.sendDate.value
        },
        'expArrivalDate': {
          'value': pageRecod.expArrivalDate.value
        }
      }
    }
    putDeliveryData.push(putDeliveryBody);

    var putStatusBody = {
      'app': sysid.PM.app_id.project,
      'id': pageRecod.prjId.value,
      'action': '製品発送'
    };

    putRecords(sysid.PM.app_id.project, putDeliveryData);
    kintone.api(kintone.api.url('/k/v1/record/status.json', true), "PUT", putStatusBody);
  }

})();