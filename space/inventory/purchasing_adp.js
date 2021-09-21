(function () {
  'use strict';

  // kintone.events.on('app.record.detail.process.proceed', function (event) {
  kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function (event) {
    const PAGE_RECORD = event.record;
    var sendDate = PAGE_RECORD.arrivalDate.value;
    sendDate = sendDate.replace(/-/g, '');
    sendDate = sendDate.slice(0, -2);
    // var nStatus = event.nextStatus.value;

    // if(nStatus==="仕入完了"){
    //同じ月のレポート情報取得
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'sys_invoiceDate = "' + sendDate + '" order by 更新日時 asc'
    };
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
    .then(function (resp) {
      if (resp.records.length != 0) {
        for (var i in resp.records[0].EoMcheck.value) {
          if (resp.records[0].EoMcheck.value[i]=='締切') {
            event.error = '対応した日付のレポートは締切済みです。';
            return event;
          }
        }

        putDevice(PAGE_RECORD);
      }
    });
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
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getDeviceBody)
    .then(function (resp) {
      var deviceRecords = resp.records;
      var putDevData = [];
      for(var i in arrivalList){
        for(var j in deviceRecords){
          if(arrivalList[i].value.mCode.value == deviceRecords[j].mCode.value){
            var putDevBody = {
              'updateKey': {
                'field': 'mCode',
                'value': arrivalList[i].value.mCode.value
              },
              'record': {
                'mCost': {
                  'value': arrivalList[i].value.totalUnitCost.value
                },
                'mCostUpdate': {
                  'value': pageRecod.arrivalDate.value
                },
                'deviceCost': {
                  'value': arrivalList[i].value.unitPrice.value
                },
                'deviceCost_foreign': {
                  'value': arrivalList[i].value.unitPrice_foreign.value
                },
                'importExpenses': {
                  'value': arrivalList[i].value.addiUnitExpenses.value
                },
                'developCost': {
                  'value': arrivalList[i].value.addiCost.value
                },
                'uStockList': {
                  'value': deviceRecords[j].uStockList.value
                }
              }
            }
            putDevData.push(putDevBody);
          }
        }
      }

      for(var i in putDevData){
        for(var j in putDevData[i].record.uStockList.value){
          for(var k in arrivalList){
            if(putDevData[i].record.uStockList.value[j].value.uCode.value==arrivalList[k].value.uCode.value){
              putDevData[i].record.uStockList.value[j].value.uStock.value = parseInt(putDevData[i].record.uStockList.value[j].value.uStock.value || 0) + parseInt(arrivalList[k].value.arrivalNum.value || 0);
            }
          }
        }
      }

      console.log(JSON.stringify(putDevData, null, '\t'));

    });

  }
})();
