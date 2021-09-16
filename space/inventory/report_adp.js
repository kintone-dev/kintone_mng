(function () {
  'use strict';

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], function (event) {
    const REPORT_RECORD = event.record;
    // レポートが締切の場合
    if (REPORT_RECORD.EoMcheck.value == '締切' || REPORT_RECORD.EoMcheck.value == '一時確認') {
      const REPORT_KEY_YEAR = REPORT_RECORD.invoiceYears.value;
      const REPORT_KEY_MONTH = REPORT_RECORD.invoiceMonth.value;
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
            for (var pil in REPORT_RECORD.inventoryList.value) {
              if(parseInt(REPORT_RECORD.inventoryList.value[pil].value.deductionNum.value)  > 0){
                var postNewReport_listArray_body = {
                  'value': {
                    'sys_code': {
                      'value': REPORT_RECORD.inventoryList.value[pil].value.sys_code.value
                    },
                    'mCode': {
                      'value': REPORT_RECORD.inventoryList.value[pil].value.mCode.value
                    },
                    'stockLocation': {
                      'value': REPORT_RECORD.inventoryList.value[pil].value.stockLocation.value
                    },
                    'memo': {
                      'value': REPORT_RECORD.inventoryList.value[pil].value.memo.value
                    },
                    'mLastStock': {
                      'value': REPORT_RECORD.inventoryList.value[pil].value.deductionNum.value
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
              'updateKey': {
                'field': 'sys_invoiceDate',
                'value': NEXT_DATE
              },
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
            for (var nil in REPORT_RECORD.inventoryList.value) {
              var nowMonthData = {
                'sysCode': REPORT_RECORD.inventoryList.value[nil].value.sys_code.value,
                'location': REPORT_RECORD.inventoryList.value[nil].value.stockLocation.value,
                'memo': REPORT_RECORD.inventoryList.value[nil].value.memo.value,
                'mCode': REPORT_RECORD.inventoryList.value[nil].value.mCode.value,
                'deductionNum': REPORT_RECORD.inventoryList.value[nil].value.deductionNum.value,
              }

              nowMonthSyscode.push(nowMonthData);
            }

            for (var ril in REPORT_RECORD.inventoryList.value) {
              if (nextMonthSyscode.includes(nowMonthSyscode[ril].sysCode)) {
                for (var nil in putNewReport_body.record.inventoryList.value) {
                  if (putNewReport_body.record.inventoryList.value[nil].value.sys_code.value == REPORT_RECORD.inventoryList.value[ril].value.sys_code.value) {
                    putNewReport_body.record.inventoryList.value[nil].value.mLastStock.value = REPORT_RECORD.inventoryList.value[ril].value.deductionNum.value
                    putNewReport_body.record.inventoryList.value[nil].value.mCode.value = REPORT_RECORD.inventoryList.value[ril].value.mCode.value
                    putNewReport_body.record.inventoryList.value[nil].value.stockLocation.value = REPORT_RECORD.inventoryList.value[ril].value.stockLocation.value
                    putNewReport_body.record.inventoryList.value[nil].value.memo.value = REPORT_RECORD.inventoryList.value[ril].value.memo.value
                  }
                }
              } else {
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