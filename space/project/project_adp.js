(function () {
  'use strict';

  //ステータス変更時
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    var nStatus = event.nextStatus.value;

    var stockData = stockCtrl(event, kintone.app.getId());
    console.log(stockData);

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

            // 入出荷管理に情報連携
            postRecords(sysid.INV.app_id.shipment, postShipData);

          } else if (nStatus == '完了') {
            if (event.record.salesType.value == '販売' || event.record.salesType.value == 'サブスク') {
              // var stockData = stockCtrl(event, kintone.app.getId());
              // console.log(stockData);
              //レポートクエリ
              // var getReportBody = {
              //   'app': sysid.INV.app_id.report,
              //   'query': 'sys_invoiceDate = "' + event.record.sys_invoiceDate.value + '" order by 更新日時 asc'
              // };
              // return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
              //   .then(function (resp) {
              //     if (resp.records.length != 0) {
              //       //更新レポート情報格納配列
              //       var reportStockData = [];
              //       //更新レポート情報
              //       var reportStockBody = {
              //         'id': resp.records[0].$id.value,
              //         'record': {
              //           'inventoryList': {
              //             'value': resp.records[0].inventoryList.value
              //           }
              //         }
              //       }
              //       for (var i in reportStockBody.record.inventoryList.value) {
              //         for (var j in stockData) {
              //           if (reportStockBody.record.inventoryList.value[i].value.sys_code.value == (stockData[j].mCode + '-distribute')) {
              //             reportStockBody.record.inventoryList.value[i].value.shipNum.value = stockData[j].shipNum
              //           }
              //         }
              //       }
              //       reportStockData.push(reportStockBody);
              //       putRecords(sysid.INV.app_id.report, reportStockData);
              //     }
              //   });
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