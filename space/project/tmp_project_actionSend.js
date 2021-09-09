(function() {
'use strict';
  var prjNumValue='';
  var orgname='';
  var instname='';
  kintone.events.on('app.record.create.change.prjNum', function(event) {    //案件番号格納
    prjNumValue=event.record.prjNum.value;
    return event;
  });
  kintone.events.on('app.record.create.change.sys_orgName', function(event) {    //案件番号格納
    orgname=event.record.sys_orgName.value;
    return event;
  });
  kintone.events.on('app.record.create.change.instName', function(event) {    //案件番号格納
    instname=event.record.instName.value;
    return event;
  });
  
  
  kintone.events.on(['app.record.create.show','app.record.edit.show','app.record.detail.show'], function(event) {
    prjNumValue=event.record.prjNum.value;
    orgname=event.record.sys_orgName.value;
    instname=event.record.instName.value;
    //新規組織
    var newORG=setBtn('btn_newORG','新規組織');
    $('#'+newORG.id).on('click', function(){
      createNewREC(sysID.DIPM.app.org, 'prjNum', prjNumValue);
    });
    //新規設置先
    var newIST=setBtn('btn_newIST','新規設置先');
    $('#'+newIST.id).on('click', function(){
      createNewREC(sysID.DIPM.app.inst, ['prjNum', 'orgName'], [prjNumValue, orgname]);
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
      createNewREC(sysID.DIPM.app.ship, ['prjNum', 'shipType', 'tarDate', 'instName'], [prjNumValue, sType, tdate, instname]);
    });
    
    //新規予備機リスト
    if(sType!='確認中'){
      var newSpare=setBtn('btn_newSpare','新規予備機リスト');
      $('#'+newSpare.id).on('click', function(){
        createNewREC(sysID.DIPM.app.ship, ['prjNum', 'shipType', 'instName'], [prjNumValue, '予備', instname]);
      });
    }
    return event;
  });
})();
