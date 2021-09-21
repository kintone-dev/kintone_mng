(function () {
  'use strict';

  // kintone.events.on('app.record.detail.process.proceed', function (event) {
  kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function (event) {
    const PAGE_RECORD = event.record;
    var nStatus = event.nextStatus.value;

    putDevice(PAGE_RECORD);
    // if(nStatus==="仕入完了"){
    // }
  });

  const putDevice = function (pageRecod) {
    var arrivalList = pageRecod.arrivalList.value;
    var deviceQuery = [];
    for (var i in arrivalList) {
      deviceQuery.push('"' + arrivalList[i].value.mCode.value + '"');
    }
    var getDeviceBody = {
      'app': sysid.INV.app_id.device,
      'query': 'mCode in (' + deviceQuery.join() + ') order by 更新日時 asc'
    };
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getUnitBody)
    .then(function (resp) {
      var deviceRecords = resp.records;
      console.log(deviceRecords);
      var putDevData = [];

      // for(var i in arrivalList){
      //   for(var j in deviceRecords){
      //     if(arrivalList[i].value.mCode.value == deviceRecords.){

      //     }
      //   }
      // }

    });

  }
})();
