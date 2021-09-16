(function () {
  'use strict';

  //ステータス変更時
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const PAGE_RECORD = event.record;
    var nStatus = event.nextStatus.value;
    //ステータスが納品準備中の場合
    if (nStatus === '納品準備中') {
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
      }
      for (var pdv in PAGE_RECORD.deviceList.value) {
        var devListBody = {
          'value': {
            'mName': {
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
      postRecords(sysid.INV.app_id.shipment, postShipData);
    } else if (nStatus === '完了') {
      //積送在庫処理
      var stockData = []
      //納品リストからmCodeと納品数を取得
      for (var i in PAGE_RECORD.deviceList.value) {
        var stockBody = {
          'mCode': PAGE_RECORD.deviceList.value[i].value.mCode.value,
          'shipNum': PAGE_RECORD.deviceList.value[i].value.shipNum.value
        }
        stockData.push(stockBody);
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
            console.log(JSON.stringify(totalStockData, null, '\t'));

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
                if (totalStockData[j].mCode == deviceStockBody.updateKey.field) {
                  for(var k in deviceStockBody.record.uStockList.value){
                    if(deviceStockBody.record.uStockList.value[k].value.uCode == 'distribute'){
                      deviceStockBody.record.uStockList.value[k].value.uStock = totalStockData[j].stockNum
                      console.log(deviceStockBody.record.uStockList.value[k].value.uStock);
                    }
                  }
                }
              }
              deviceStockData.push(deviceStockBody);
            }

            console.log(JSON.stringify(unitStockData, null, '\t'));
            console.log(JSON.stringify(deviceStockData, null, '\t'));
          });
        });
    }
  });

  //保存ボタン押下時、対応したレポートが締め切り済の場合保存できないように
  kintone.events.on(['app.record.edit.submit', 'app.record.create.submit'], function (event) {
    const PAGE_RECORD = event.record;
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
            } else {
              return event;
            }
          }
        } else {
          return event;
        }
      });

  });

})();