(function () {
  'use strict';

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], function (event) {
    const PAGE_RECORD = event.record;
    if (PAGE_RECORD.EoMcheck.value == '締切') {
      const REPORT_KEY_YEAR = PAGE_RECORD.report_key.value.substring(0, 4);
      const REPORT_KEY_MONTH = PAGE_RECORD.report_key.value.substring(4, 7);
      var reportDate = new Date(REPORT_KEY_YEAR,REPORT_KEY_MONTH);
      const NEXT_DATE = String(reportDate.getFullYear()) + String(("0"+(reportDate.getMonth() + 1)).slice(-2));
      var getNextMonthReportBody = {
        'app': sysid.INV.app_id.report,
        'query': 'report_key = "' + NEXT_DATE + '" order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getNextMonthReportBody)
        .then(function (resp) {
          if(resp.records.length == 0){
            //次月のレポートがない場合
            var postNewReportData = [];
            var postNewReport_listArray = [];
            var postNewReport_body = {
              'report_key': {
                'value': sendDate
              },  
              'inventoryList':{
                'value':postNewReport_listArray
              }
            };
            for(var pil in PAGE_RECORD.inventoryList.value){
              var postNewReport_listArray_body = {
                'sys_code':{
                  'value':PAGE_RECORD.inventoryList.value[pil].value.sys_code.value
                },
                'mCode':{
                  'value':PAGE_RECORD.inventoryList.value[pil].value.mCode.value
                },
                'stockLocation':{
                  'value':PAGE_RECORD.inventoryList.value[pil].value.stockLocation.value
                },
                'memo':{
                  'value':PAGE_RECORD.inventoryList.value[pil].value.memo.value
                },
                'mLastStock':{
                  'value':PAGE_RECORD.inventoryList.value[pil].value.deductionNum.value
                },
              };
              postNewReport_listArray.push(postNewReport_listArray_body);
            }
            postNewReportData.push(postNewReport_body);
            postRecords(sysid.INV.app_id.report, postNewReportData);
          }else{
            //次月のレポートがある場合
            
            
          }
        })
    }

    return event;
  });
})();