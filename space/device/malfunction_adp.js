(function () {
  'use strict';

  var events_ced = [
    'app.record.create.submit',
    'app.record.edit.submit'
  ];

  kintone.events.on(events_ced, function (event) {

    var snDefective = event.record.defective.value;

    var sNumInfo = {
      'app': sysid.DEV.app.sNum,
      'records': []
    };

    var snRecord = {
      'updateKey': {
        'field': 'sNum',
        'value': snDefective
      },
      'record': {
        'sState': {
          'value': '故障品'
        },
        'sProgress': {
          'value': '検証待ち'
        }
      }
    };

    sNumInfo.records.push(snRecord);

    var putResult = kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', sNumInfo);

    putResult.then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.error(error);
    });

    var queryBody = {
      'app': sysid.DEV.app.sNum,
      'query': 'sNum="' + event.record.defective.value + '"',
    };

    var getresult = kintone.api(kintone.api.url('/k/v1/records', true), 'GET', queryBody);

    getresult.then(function (resp) {

      var records = resp.records;
      var paramPut = {
        'app': kintone.app.getId(),
        'records': []
      };

      for (var si in records) {
        var mBody = {};

        mBody={
          'mCode': {'value': records[si].mCode.value },
          'mName': {'value': records[si].mName.value }
        };

        paramPut.records.push(mBody);
      };

      console.log(paramPut);

      // kintone.api(kintone.api.url('/k/v1/records', true), 'POST', paramPut);

    }).catch(function (error) {
      console.log(error);
      console.log(error.message);
    });


    return event;
  });

})();