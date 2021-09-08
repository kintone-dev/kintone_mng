(function () {
  'use strict';

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], function (event) {
    const PAGE_RECORD = event.record;
    if (PAGE_RECORD.EoMcheck.value == '締切') {
      const REPORT_KEY_YEAR = PAGE_RECORD.report_key.value.substring(0, 4);
      const REPORT_KEY_MONTH = PAGE_RECORD.report_key.value.substring(4, 7);
      var reportDate = new Date(REPORT_KEY_YEAR,REPORT_KEY_MONTH);
      reportDate.setMonth(reportDate.getMonth()+1);
      const NEXT_DATE = String(reportDate.getFullYear()) + String(reportDate.getMonth());
      console.log(NEXT_DATE);
      var getNextMonthReportBody = {
        'app': sysid.INV.app_id.report,
        'query': 'report_key = "' + NEXT_DATE + '" order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getNextMonthReportBody)
        .then(function (resp) {
          console.log(resp);
        })

    }

    return event;
  });
})();