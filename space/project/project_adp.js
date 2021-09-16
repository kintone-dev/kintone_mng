(function () {
  'use strict';

  //ステータス変更時
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const PAGE_RECORD = event.record;
    var nStatus = event.nextStatus.value;
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'sys_invoiceDate = "' + PAGE_RECORD.sys_invoiceDate.value + '" order by 更新日時 asc'
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
                'value': PAGE_RECORD.aboutDelivery.value
              },
              'tarDate': {
                'value': PAGE_RECORD.tarDate.value
              },
              'dstSelection': {
                'value': PAGE_RECORD.dstSelection.value
              },
              'Contractor': {
                'value': PAGE_RECORD.Contractor.value
              },
              'instName': {
                'value': PAGE_RECORD.instName.value
              },
              'receiver': {
                'value': PAGE_RECORD.receiver.value
              },
              'phoneNum': {
                'value': PAGE_RECORD.phoneNum.value
              },
              'zipcode': {
                'value': PAGE_RECORD.zipcode.value
              },
              'prefectures': {
                'value': PAGE_RECORD.prefectures.value
              },
              'city': {
                'value': PAGE_RECORD.city.value
              },
              'address': {
                'value': PAGE_RECORD.address.value
              },
              'buildingName': {
                'value': PAGE_RECORD.buildingName.value
              },
              'corpName': {
                'value': PAGE_RECORD.corpName.value
              },
              'sys_instAddress': {
                'value': PAGE_RECORD.sys_instAddress.value
              },
              'sys_unitAddress': {
                'value': PAGE_RECORD.sys_unitAddress.value
              },
              'deviceList': {
                'value': []
              },
              'prjId': {
                'value': PAGE_RECORD.$id.value
              }
            }
            for (var pdv in PAGE_RECORD.deviceList.value) {
              var devListBody = {
                'value': {
                  'mNickname': {
                    'value': PAGE_RECORD.deviceList.value[pdv].value.mNickname.value
                  },
                  'shipNum': {
                    'value': PAGE_RECORD.deviceList.value[pdv].value.shipNum.value
                  }
                }
              }
              postShipBody.deviceList.value.push(devListBody);
            }

            postShipData.push(postShipBody);
            // 入出荷管理に情報連携
            return postRecords(sysid.INV.app_id.shipment, postShipData);

          } else if (nStatus == '完了') {
            if (PAGE_RECORD.salesType.value == '販売' || PAGE_RECORD.salesType.value == 'サブスク') {
              //積送在庫処理
              var stockData = []
              //納品リストからmCodeと納品数を取得
              for (var i in PAGE_RECORD.deviceList.value) {
                if (PAGE_RECORD.deviceList.value[i].value.subBtn.value == '通常') {
                  var stockBody = {
                    'mCode': PAGE_RECORD.deviceList.value[i].value.mCode.value,
                    'shipNum': PAGE_RECORD.deviceList.value[i].value.shipNum.value
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
                        'query': 'sys_invoiceDate = "' + PAGE_RECORD.sys_invoiceDate.value + '" order by 更新日時 asc'
                      };
                      return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
                        .then(function (resp) {
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
    const PAGE_RECORD = event.record;

    //請求月が今より過去の場合
    var nowDate = new Date();
    var nowDateFormat = String(nowDate.getFullYear()) + String(("0"+(nowDate.getMonth() + 1)).slice(-2));
    if(parseInt(nowDateFormat) > parseInt(PAGE_RECORD.sys_invoiceDate.value)){
      event.error = '請求月が間違っています。';
      return event;
    }
    //対応レポート取得
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'sys_invoiceDate = "' + PAGE_RECORD.sys_invoiceDate.value + '" order by 更新日時 asc'
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

  kintone.events.on(['app.record.detail.show'], function (event) {
    const PAGE_RECORD = event.record;

    //請求月が今より過去の場合
    var nowDate = new Date();
    var nowDateFormat = String(nowDate.getFullYear()) + String(("0"+(nowDate.getMonth() + 1)).slice(-2));
    if(parseInt(nowDateFormat) > parseInt(PAGE_RECORD.sys_invoiceDate.value)){
      alert('昔の請求書です。');
      return event;
    }
  });

})();