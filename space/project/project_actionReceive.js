var prj_aNumValue;
(function() {
'use strict';
  kintone.events.on('app.record.create.show', function(event) {
    //prj_aNumValueを初期化；
    prj_aNumValue='';
    //新規設置先
    var newORG=setBtn('btn_newORG','新規組織');
    $('#'+newORG.id).on('click', function(){
      createNewREC(75, 'prj_aNum', prj_aNumValue);
    });
    //新規設置先
    var newIST=setBtn('btn_newIST','新規設置先');
    $('#'+newIST.id).on('click', function(){
      createNewREC(76, 'prj_aNum', prj_aNumValue);
    });
    return event;
  });
  
  kintone.events.on(['app.record.create.show','app.record.detail.show'], function(event) {
    //案件番号格納
    prj_aNumValue=event.record.prj_aNum.value;
    
    //新規設置先
    var newIST=setBtn('btn_newIST','新規設置先');
    $('#'+newIST.id).on('click', function(){
      createNewREC(76, 'prj_aNum', prj_aNumValue);
    });
    
    
    var sType=event.record.shipType.value;
    //新規納品リスト
    var newDeliverylist=setBtn('btn_newDeliveryList','新規納品リスト');
    $('#'+newDeliverylist.id).on('click', function(){
      createNewREC(113, ['prj_aNum', 'shipType'], [prj_aNumValue, sType]);
    });
    
    //新規予備機リスト
    var newSpare=setBtn('btn_newSpare','新規予備機リスト');
    $('#'+newSpare.id).on('click', function(){
      createNewREC(113, ['prj_aNum', 'shipType'], [prj_aNumValue, '予備']);
    });
    return event;
  });
})();
