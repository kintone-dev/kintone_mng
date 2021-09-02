(function () {
  'use strict';

  var events_ced = [
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.detail.show',
    'app.record.create.show',
    'app.record.detail.show',
    'app.record.edit.show'
  ];

  kintone.events.on(events_ced, function (event) {
    event.record.toastcam_bizUserId.disabled = true;
    event.record.toastcam_bizUserPassword.disabled = true;

    return event;
  });

  kintone.events.on('app.record.create.show', function (event) {
    var menID = event.record.member_id.value;
    var setRecordBody = {
      'app': kintone.app.getId(),
      'id': kintone.app.record.getId(),
      'record': {
        'toastcam_bizUserId': {
          'value': menID + '@accel-lab.com'
        },
        'toastcam_bizUserPassword': {
          'value': pw_generator(10)
        }
      }
    };
    kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', setRecordBody);
    location.reload();

    return event;
  });

})();