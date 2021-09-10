(function () {
  'use strict';

  var events_ced = [
    'app.record.create.submit',
    'app.record.edit.submit'
  ];

  kintone.events.on(events_ced, function (event) {
    //更新故障品情報格納配列
    var putDefectiveData = [];
    //更新故障品情報
    var putDefectiveBody = {
      'updateKey': {
        'field': 'sNum',
        'value': event.record.defective.value
      },
      'record': {
        'sState': {
          'value': '故障品'
        },
        'sDstate': {
          'value': '検証待ち'
        }
      }
    }
    putDefectiveData.push(putDefectiveBody);
    postRecords(sysid.DEV.app_id.sNum, putDefectiveData);

    //故障品情報取得
    var queryBody = {
      'app': sysid.DEV.app_id.sNum,
      'query': 'sNum="' + event.record.defective.value + '"',
    };
    var getRepResult = kintone.api(kintone.api.url('/k/v1/records', true), 'GET', queryBody);
    getRepResult.then(function (resp) {
      var respRecords = resp.records;

      delete respRecords[0].$id;
      delete respRecords[0].$revision;
      delete respRecords[0].sNum;
      delete respRecords[0].sDstate;
      delete respRecords[0].sState;
      delete respRecords[0].sendDate;
      delete respRecords[0].sendType;
      delete respRecords[0].レコード番号;
      delete respRecords[0].作成日時;
      delete respRecords[0].作成者;
      delete respRecords[0].ステータス;
      delete respRecords[0].更新者;
      delete respRecords[0].更新日時;

      var repInfo = {
        'app': sysid.DEV.app_id.sNum,
        'records': [{
          'updateKey': {
            'field': 'sNum',
            'value': event.record.repaired.value
          },
          'record': {}
        }]
      };

      repInfo.records.record = respRecords[0];

      var putRepResult = kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', repInfo);

      putRepResult.then(function (resp) {
        console.log("故障品情報を交換品情報にPUTしました。");
      }).catch(function (error) {
        console.log("put error");
        console.error(error);
      });

    }).catch(function (error) {
      console.log(error);
    });

    // defective(event.record.defective.value, event.record.repaired.value);

    return event;
  });

})();