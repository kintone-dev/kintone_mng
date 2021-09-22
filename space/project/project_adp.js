(function () {
  'use strict';

  //ステータス変更時
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    var nStatus = event.nextStatus.value;

    //入出荷管理に追加
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'sys_invoiceDate = "' + event.record.sys_invoiceDate.value + '" order by 更新日時 asc'
    };
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
      .then(function (resp) {
        if (resp.records != 0) {
          for (var i in resp.records[0].EoMcheck.value) {
            if (resp.records[0].EoMcheck.value[i] == '締切') {
              event.error = '対応した日付のレポートは締切済みです。';
              return event;
            }
          }
          //ステータスが納品準備中の場合
          if (nStatus == '納品準備中') {
            var postShipData = [];
            var postShipBody = {
              'aboutDelivery': {
                'value': event.record.aboutDelivery.value
              },
              'tarDate': {
                'value': event.record.tarDate.value
              },
              'dstSelection': {
                'value': event.record.dstSelection.value
              },
              'Contractor': {
                'value': event.record.Contractor.value
              },
              'instName': {
                'value': event.record.instName.value
              },
              'receiver': {
                'value': event.record.receiver.value
              },
              'phoneNum': {
                'value': event.record.phoneNum.value
              },
              'zipcode': {
                'value': event.record.zipcode.value
              },
              'prefectures': {
                'value': event.record.prefectures.value
              },
              'city': {
                'value': event.record.city.value
              },
              'address': {
                'value': event.record.address.value
              },
              'buildingName': {
                'value': event.record.buildingName.value
              },
              'corpName': {
                'value': event.record.corpName.value
              },
              'sys_instAddress': {
                'value': event.record.sys_instAddress.value
              },
              'sys_unitAddress': {
                'value': event.record.sys_unitAddress.value
              },
              'deviceList': {
                'value': []
              },
              'prjId': {
                'value': event.record.$id.value
              }
            }
            for (var i in event.record.deviceList.value) {
              if (event.record.deviceList.value[i].value.subBtn.value == '通常') {
                var devListBody = {
                  'value': {
                    'mNickname': {
                      'value': event.record.deviceList.value[i].value.mNickname.value
                    },
                    'shipNum': {
                      'value': event.record.deviceList.value[i].value.shipNum.value
                    }
                  }
                }
                postShipBody.deviceList.value.push(devListBody);
              }
            }

            var postShipSubBody = {
              'shipType': {
                'value': '移動-拠点間'
              },
              'aboutDelivery': {
                'value': event.record.aboutDelivery.value
              },
              'tarDate': {
                'value': event.record.tarDate.value
              },
              'dstSelection': {
                'value': event.record.dstSelection.value
              },
              'Contractor': {
                'value': '社内・社員予備機'
              },
              'instName': {
                'value': event.record.instName.value
              },
              'receiver': {
                'value': event.record.receiver.value
              },
              'phoneNum': {
                'value': event.record.phoneNum.value
              },
              'zipcode': {
                'value': event.record.zipcode.value
              },
              'prefectures': {
                'value': event.record.prefectures.value
              },
              'city': {
                'value': event.record.city.value
              },
              'address': {
                'value': event.record.address.value
              },
              'buildingName': {
                'value': event.record.buildingName.value
              },
              'corpName': {
                'value': event.record.corpName.value
              },
              'sys_instAddress': {
                'value': event.record.sys_instAddress.value
              },
              'sys_unitAddress': {
                'value': event.record.sys_unitAddress.value
              },
              'deviceList': {
                'value': []
              },
              'prjId': {
                'value': event.record.$id.value + '-sub'
              }
            }
            for (var i in event.record.deviceList.value) {
              if (event.record.deviceList.value[i].value.subBtn.value == '予備') {
                var devListBody = {
                  'value': {
                    'mNickname': {
                      'value': event.record.deviceList.value[i].value.mNickname.value
                    },
                    'shipNum': {
                      'value': event.record.deviceList.value[i].value.shipNum.value
                    },
                    'shipRemarks': {
                      'value': '社員予備'
                    }
                  }
                }
                postShipSubBody.deviceList.value.push(devListBody);
              }
            }

            postShipData.push(postShipBody);
            if (postShipSubBody.deviceList.value.length != 0) {
              postShipData.push(postShipSubBody);
            }

            console.log(postShipData);

            // 入出荷管理に情報連携
            var postBody = {
              'app': sysid.INV.app_id.shipment,
              'records': postShipData,
            }

            return kintone.api(kintone.api.url('/k/v1/records', true), "POST", postBody)
              .then(function (resp) {
                console.log(resp);
                var putStatusData = {
                  'app': sysid.PM.app_id.shipment,
                  'records':[]
                }
                for(var i in resp.ids){
                  var putStatusBody ={
                    'id': resp.ids[i],
                    'action': '処理開始'
                  }
                  putStatusData.records.push(putStatusBody);
                }

                kintone.api(kintone.api.url('/k/v1/records/status.json', true), "PUT", putStatusData);
              });

          } else if (nStatus == '完了') {
            if (event.record.salesType.value == '販売' || event.record.salesType.value == 'サブスク') {
              //積送在庫処理
              var stockData = []
              //納品リストからmCodeと納品数を取得
              for (var i in event.record.deviceList.value) {
                if (event.record.deviceList.value[i].value.subBtn.value == '通常') {
                  var stockBody = {
                    'mCode': event.record.deviceList.value[i].value.mCode.value,
                    'shipNum': event.record.deviceList.value[i].value.shipNum.value
                  }
                  stockData.push(stockBody);
                }
              }
              var getDistributeBody = {
                'app': sysid.INV.app_id.unit,
                //積送拠点のid
                'id': 3
              };
              // 積送拠点の情報取得
              return kintone.api(kintone.api.url('/k/v1/record.json', true), 'GET', getDistributeBody)
                .then(function (resp) {
                  var distRecord = resp.record;
                  var unitStockData = [];
                  //在庫情報
                  var totalStockData = [];
                  var unitStockBody = {
                    'updateKey': {
                      'field': 'uCode',
                      'value': 'distribute'
                    },
                    'record': {
                      'mStockList': {
                        'value': distRecord.mStockList.value
                      }
                    }
                  }

                  for (var i in unitStockBody.record.mStockList.value) {
                    for (var j in stockData) {
                      //積送拠点の在庫mCodeと案件管理の納品リストmCodeが一致した時
                      if (stockData[j].mCode == unitStockBody.record.mStockList.value[i].value.mCode.value) {
                        //在庫数書き換え
                        unitStockBody.record.mStockList.value[i].value.mStock.value = parseInt(unitStockBody.record.mStockList.value[i].value.mStock.value || 0) - parseInt(stockData[j].shipNum || 0);
                        var totalStockBody = {
                          'mCode': unitStockBody.record.mStockList.value[i].value.mCode.value,
                          'stockNum': unitStockBody.record.mStockList.value[i].value.mStock.value
                        }
                        totalStockData.push(totalStockBody);
                      }
                    }
                  }
                  //拠点在庫情報のbodyをset
                  unitStockData.push(unitStockBody);

                  //商品管理情報クエリ
                  var deviceQuery = [];
                  for (var i in stockData) {
                    deviceQuery.push('"' + stockData[i].mCode + '"');
                  }
                  var getDeviceBody = {
                    'app': sysid.INV.app_id.device,
                    'query': 'mCode in (' + deviceQuery.join() + ') order by 更新日時 asc'
                  };

                  //商品管理情報取得
                  return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getDeviceBody)
                    .then(function (resp) {
                      var deviceRecords = resp.records;
                      var deviceStockData = [];

                      for (var i in deviceRecords) {
                        var deviceStockBody = {
                          'updateKey': {
                            'field': 'mCode',
                            'value': deviceRecords[i].mCode.value
                          },
                          'record': {
                            'uStockList': {
                              'value': deviceRecords[i].uStockList.value
                            }
                          }
                        }
                        for (var j in totalStockData) {
                          if (totalStockData[j].mCode == deviceStockBody.updateKey.value) {
                            for (var k in deviceStockBody.record.uStockList.value) {
                              if (deviceStockBody.record.uStockList.value[k].value.uCode.value == 'distribute') {
                                deviceStockBody.record.uStockList.value[k].value.uStock.value = totalStockData[j].stockNum
                              }
                            }
                          }
                        }
                        //商品在庫情報のbodyをset
                        deviceStockData.push(deviceStockBody);
                      }

                      //レポートクエリ
                      var getReportBody = {
                        'app': sysid.INV.app_id.report,
                        'query': 'sys_invoiceDate = "' + event.record.sys_invoiceDate.value + '" order by 更新日時 asc'
                      };
                      return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
                        .then(function (resp) {
                          if (resp.records.length != 0) {
                            //更新レポート情報格納配列
                            var reportStockData = [];
                            //更新レポート情報
                            var reportStockBody = {
                              'id': resp.records[0].$id.value,
                              'record': {
                                'inventoryList': {
                                  'value': resp.records[0].inventoryList.value
                                }
                              }
                            }
                            for (var i in reportStockBody.record.inventoryList.value) {
                              for (var j in stockData) {
                                if (reportStockBody.record.inventoryList.value[i].value.sys_code.value == (stockData[j].mCode + '-distribute')) {
                                  reportStockBody.record.inventoryList.value[i].value.shipNum.value = stockData[j].shipNum
                                }
                              }
                            }
                            reportStockData.push(reportStockBody);
                            putRecords(sysid.INV.app_id.unit, unitStockData);
                            putRecords(sysid.INV.app_id.device, deviceStockData);
                            putRecords(sysid.INV.app_id.report, reportStockData);
                          }
                        });
                    });
                });
            }
          }
        }
      });
  });

  //保存ボタン押下時、対応したレポートが締め切り済の場合保存できないように
  kintone.events.on(['app.record.edit.submit', 'app.record.create.submit'], function (event) {

    //対応レポート取得
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'sys_invoiceDate = "' + event.record.sys_invoiceDate.value + '" order by 更新日時 asc'
    };
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
      .then(function (resp) {
        if (resp.records != 0) {
          if (resp.records[0].EoMcheck.value != 0) {
            event.error = '対応した日付のレポートは月末処理締切済みです。';
            return event;
          } else {
            return event;
          }
        } else {
          return event;
        }
      });
  });

  //保存ボタン押下時、請求月が今より過去の場合
  kintone.events.on(['app.record.edit.submit', 'app.record.create.submit'], function (event) {

    $.ajax({
      type: 'GET',
      async: false
    }).done(function (data, status, xhr) {
      //請求月が今より過去の場合
      var serverDate = new Date(xhr.getResponseHeader('Date')); //サーバー時刻を代入
      var nowDateFormat = String(serverDate.getFullYear()) + String(("0" + (serverDate.getMonth() + 1)).slice(-2));
      if (parseInt(nowDateFormat) > parseInt(event.record.sys_invoiceDate.value)) {
        event.error = '請求月が間違っています。';
        return event;
      }
    });
    return event;
  });

})();