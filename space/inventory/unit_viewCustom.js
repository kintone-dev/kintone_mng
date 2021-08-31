(function() {
  'use strict';

  var events_ced=[
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.detail.show',
    'app.record.detail.show',
    'app.record.edit.show',
    'app.record.create.show'
  ];
  kintone.events.on(events_ced, function(event) {
    //サプテーブル編集不可＆行の「追加、削除」ボタン非表示
    //sti: subTable i
    for (var sti in event.record.mStockList.value){
      event.record.mStockList.value[sti].value.mCode.disabled = true;
      event.record.mStockList.value[sti].value.mName.disabled = true;
      event.record.mStockList.value[sti].value.mStock.disabled = true;
    }
    return event;
  });
  
  kintone.events.on('app.record.edit.show',function(event){
    // 編集画面は、全フィールド編集不可で表示する
    event.record.hCode.disabled = true;
    event.record.hType.disabled = true;
    event.record.hName.disabled = true;
    event.record.hCharge.disabled = true;
    event.record.zipcode.disabled = true;
    event.record.phoneNum.disabled = true;
    event.record.prefectures.disabled = true;
    event.record.city.disabled = true;
    event.record.town.disabled = true;
    event.record.address.disabled = true;
    event.record.hBuildingName.disabled = true;
    event.record.receiver.disabled = true;
    
    
    
    return event;
  });


  kintone.events.on('app.record.edit.change.editinfo', function(event){

    // 情報編集チェックボックスが on でなければ、編集させない
    if( event.record.editinfo.value[0] === '情報編集' ){
      // チェックボックスがチェックされている

    event.record.hType.disabled = false;
    event.record.hName.disabled = false;
    event.record.hCharge.disabled = false;
    event.record.zipcode.disabled = false;
    event.record.phoneNum.disabled = false;
    event.record.prefectures.disabled = false;
    event.record.city.disabled = false;
    event.record.town.disabled = false;
    event.record.address.disabled = false;
    event.record.hBuildingName.disabled = false;
    event.record.receiver.disabled = false;
    }else{
      // チェックボックスがチェックされていない
    event.record.hType.disabled = true;
    event.record.hName.disabled = true;
    event.record.hCharge.disabled = true;
    event.record.zipcode.disabled = true;
    event.record.phoneNum.disabled = true;
    event.record.prefectures.disabled = true;
    event.record.city.disabled = true;
    event.record.town.disabled = true;
    event.record.address.disabled = true;
    event.record.hBuildingName.disabled = true;
    event.record.receiver.disabled = true;
    }
    return event;
  });
  
  
  kintone.events.on('app.record.edit.submit', function(event){
    // 保存ボタンが押されたら、情報編集チェックボックスをクリア
    event.record.editinfo.value = [];
    return event;
  });

  var events_cd = ['app.record.create.show','app.record.detail.show' ];
  kintone.events.on(events_cd, function(event){
    // レコード追加＆詳細閲覧時は「情報編集」フィールドは非表示
    kintone.app.record.setFieldShown('editinfo', false);
  });
})();


