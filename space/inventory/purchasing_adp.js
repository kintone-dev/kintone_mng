(function () {
  'use strict';

  // kintone.events.on('app.record.detail.process.proceed', function (event) {
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], function (event) {
    const PAGE_RECORD = event.record;
    var sendDate = PAGE_RECORD.arrivalDate.value;
    sendDate = sendDate.replace(/-/g, '');
    sendDate = sendDate.slice(0, -2);
    // var nStatus = event.nextStatus.value;

    // if(nStatus==="仕入完了"){
    //同じ月のレポート情報取得
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'sys_invoiceDate = "' + sendDate + '" order by 更新日時 asc'
    };
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
      .then(function (resp) {
        var reportRecords = resp.records;
        if (reportRecords.length != 0) {
          for (var i in reportRecords[0].EoMcheck.value) {
            if (reportRecords[0].EoMcheck.value[i] == '締切') {
              event.error = '対応した日付のレポートは締切済みです。';
              return event;
            }
          }

          var arrivalList = PAGE_RECORD.arrivalList.value;
          // 商品管理に情報連携
          var deviceQuery = [];
          for (var i in arrivalList) {
            deviceQuery.push('"' + arrivalList[i].value.mCode.value + '"');
          }
          var getDeviceBody = {
            'app': sysid.INV.app_id.device,
            'query': 'mCode in (' + deviceQuery.join() + ') order by 更新日時 asc'
          };
          // 商品情報取得
          return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getDeviceBody)
            .then(function (resp) {
              var deviceRecords = resp.records;
              var putDevData = [];
              for (var i in arrivalList) {
                for (var j in deviceRecords) {
                  if (arrivalList[i].value.mCode.value == deviceRecords[j].mCode.value) {
                    var putDevBody = {
                      'updateKey': {
                        'field': 'mCode',
                        'value': arrivalList[i].value.mCode.value
                      },
                      'record': {
                        'mCost': {
                          'value': arrivalList[i].value.totalUnitCost.value
                        },
                        'mCostUpdate': {
                          'value': PAGE_RECORD.arrivalDate.value
                        },
                        'deviceCost': {
                          'value': arrivalList[i].value.unitPrice.value
                        },
                        'deviceCost_foreign': {
                          'value': arrivalList[i].value.unitPrice_foreign.value
                        },
                        'importExpenses': {
                          'value': arrivalList[i].value.addiUnitExpenses.value
                        },
                        'developCost': {
                          'value': arrivalList[i].value.addiCost.value
                        },
                        'uStockList': {
                          'value': deviceRecords[j].uStockList.value
                        }
                      }
                    }
                    putDevData.push(putDevBody);
                  }
                }
              }

              var stockData = []
              for (var i in putDevData) {
                for (var j in putDevData[i].record.uStockList.value) {
                  for (var k in arrivalList) {
                    if (arrivalList[k].value.mCode.value == putDevData[i].updateKey.value) {
                      if (putDevData[i].record.uStockList.value[j].value.uCode.value == arrivalList[k].value.uCode.value) {
                        putDevData[i].record.uStockList.value[j].value.uStock.value = parseInt(putDevData[i].record.uStockList.value[j].value.uStock.value || 0) + parseInt(arrivalList[k].value.arrivalNum.value || 0);
                        var stockBody = {
                          'mCode': putDevData[i].updateKey.value,
                          'uCode': putDevData[i].record.uStockList.value[j].value.uCode.value,
                          'sysCode': putDevData[i].updateKey.value + '-' + putDevData[i].record.uStockList.value[j].value.uCode.value,
                          'arrivalNum':arrivalList[k].value.arrivalNum.value,
                          'stockNum': putDevData[i].record.uStockList.value[j].value.uStock.value
                        }
                        stockData.push(stockBody);
                      }
                    }
                  }
                }
              }

              // 拠点管理に情報連携
              var unitQuery = [];
              for (var i in arrivalList) {
                unitQuery.push('"' + arrivalList[i].value.uCode.value + '"');
              }
              var getUnitBody = {
                'app': sysid.INV.app_id.unit,
                'query': 'uCode in (' + unitQuery.join() + ') order by 更新日時 asc'
              };
              kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getUnitBody)
                .then(function (resp) {
                  var unitRecords = resp.records;
                  var putUniData = [];
                  for (var i in unitRecords) {
                    var putUniBody = {
                      'updateKey': {
                        'field': 'uCode',
                        'value': unitRecords[i].uCode.value
                      },
                      'record': {
                        'mStockList': {
                          'value': unitRecords[i].mStockList.value
                        }
                      }
                    }
                    putUniData.push(putUniBody);
                  }

                  for (var i in putUniData) {
                    for (var j in putUniData[i].record.mStockList.value) {
                      for (var k in stockData) {
                        if (stockData[k].uCode == putUniData[i].updateKey.value) {
                          if (putUniData[i].record.mStockList.value[j].value.mCode.value == stockData[k].mCode) {
                            putUniData[i].record.mStockList.value[j].value.mStock.value = stockData[k].stockNum;
                          }
                        }
                      }
                    }
                  }

                  // 月次処理に情報連携
                  var putRepoData = [];
                  var putRepoBody = {
                    'id':reportRecords[0].$id.value,
                    'record': {
                      'inventoryList': {
                        'value': reportRecords[0].inventoryList.value
                      }
                    }
                  }

                  for(var i in putRepoBody.record.inventoryList.value){
                    for(var j in stockData){
                      if(putRepoBody.record.inventoryList.value[i].value.sys_code.value == stockData[j].sysCode){
                        putRepoBody.record.inventoryList.value[i].value.arrivalNum.value = stockData[j].arrivalNum
                      }
                    }
                  }

                  putRepoData.push(putRepoBody);

                  console.log(JSON.stringify(putRepoData, null, '\t'));
                  console.log(JSON.stringify(stockData, null, '\t'));
                  // putRecords(sysid.INV.app_id.device, putDevData);
                  // putRecords(sysid.INV.app_id.unit, putUniData);
                  // putRecords(sysid.INV.app_id.report, putRepoData);
                });
            });
        }
      });
    // }
  });
})();