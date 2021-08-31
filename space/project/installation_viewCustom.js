(function() {
  'use strict';
  kintone.events.on('app.record.detail.show', function(event){
    var test_tjason=event.record.sys_address.value;
    console.log(JSON.parse(test_tjason);
  })
  kintone.events.on(['app.record.create.change.editMC','app.record.edit.change.editMC','app.record.create.show','app.record.edit.show'], function(event) {
    var editmc=event.record.editMC.value;
    if(!editmc[0]){
      event.record.BMC.disabled=true;
      event.record.RRMC.disabled=true;
    }else if(editmc[0]=='賃貸管理'){
      event.record.BMC.disabled=true;
      event.record.RRMC.disabled=false;
    }else if(editmc[0]=='建物管理'&&editmc[1]=='賃貸管理'){
      event.record.BMC.disabled=false;
      event.record.RRMC.disabled=false;
      event.record.cName.disabled=false;
    }else{
      event.record.BMC.disabled=false;
      event.record.RRMC.disabled=true;
    }
    return event;
  });
  kintone.events.on('app.record.detail.show', function(event) {
    setFieldShown('editMC', false);
    return event;
  });
  
  kintone.events.on(['app.record.create.show','app.record.detail.show','app.record.edit.show'],function(event){
    event.record.prj_aNum.disabled=true;
    setFieldShown('sys_address', false);
    setFieldShown('bType', false);
    setFieldShown('bDivision', false);
    setFieldShown('ルックアップ_0', false);
    setFieldShown('ルックアップ', false);
    setFieldShown('cDate__s_0', false);
    setFieldShown('cDate__s', false);
    setFieldShown('uNum__s', false);
    setFieldShown('iuNum__s', false);
    setFieldShown('sWarranty__s', false);
    setFieldShown('eWarranty__s', false);
    setFieldShown('yWarranty__s', false);
    return event;
  });
  kintone.events.on(['app.record.detail.show'],function(event){
    
    var putORGinfo=setBtn_header('putORGinfo','組織情報更新');
    $('#'+putORGinfo.id).on('click', function(){
      var setRecordsBody={
        'app': event.appId,
        'records': []
      };
      for (var i in event.records){
        setRecordsBody.records.push({
          'id': event.records[i].$id.value,
          'record': {
            'orgName':{'value': event.records[i].orgName.value}
          }
        });
      }
      kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', setRecordsBody).then(function(resp){
        console.log(resp);
      }).catch(function(error){
        console.log(error);
      });
    });
    
    return event;
  });
})();