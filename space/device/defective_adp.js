(function () {
  'use strict';

  var events_ced = [
    'app.record.create.submit',
    'app.record.edit.submit'
  ];

  kintone.events.on(events_ced, function (event) {

    defective(event.record.defective.value, event.record.repaired.value);

    return event;
  });

})();