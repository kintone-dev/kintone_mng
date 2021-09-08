(function () {
  'use strict';

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], function (event) {
    const PAGE_RECORD = event.record;
    if (PAGE_RECORD.EoMcheck.value == '締切') {
      const REPORT_KEY = event.record.report_key.value;
      var repordData = new Date(REPORT_KEY);
      console.log(repordData);

      var getNextMonthReportBody = {
        'app': sysid.INV.app_id.report,
        'query': 'report_key = "' + sendDate + '" order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getNextMonthReportBody)
        .then(function (resp) {
          console.log(resp.records);
        })



    }

    return event;
  });
})();