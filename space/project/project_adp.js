(function() {
  'use strict';

  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const PAGE_RECORD = event.record;
    var nStatus = event.nextStatus.value;
    if (nStatus === '納品準備中') {
      var postShipData = [];
      var postShipBody = {
        'aboutDelivery':{
          'value':PAGE_RECORD.aboutDelivery.value
        },
        'tarDate':{
          'value':PAGE_RECORD.tarDate.value
        },
        'dstSelection':{
          'value':PAGE_RECORD.dstSelection.value
        },
        'Contractor':{
          'value':PAGE_RECORD.Contractor.value
        },
        'instName':{
          'value':PAGE_RECORD.instName.value
        },
        'receiver':{
          'value':PAGE_RECORD.receiver.value
        },
        'phoneNum':{
          'value':PAGE_RECORD.phoneNum.value
        },
        'zipcode':{
          'value':PAGE_RECORD.zipcode.value
        },
        'prefectures':{
          'value':PAGE_RECORD.prefectures.value
        },
        'city':{
          'value':PAGE_RECORD.city.value
        },
        'address':{
          'value':PAGE_RECORD.address.value
        },
        'buildingName':{
          'value':PAGE_RECORD.buildingName.value
        },
        'corpName':{
          'value':PAGE_RECORD.corpName.value
        },
        'sys_instAddress':{
          'value':PAGE_RECORD.sys_instAddress.value
        },
        'sys_unitAddress':{
          'value':PAGE_RECORD.sys_unitAddress.value
        },
        'deviceList':{
          'value':[]
        },
      }
      for(var pdv in PAGE_RECORD.deviceList.value){
        var devListBody = {
          'value':{
            'mName':{
              'value':PAGE_RECORD.deviceList.value[pdv].value.mNickname.value
            },
            'shipNum':{
              'value':PAGE_RECORD.deviceList.value[pdv].value.shipNum.value
            }
          }
        }
        postShipBody.deviceList.value.push(devListBody);
      }

      postShipData.push(postShipBody);
      postRecords(sysid.INV.app_id.shipment, postShipData);
    }

  });

  //保存ボタン押下時、対応したレポートが締め切り済の場合保存できないように
  kintone.events.on(['app.record.edit.submit', 'app.record.create.submit'], function (event) {
    const PAGE_RECORD = event.record;
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'sys_invoiceDate = "' + PAGE_RECORD.sys_invoiceDate.value + '" order by 更新日時 asc'
    };
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
    .then(function (resp) {
      // var eRecord=kintone.app.record.get();
      for(var i in resp.records[0].EoMcheck.value ){
        if(resp.records[0].EoMcheck.value[i] == '締切'){
          alert('対応した日付のレポートは締切済みです。');
          event.record.invoiceYears.value = '2025';
          event.error = '対応した日付のレポートは締切済みです。';
          return event;
        }
      }
    });

  });

})();
