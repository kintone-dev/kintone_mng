(function () {
  'use strict';

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], function (event) {
    const PAGE_RECORD = event.record;
    if (PAGE_RECORD.EoMcheck.value == '締切') {
      const REPORT_KEY_YEAR = PAGE_RECORD.report_key.value.substring(0, 4);
      const REPORT_KEY_MONTH = PAGE_RECORD.report_key.value.substring(5, 7);
      console.log(REPORT_KEY_YEAR);
      console.log(REPORT_KEY_MONTH);
      var repordData = new Date();

      var getNextMonthReportBody = {
        'app': sysid.INV.app_id.report,
        'query': 'report_key = "' + REPORT_KEY + '" order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getNextMonthReportBody)
        .then(function (resp) {
          console.log(resp.records);
        })



    }

    return event;
  });
})();