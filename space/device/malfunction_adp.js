(function () {
  'use strict';

  var events_ced = [
    'app.record.create.submit',
    'app.record.edit.submit'
  ];

  function createPutRecords(records) {
    var putRecords = [];
    for (var i = 0, l = records.length; i < l; i++) {
        var record = records[i];
        putRecords[i] = {
            id: record.$id.value,
            record: {
                lookup: {
                    value: record.lookup.value
                }
            }
        };
    }
    return putRecords;
}


  kintone.events.on(events_ced, function (event) {

    var snMalfunction = event.record.malfunction.value;

    var sNumInfo = {
      'app': sysid.DEV.app.sNum,
      'records': []
    };

    var snRecord = {
      'updateKey': {
        'field': 'sNum',
        'value': snMalfunction
      },
      'record': {
        'sState':{'value':'故障品'},
        'sProgress':{'value':'検証待ち'}
      }
    };

    sNumInfo.records.push(snRecord);

    var putResult = kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', sNumInfo);

    putResult.then(function(resp){
      console.log(resp);
    }).catch(function(error){
      console.error(error);
    });

    var queryBody = {
      'app': sysid.DEV.app.sNum,
      'query': 'sNum="' + event.record.malfunction.value +'"',
    };

    var getresult = kintone.api(kintone.api.url('/k/v1/records', true), 'GET', queryBody);

    getresult.then(function (resp) {

      var records = resp.records;
      var paramPut = {
          'app': kintone.app.getId(),
          'records': createPutRecords(records)
      };
      
      kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', paramPut);
      
    }).catch(function (error) {
      console.log(error);
      console.log(error.message);
    });


    return event;
  });

})();