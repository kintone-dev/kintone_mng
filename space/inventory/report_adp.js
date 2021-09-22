(function () {
  'use strict';

  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], function (event) {
    var forecastList = event.record.forecastList.value;

    return api_getRecords(sysid.INV.app_id.device)
      .then(function (resp) {
        for (var i in resp.records) {
          if (!forecastList.some(item => item.value.forecast_mCode.value === resp.records[i].mCode.value)) {
            var newForecastListBody = {
              'value': {
                'forecast_mCode': {
                  'type': "SINGLE_LINE_TEXT",
                  'value': resp.records[i].mCode.value
                },
                'forecast_mName': {
                  'type': "SINGLE_LINE_TEXT",
                  'value': ''
                },
                'forecast_mStock': {
                  'type': "NUMBER",
                  'value': ''
                },
                'mOrderingPoint': {
                  'type': "NUMBER",
                  'value': ''
                },
                'mLeadTime': {
                  'type': "NUMBER",
                  'value': ''
                },
                'forecast_shipNum': {
                  'type': "NUMBER",
                  'value': ''
                },
                'forecast_arrival': {
                  'type': "NUMBER",
                  'value': ''
                },
                'afterLeadTimeStock': {
                  'type': "NUMBER",
                  'value': '2'
                },
                'remainingNum': {
                  'type': "NUMBER",
                  'value': '2'
                }
              }
            }
            forecastList.push(newForecastListBody);
          }
        }
        for (var i in forecastList) {
          forecastList[i].value.forecast_mCode.lookup = true;
        }
        return event;
      });
  });

  kintone.events.on(['app.record.edit.submit', 'app.record.create.submit'], function (event) {

    if (event.record.EoMcheck.value == '締切') {
      /**
       * 特定の拠点を削除
       */
      var inventoryList = event.record.inventoryList.value;
      var newList = [];
      //特定の拠点以外を抜き出して再度格納
      for (var i in inventoryList) {
        if (inventoryList[i].value.stockLocation.value != '〇〇〇〇') {
          newList.push(inventoryList[i]);
        }
      }

      event.record.inventoryList.value = newList;

      return event;
    } else if (event.record.EoMcheck.value == '一時確認') {
      // 製品別在庫残数処理
      var reportDate = new Date(event.record.invoiceYears.value, event.record.invoiceMonth.value);

      for (var i in event.record.forecastList.value) {
        var mLeadTime = event.record.forecastList.value[i].value.mLeadTime.value;
        var queryYears = String(reportDate.getFullYear());
        var queryMonth = String(("0" + (reportDate.getMonth() + parseInt(mLeadTime))).slice(-2));
        var month31 = ['1', '3', '5', '7', '8', '10', '12'];
        if (parseInt(queryMonth) > 12) {
          queryMonth = parseInt(queryMonth) - 12;
        }
        if (month31.includes(queryMonth)) {
          var queryDate = 31;
        } else {
          var queryDate = 30;
        }
        var queryDate = queryYears + '-' + queryMonth + '-' + queryMonth;
        var getPurchasingBody = {
          'app': sysid.INV.app_id.purchasing,
          'query': 'arrivalDate <= "' + queryDate + '" and ステータス in ("仕入完了")'
        }
        kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getPurchasingBody, function (resp) {
          console.log(resp);
          var forecast_mCode = event.record.forecastList.value[i].value.forecast_mCode.value;
          var totalArrivalNum = 0;
          for (var j in resp.records) {
            for (var k in resp.records[j].arrivalList.value) {
              if (forecast_mCode == resp.records[j].arrivalList.value[k].value.mCode.value) {
                totalArrivalNum = parseInt(totalArrivalNum) + parseInt(resp.records[j].arrivalList.value[k].value.arrivalNum.value);
              }
            }
          }
          event.record.forecastList.value[i].value.forecast_arrival.value = totalArrivalNum;
          console.log(event.record.forecastList.value[i].value.forecast_arrival.value);
          return event;
        }, function (e) {
          console.error(e);
        });
      }

      return event;
    }
  });

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], function (event) {

    // レポートが締切の場合
    if (event.record.EoMcheck.value == '締切') {
      /**
       * 次月のレポート作成処理
       */
      const REPORT_KEY_YEAR = event.record.invoiceYears.value;
      const REPORT_KEY_MONTH = event.record.invoiceMonth.value;
      var reportDate = new Date(REPORT_KEY_YEAR, REPORT_KEY_MONTH);
      const NEXT_DATE = String(reportDate.getFullYear()) + String(("0" + (reportDate.getMonth() + 1)).slice(-2));
      // 次月のレポートを取得
      var getNextMonthReportBody = {
        'app': sysid.INV.app_id.report,
        'query': 'sys_invoiceDate = "' + NEXT_DATE + '" order by 更新日時 asc'
      };
      return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getNextMonthReportBody)
        .then(function (resp) {
          const NEXTREPORT_RECORD = resp.records[0];
          if (resp.records.length == 0) {
            //次月のレポートがない場合
            var postNewReportData = [];
            var postNewReport_listArray = [];
            var postNewReport_body = {
              'invoiceYears': {
                'value': String(reportDate.getFullYear())
              },
              'invoiceMonth': {
                'value': String(("0" + (reportDate.getMonth() + 1)).slice(-2))
              },
              'inventoryList': {
                'value': postNewReport_listArray
              }
            };
            for (var pil in event.record.inventoryList.value) {
              //差引数量が0以下のものは次月に載せない
              if (parseInt(event.record.inventoryList.value[pil].value.deductionNum.value) > 0) {
                var postNewReport_listArray_body = {
                  'value': {
                    'sys_code': {
                      'value': event.record.inventoryList.value[pil].value.sys_code.value
                    },
                    'mCode': {
                      'value': event.record.inventoryList.value[pil].value.mCode.value
                    },
                    'stockLocation': {
                      'value': event.record.inventoryList.value[pil].value.stockLocation.value
                    },
                    'memo': {
                      'value': event.record.inventoryList.value[pil].value.memo.value
                    },
                    'mLastStock': {
                      'value': event.record.inventoryList.value[pil].value.deductionNum.value
                    }
                  }
                };
                postNewReport_listArray.push(postNewReport_listArray_body);
              }
            }
            postNewReportData.push(postNewReport_body);
            //次月のレポートを作成
            postRecords(sysid.INV.app_id.report, postNewReportData);
          } else {
            //次月のレポートがある場合
            var putNewReportData = [];
            var putNewReport_body = {
              'id': NEXTREPORT_RECORD.$id.value,
              'record': {
                'inventoryList': {
                  'value': NEXTREPORT_RECORD.inventoryList.value
                }
              }
            };

            var nowMonthSyscode = [];
            var nextMonthSyscode = [];

            for (var nil in putNewReport_body.record.inventoryList.value) {
              nextMonthSyscode.push(putNewReport_body.record.inventoryList.value[nil].value.sys_code.value);
            }
            for (var nil in event.record.inventoryList.value) {
              var nowMonthData = {
                'sysCode': event.record.inventoryList.value[nil].value.sys_code.value,
                'location': event.record.inventoryList.value[nil].value.stockLocation.value,
                'memo': event.record.inventoryList.value[nil].value.memo.value,
                'mCode': event.record.inventoryList.value[nil].value.mCode.value,
                'deductionNum': event.record.inventoryList.value[nil].value.deductionNum.value,
              }
              nowMonthSyscode.push(nowMonthData);
            }

            for (var ril in event.record.inventoryList.value) {
              if (nextMonthSyscode.includes(nowMonthSyscode[ril].sysCode)) {
                for (var nil in putNewReport_body.record.inventoryList.value) {
                  if (putNewReport_body.record.inventoryList.value[nil].value.sys_code.value == event.record.inventoryList.value[ril].value.sys_code.value) {
                    putNewReport_body.record.inventoryList.value[nil].value.mLastStock.value = event.record.inventoryList.value[ril].value.deductionNum.value
                    putNewReport_body.record.inventoryList.value[nil].value.mCode.value = event.record.inventoryList.value[ril].value.mCode.value
                    putNewReport_body.record.inventoryList.value[nil].value.stockLocation.value = event.record.inventoryList.value[ril].value.stockLocation.value
                    putNewReport_body.record.inventoryList.value[nil].value.memo.value = event.record.inventoryList.value[ril].value.memo.value
                  }
                }
              } else {
                //差引数量が0以下のものは次月に載せない
                if (parseInt(event.record.inventoryList.value[ril].value.deductionNum.value) > 0) {
                  var putNewInventoryBody = {
                    'value': {
                      'sys_code': nowMonthSyscode[ril].sysCode,
                      'stockLocation': nowMonthSyscode[ril].location,
                      'memo': nowMonthSyscode[ril].memo,
                      'mCode': nowMonthSyscode[ril].mCode,
                      'mLastStock': nowMonthSyscode[ril].deductionNum,
                    }
                  }
                  putNewReport_body.record.inventoryList.value.push(putNewInventoryBody);
                }
              }
            }

            putNewReportData.push(putNewReport_body);
            //次月のレポートを更新
            putRecords(sysid.INV.app_id.report, putNewReportData);
          }

          return event;
        });
    } else {
      return event;
    }
  });
})();