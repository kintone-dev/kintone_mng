(function() {
  'use strict';

  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const PAGE_RECORD = event.record;
    var nStatus = event.nextStatus.value;
    if (nStatus === '納品準備中') {

    }

  });

})();
