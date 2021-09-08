(function () {
  'use strict';

  // 拠点情報取得＆繰り返し利用
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    //kintone.events.on('app.record.detail.show', function (event) {
    var nStatus = event.nextStatus.value;
    if (nStatus === "集荷待ち") {
      /*
        setBtn_header('test_btn_sNam', 'input to sNam');
        $('#'+test_btn_sNam.id).on('click', function(){
          //test_sNam();
        });
        var test_sNam=function(){
      */

      //パラメータsNumBodyにjsonデータ作成
      var sNumBody = {
        'app': sysid.DEV.app_id.sNum,
        'records': []
      };
      var shipTable = event.record.deviceList.value;
      var shipShipment = event.record.shipment.value;
      var sNums = sNumRecords(event.record.deviceList.value, 'table');

      if (shipShipment === '矢倉倉庫') {
        for (var y in sNums) {
          var snRecord = { //,,,,,roomName
            'sNum': {
              'value': sNums[y]
            },
            'shipment': event.record.shipment,
            'sendDate': event.record.sendDate,
            'shipType': event.record.shipType,
            'instName': event.record.instName
          };
          sNumBody.records.push(snRecord);
        }
        var setSNinfo = new kintone.api(kintone.api.url('/k/v1/records', true), 'POST', sNumBody);
      } else {
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
          sNumBody.records.push(snRecord);
        }
        var setSNinfo = new kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', sNumBody);
      }
      setSNinfo.then(function (resp) {
        console.log(resp);
      }).catch(function (error) {
        console.error(error);
      });

      //レポート連携
      var sendDate = event.record.sendDate.value;
      var deviceList = event.record.deviceList.value;
      var sysUCode = event.record.sys_uCode.value;
      sendDate = sendDate.replace(/-/g, '');
      sendDate = sendDate.slice(0, -2);
      var getReportBody = {
        'app': sysid.INV.app_id.report,
        'query': 'report_key = "' + sendDate + '" order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
        .then(function (resp) {
          if (resp.records.length == 0) {
            //レポート新規作成
            var postReportData = [];
            var postInventoryListArray = [];
            var postReportBody = {
              'report_key': {
                'value': sendDate
              },
              'inventoryList': {
                'value': postInventoryListArray
              }
            }

            var shipSysCode = [];
            var shipDistributeCode = [];

            for (var dl in deviceList) {
              var shipSysData = {
                'sysCode': deviceList[dl].value.mCode.value + '-' + sysUCode,
                'shipNum': deviceList[dl].value.shipNum.value,
              }
              var shipDistributeData = {
                'sysCode': deviceList[dl].value.mCode.value + '-distribute',
                'shipNum': deviceList[dl].value.shipNum.value
              }
              shipSysCode.push(shipSysData);
              shipDistributeCode.push(shipDistributeData);
            }

            for (var ssc in shipSysCode) {
              //サブテーブル追加
              var postInventoryBody = {
                'value': {
                  'sys_code': shipSysCode[ssc].sysCode,
                  'stockLocation': PAGE_RECORD.shipment.value,
                  'shipNum': shipSysCode[ssc].shipNum
                }
              }
              postInventoryListArray.push(postInventoryBody);
            }

            for (var sdc in shipDistributeCode) {
              //distribute追加
              var postInventoryBody = {
                'value': {
                  'sys_code': shipDistributeCode[sdc].sysCode,
                  'stockLocation': '積送',
                  'arrivalNum': shipDistributeCode[sdc].shipNum
                }
              }
              postInventoryListArray.push(postInventoryBody);
            }

            postReportData.push(postReportBody);
            postRecords(sysid.INV.app_id.report, postReportData);
          } else {
            //レポート更新
            var putReportData = [];
            var putReportBody = {
              'updateKey': {
                'field': 'report_key',
                'value': sendDate
              },
              'record': {
                'inventoryList': {
                  'value': resp.records[0].inventoryList.value
                }
              }
            }

            var reportSysCode = [];
            var shipSysCode = [];
            var shipDistributeCode = [];

            var inventoryList = resp.records[0].inventoryList.value;
            for (var il in inventoryList) {
              var reportSysData = {
                'sysCode': inventoryList[il].value.sys_code.value,
                'rowId': inventoryList[il].id,
                'shipNum': inventoryList[il].value.shipNum.value
              }
              reportSysCode.push(reportSysData);
            }
            for (var dl in deviceList) {
              var shipSysData = {
                'sysCode': deviceList[dl].value.mCode.value + '-' + sysUCode,
                'shipNum': deviceList[dl].value.shipNum.value,
              }
              var shipDistributeData = {
                'sysCode': deviceList[dl].value.mCode.value + '-distribute',
                'shipNum': deviceList[dl].value.shipNum.value
              }
              shipSysCode.push(shipSysData);
              shipDistributeCode.push(shipDistributeData);
            }

            for (var ssc in shipSysCode) {
              //サブテーブル追加
              if (reportSysCode.some(item => item.sysCode === shipSysCode[ssc].sysCode)) {
                for (var il in putReportBody.record.inventoryList.value) {
                  if (putReportBody.record.inventoryList.value[il].value.sys_code.value == shipSysCode[ssc].sysCode) {
                    putReportBody.record.inventoryList.value[il].value.shipNum.value = parseInt(putReportBody.record.inventoryList.value[il].value.shipNum.value) + parseInt(shipSysCode[ssc].shipNum)
                  }
                }
              } else {
                var putInventoryBody = {
                  'value': {
                    'sys_code': shipSysCode[ssc].sysCode,
                    'stockLocation': PAGE_RECORD.shipment.value,
                    'shipNum': shipSysCode[ssc].shipNum
                  }
                }
                putReportBody.record.inventoryList.value.push(putInventoryBody);
              }
            }

            for (var sdc in shipDistributeCode) {
              //distribute追加
              if (reportSysCode.some(item => item.sysCode === shipDistributeCode[sdc].sysCode)) {
                for (var il in putReportBody.record.inventoryList.value) {
                  if (putReportBody.record.inventoryList.value[il].value.sys_code.value == shipDistributeCode[sdc].sysCode) {
                    putReportBody.record.inventoryList.value[il].value.arrivalNum.value = parseInt(putReportBody.record.inventoryList.value[il].value.arrivalNum.value) + parseInt(shipDistributeCode[sdc].shipNum)
                  }
                }
              } else {
                var putInventoryBody = {
                  'value': {
                    'sys_code': shipDistributeCode[sdc].sysCode,
                    'stockLocation': '積送',
                    'arrivalNum': shipDistributeCode[sdc].shipNum
                  }
                }
                putReportBody.record.inventoryList.value.push(putInventoryBody);
              }
            }
            putReportData.push(putReportBody);
            putRecords(sysid.INV.app_id.report, putReportData);
          }
        })
    }
    return event;
  });


  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], function (event) {
    setBtn('calBtn', '計算');

    $('#calBtn').on('click', function () {
      var eRecord = kintone.app.record.get();
      var shipTable = eRecord.record.deviceList.value;

      var lengthStr = '';
      var openType = '';
      var methodType = '';
      var shipNum = '';
      var mCode = shipTable[0].value.mCode.value;

      var numRegExp = new RegExp(/^([1-9]\d*|0)$/);
      var openRegExp = new RegExp(/^[sw]/i);
      var methodRegExp = new RegExp(/壁付[sw]|天井/i);

      if (numRegExp.test(shipTable[0].value.shipNum.value)) {
        shipNum = shipTable[0].value.shipNum.value;
        shipTable[0].value.shipNum.error = null;
      } else {
        shipTable[0].value.shipNum.error = '入力形式が間違えています';
      }

      // 品目にパッケージ品が存在する時
      if (mCode.match(/pkg_/)) {
        var pacInfo = {
          'app': sysid.INV.app_id.device,
          'query': 'mCode="' + mCode + '"',
        };

        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', pacInfo).then(function (resp) {
          var pcgItems = resp.records[0].packageComp.value;
          for (var pil in pcgItems) {
            shipTable.push({
              value: {
                mCode: {
                  type: "SINGLE_LINE_TEXT",
                  value: JSON.stringify(resp.records[0].packageComp.value[pil].value.pc_mCode.value).replace(/\"/g, '')
                },
                mName: {
                  type: "SINGLE_LINE_TEXT",
                  value: JSON.stringify(resp.records[0].packageComp.value[pil].value.pc_mName.value).replace(/\"/g, '')
                },
                mType: {
                  type: "SINGLE_LINE_TEXT",
                  value: JSON.stringify(resp.records[0].packageComp.value[pil].value.pc_mType.value).replace(/\"/g, '')
                },
                mVendor: {
                  type: "SINGLE_LINE_TEXT",
                  value: JSON.stringify(resp.records[0].packageComp.value[pil].value.pc_mVendor.value).replace(/\"/g, '')
                },
                shipNum: {
                  type: "NUMBER",
                  value: JSON.stringify(resp.records[0].packageComp.value[pil].value.pc_Num.value * shipNum).replace(/\"/g, '')
                },
                sNum: {
                  type: "MULTI_LINE_TEXT",
                  value: ''
                },
                shipMemo: {
                  type: "SINGLE_LINE_TEXT",
                  value: ''
                }
              }
            });

            var lookupCount = parseInt(pil) + 1;
            shipTable[lookupCount].value.mName.lookup = true;
          }

          kintone.app.record.set(eRecord);
          return resp;
        }).catch(function (error) {
          console.log(error);
          console.log(error.message);
        });
      }

      //品目コードがTRT-DYの時
      if (String(shipTable[0].value.mCode.value).match(/TRT-DY/)) {

        var railSpecs = (String(shipTable[0].value.sNum.value)).split(/,\n|\n/);
        var numCutter = railSpecs[0].indexOf('：')
        railSpecs[0] = railSpecs[0].slice(numCutter + 1);
        var openCutter = railSpecs[1].indexOf('：')
        railSpecs[1] = railSpecs[1].slice(openCutter + 1);
        var methodCutter = railSpecs[2].indexOf('：')
        railSpecs[2] = railSpecs[2].slice(methodCutter + 1);

        if (railSpecs[1] == '(S)片開き') {
          railSpecs[1] = 's';
        } else if (railSpecs[1] == '(W)両開き') {
          railSpecs[1] = 'w';
        } else {
          railSpecs[1] = '';
        }

        for (var i in railSpecs) {
          if (numRegExp.test(railSpecs[i])) {
            if (parseInt(railSpecs[i]) >= 580) {
              lengthStr = railSpecs[i];

              shipTable[0].value.sNum.error = null;
            } else {
              shipTable[0].value.sNum.error = '入力形式が間違えています';
              break;
            }
          } else {
            shipTable[0].value.sNum.error = '入力形式が間違えています';
          }

          if (openRegExp.test(railSpecs[i])) {
            if (railSpecs[i].length === 1) {
              openType = railSpecs[i];
              openType = openType.toLowerCase();

              shipTable[0].value.sNum.error = null;
            } else {
              shipTable[0].value.sNum.error = '入力形式が間違えています';
              break;
            }
          } else {
            shipTable[0].value.sNum.error = '入力形式が間違えています';
          }

          if (methodRegExp.test(railSpecs[i])) {
            if (railSpecs[i].match(/壁付s/i)) {
              methodType = '壁付s';
            } else if (railSpecs[i].match(/壁付w/i)) {
              methodType = '壁付w';
            } else {
              methodType = '天井';
            }
            shipTable[0].value.sNum.error = null;
          } else {
            shipTable[0].value.sNum.error = '入力形式が間違えています';
          }
        }
        var spec = {
          rLength: lengthStr,
          rType: openType,
          rMethod: methodType,
          shipNum: shipNum
        }

        console.log(spec);

        var railItems = railConf(spec);

        for (var ril in railItems) {
          shipTable.push({
            value: {
              mCode: {
                type: "SINGLE_LINE_TEXT",
                value: JSON.stringify(railItems[ril].value.mCode.value).replace(/\"/g, '')
              },
              mName: {
                type: "SINGLE_LINE_TEXT",
                value: JSON.stringify(railItems[ril].value.mName.value).replace(/\"/g, '')
              },
              mType: {
                type: "SINGLE_LINE_TEXT",
                value: JSON.stringify(railItems[ril].value.mType.value).replace(/\"/g, '')
              },
              mVendor: {
                type: "SINGLE_LINE_TEXT",
                value: JSON.stringify(railItems[ril].value.mVendor.value).replace(/\"/g, '')
              },
              sNum: {
                type: "MULTI_LINE_TEXT",
                value: JSON.stringify(railItems[ril].value.sNum.value).replace(/\"/g, '')
              },
              shipMemo: {
                type: "SINGLE_LINE_TEXT",
                value: JSON.stringify(railItems[ril].value.shipMemo.value).replace(/\"/g, '')
              },
              shipNum: {
                type: "NUMBER",
                value: JSON.stringify(railItems[ril].value.shipNum.value).replace(/\"/g, '')
              }
            }
          });
          var lookupCount = parseInt(ril) + 1;
          shipTable[lookupCount].value.mName.lookup = true;
        }
      }
      kintone.app.record.set(eRecord);
    });

    return event;
  });

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], function (event) {
    const PAGE_RECORD = event.record;
    if (PAGE_RECORD.shipType.value == '移動-販売' || PAGE_RECORD.shipType.value == '移動-サブスク') {
      //レポート連携
      var sendDate = PAGE_RECORD.sendDate.value;
      var deviceList = PAGE_RECORD.deviceList.value;
      var sysUCode = PAGE_RECORD.sys_uCode.value;
      sendDate = sendDate.replace(/-/g, '');
      sendDate = sendDate.slice(0, -2);
      var getReportBody = {
        'app': sysid.INV.app_id.report,
        'query': 'report_key = "' + sendDate + '" order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
        .then(function (resp) {
          console.log(resp.records);
          if (resp.records.length != 0) {
            //レポート更新
            var putReportData = [];
            var putReportBody = {
              'updateKey': {
                'field': 'report_key',
                'value': sendDate
              },
              'record': {
                'inventoryList': {
                  'value': resp.records[0].inventoryList.value
                }
              }
            }

            var reportSysCode = [];
            var shipSysCode = [];
            var shipDistributeCode = [];

            var inventoryList = resp.records[0].inventoryList.value;
            for (var il in inventoryList) {
              var reportSysData = {
                'sysCode': inventoryList[il].value.sys_code.value,
                'rowId': inventoryList[il].id,
                'shipNum': inventoryList[il].value.shipNum.value
              }
              reportSysCode.push(reportSysData);
            }
            for (var dl in deviceList) {
              var shipSysData = {
                'sysCode': deviceList[dl].value.mCode.value + '-' + sysUCode,
                'shipNum': deviceList[dl].value.shipNum.value,
              }
              var shipDistributeData = {
                'sysCode': deviceList[dl].value.mCode.value + '-distribute',
                'shipNum': deviceList[dl].value.shipNum.value
              }
              shipSysCode.push(shipSysData);
              shipDistributeCode.push(shipDistributeData);
            }

            for (var ssc in shipSysCode) {
              //サブテーブル追加
              if (reportSysCode.some(item => item.sysCode === shipSysCode[ssc].sysCode)) {
                for (var il in putReportBody.record.inventoryList.value) {
                  if (putReportBody.record.inventoryList.value[il].value.sys_code.value == shipSysCode[ssc].sysCode) {
                    putReportBody.record.inventoryList.value[il].value.shipNum.value = parseInt(putReportBody.record.inventoryList.value[il].value.shipNum.value) + parseInt(shipSysCode[ssc].shipNum)
                  }
                }
              } else {
                var putInventoryBody = {
                  'value': {
                    'sys_code': shipSysCode[ssc].sysCode,
                    'stockLocation': PAGE_RECORD.shipment.value,
                    'shipNum': shipSysCode[ssc].shipNum
                  }
                }
                putReportBody.record.inventoryList.value.push(putInventoryBody);
              }
            }

            for (var sdc in shipDistributeCode) {
              //distribute追加
              if (reportSysCode.some(item => item.sysCode === shipDistributeCode[sdc].sysCode)) {
                for (var il in putReportBody.record.inventoryList.value) {
                  if (putReportBody.record.inventoryList.value[il].value.sys_code.value == shipDistributeCode[sdc].sysCode) {
                    putReportBody.record.inventoryList.value[il].value.arrivalNum.value = parseInt(putReportBody.record.inventoryList.value[il].value.arrivalNum.value) + parseInt(shipDistributeCode[sdc].shipNum)
                  }
                }
              } else {
                var putInventoryBody = {
                  'value': {
                    'sys_code': shipDistributeCode[sdc].sysCode,
                    'stockLocation': '積送',
                    'arrivalNum': shipDistributeCode[sdc].shipNum
                  }
                }
                putReportBody.record.inventoryList.value.push(putInventoryBody);
              }
            }
            putReportData.push(putReportBody);
            putRecords(sysid.INV.app_id.report, putReportData);
          }
        });
    }
  });

})();