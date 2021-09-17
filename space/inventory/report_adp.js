(function () {
  'use strict';

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], function (event) {
    const PAGE_RECORD = event.record;
    // レポートが締切か一時確認の場合
    if (PAGE_RECORD.EoMcheck.value == '締切') {
      /**
       * 特定の拠点を削除
       */
      var inventoryList = PAGE_RECORD.inventoryList.value;
      var newListData = {
        'id': PAGE_RECORD.$id.value,
        'record':{
          'inventoryList': {
            'value': []
          }
        }
      }
      var newList = []
      //特定の拠点以外を抜き出して再度格納
      for(var i in inventoryList){
        if(inventoryList[i].value.stockLocation.value != '矢倉倉庫'){
          newList.push(inventoryList[i]);
        }
      }

      newListData.record.inventoryList.value = newList;
      PAGE_RECORD.inventoryList.value = newList;

      putRecords(sysid.INV.app_id.report,newListData);

      /**
       * 次月のレポート作成処理
       */
      const REPORT_KEY_YEAR = PAGE_RECORD.invoiceYears.value;
      const REPORT_KEY_MONTH = PAGE_RECORD.invoiceMonth.value;
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
            for (var pil in PAGE_RECORD.inventoryList.value) {
              if(parseInt(PAGE_RECORD.inventoryList.value[pil].value.deductionNum.value)  > 0){
                var postNewReport_listArray_body = {
                  'value': {
                    'sys_code': {
                      'value': PAGE_RECORD.inventoryList.value[pil].value.sys_code.value
                    },
                    'mCode': {
                      'value': PAGE_RECORD.inventoryList.value[pil].value.mCode.value
                    },
                    'stockLocation': {
                      'value': PAGE_RECORD.inventoryList.value[pil].value.stockLocation.value
                    },
                    'memo': {
                      'value': PAGE_RECORD.inventoryList.value[pil].value.memo.value
                    },
                    'mLastStock': {
                      'value': PAGE_RECORD.inventoryList.value[pil].value.deductionNum.value
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
              'id':NEXTREPORT_RECORD.$id.value,
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
            for (var nil in PAGE_RECORD.inventoryList.value) {
              var nowMonthData = {
                'sysCode': PAGE_RECORD.inventoryList.value[nil].value.sys_code.value,
                'location': PAGE_RECORD.inventoryList.value[nil].value.stockLocation.value,
                'memo': PAGE_RECORD.inventoryList.value[nil].value.memo.value,
                'mCode': PAGE_RECORD.inventoryList.value[nil].value.mCode.value,
                'deductionNum': PAGE_RECORD.inventoryList.value[nil].value.deductionNum.value,
              }

              nowMonthSyscode.push(nowMonthData);
            }

            for (var ril in PAGE_RECORD.inventoryList.value) {
              if (nextMonthSyscode.includes(nowMonthSyscode[ril].sysCode)) {
                for (var nil in putNewReport_body.record.inventoryList.value) {
                  if (putNewReport_body.record.inventoryList.value[nil].value.sys_code.value == PAGE_RECORD.inventoryList.value[ril].value.sys_code.value) {
                    putNewReport_body.record.inventoryList.value[nil].value.mLastStock.value = PAGE_RECORD.inventoryList.value[ril].value.deductionNum.value
                    putNewReport_body.record.inventoryList.value[nil].value.mCode.value = PAGE_RECORD.inventoryList.value[ril].value.mCode.value
                    putNewReport_body.record.inventoryList.value[nil].value.stockLocation.value = PAGE_RECORD.inventoryList.value[ril].value.stockLocation.value
                    putNewReport_body.record.inventoryList.value[nil].value.memo.value = PAGE_RECORD.inventoryList.value[ril].value.memo.value
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