(function() {
'use strict';
  var prj_aNumValue='';
  var orgname='';
  var instname='';
  kintone.events.on('app.record.create.change.prj_aNum', function(event) {    //案件番号格納
    prj_aNumValue=event.record.prj_aNum.value;
    return event;
  });
  kintone.events.on('app.record.create.change.orgName_getvalue', function(event) {    //案件番号格納
    orgname=event.record.orgName_getvalue.value;
    return event;
  });
  kintone.events.on('app.record.create.change.instName', function(event) {    //案件番号格納
    instname=event.record.instName.value;
    return event;
  });
  
  
  kintone.events.on(['app.record.create.show','app.record.edit.show','app.record.detail.show'], function(event) {
    setFieldShown('orgName_getvalue', false);
    prj_aNumValue=event.record.prj_aNum.value;
    orgname=event.record.orgName_getvalue.value;
    instname=event.record.instName.value;
    //新規組織
    var newORG=setBtn('btn_newORG','新規組織');
    $('#'+newORG.id).on('click', function(){
      createNewREC(sysID.DIPM.app.org, 'prj_aNum', prj_aNumValue);
    });
    //新規設置先
    var newIST=setBtn('btn_newIST','新規設置先');
    $('#'+newIST.id).on('click', function(){
      createNewREC(sysID.DIPM.app.inst, ['prj_aNum', 'orgName'], [prj_aNumValue, orgname]);
    });
  });
  
  kintone.events.on(['app.record.detail.show'], function(event) {
    if(event.record.Exist_Project.value[0]===''){
      console.log('good');
      setFieldShown('Exist_Project', false);
    }
    var sType=event.record.shipType.value;
    //新規納品リスト
    var newDeliverylist=setBtn('btn_newDeliveryList','新規納品リスト');
    $('#'+newDeliverylist.id).on('click', function(){
      switch(sType){
        case '販売':
          sType='移動';
          break;
        case 'サブスク':
          sType='移動';
          break;
      }
      var tdate=event.record.tarDate.value;
      createNewREC(sysID.DIPM.app.ship, ['prj_aNum', 'shipType', 'tarDate', 'instName'], [prj_aNumValue, sType, tdate, instname]);
    });
    
    //新規予備機リスト
    if(sType!='確認中'){
      var newSpare=setBtn('btn_newSpare','新規予備機リスト');
      $('#'+newSpare.id).on('click', function(){
        createNewREC(sysID.DIPM.app.ship, ['prj_aNum', 'shipType', 'instName'], [prj_aNumValue, '予備', instname]);
      });
    }
    return event;
  });
})();
