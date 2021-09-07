

(function() {
  'use strict';

  var events_ced=[
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.detail.show',
    'app.record.create.show',
    'app.record.detail.show',
    'app.record.edit.show'
  ];
  kintone.events.on(events_ced, function(event) {    
    
    //サプテーブル編集不可＆行の「追加、削除」ボタン非表示
    //sti: subTable i
    for (var sti in event.record.uStockList.value){
      event.record.uStockList.value[sti].value.uCode.disabled=true;
      event.record.uStockList.value[sti].value.uName.disabled=true;
      event.record.uStockList.value[sti].value.uStock.disabled=true;
    }
    //[].forEach.call(document.getElementsByClassName("subtable-operation-gaia"), function(button){ button.style.display = 'none'; });
    
    //tabメニューの選択肢による表示設定
    function tabSwitch(onSelect){
      switch(onSelect){
        case '#品目情報':
          setFieldShown('mName', true);
          setFieldShown('mCode', true);
          setFieldShown('mNickname', true);
          setFieldShown('mType', true);
          setFieldShown('mVendor', true);
          setFieldShown('mClassification', true);
          setFieldShown('mWarranty', true);
          setFieldShown('mMemo', true);
          setFieldShown('mCostUpdate', false);
          setFieldShown('deviceCost', false);
          setFieldShown('importExpenses', false);
          setFieldShown('developCost', false);
          setFieldShown('totalStock', false);
          setFieldShown('uStockList', false);
          setFieldShown('packageComp', false);
          break;
        case '#在庫情報':
          setFieldShown('mName', false);
          setFieldShown('mCode', false);
          setFieldShown('mNickname', false);
          setFieldShown('mType', false);
          setFieldShown('mVendor', false);
          setFieldShown('mClassification', false);
          setFieldShown('mWarranty', false);
          setFieldShown('mMemo', false);
          setFieldShown('mCost', false);
          setFieldShown('mCostUpdate', false);
          setFieldShown('deviceCost', false);
          setFieldShown('importExpenses', false);
          setFieldShown('developCost', false);
          setFieldShown('totalStock', true);
          setFieldShown('uStockList', true);
          setFieldShown('packageComp', false);
          break;
        case '#原価情報':
          setFieldShown('mName', false);
          setFieldShown('mCode', false);
          setFieldShown('mNickname', false);
          setFieldShown('mType', false);
          setFieldShown('mVendor', false);
          setFieldShown('mClassification', false);
          setFieldShown('mWarranty', false);
          setFieldShown('mMemo', false);
          setFieldShown('mCost', true);
          setFieldShown('mCostUpdate', true);
          setFieldShown('deviceCost', true);
          setFieldShown('importExpenses', true);
          setFieldShown('developCost', true);
          setFieldShown('totalStock', false);
          setFieldShown('uStockList', false);
          setFieldShown('packageComp', false);
          break;
        case '#パッケージ構成':
          setFieldShown('mName', false);
          setFieldShown('mCode', false);
          setFieldShown('mNickname', false);
          setFieldShown('mType', false);
          setFieldShown('mVendor', false);
          setFieldShown('mClassification', false);
          setFieldShown('mWarranty', false);
          setFieldShown('mMemo', false);
          setFieldShown('mCost', false);
          setFieldShown('mCostUpdate', false);
          setFieldShown('deviceCost', false);
          setFieldShown('importExpenses', false);
          setFieldShown('developCost', false);
          setFieldShown('totalStock', false);
          setFieldShown('uStockList', false);
          setFieldShown('packageComp', true);
          break;
      }
    }
    //タブメニュー作成
    tabMenu('tab_inv', ['品目情報','在庫情報','原価情報','パッケージ構成']);
    //タブ切り替え表示設定
     $('.tabMenu a').on('click', function(){
        var idName = $(this).attr('href');//タブ内のリンク名を取得  
        tabSwitch(idName);//tabをクリックした時の表示設定
        return false;//aタグを無効にする
    });tabSwitch('#品目情報');//tab初期表示設定
    event.record.totalStock.disabled=true;
    event.record.mCost.disabled=true;
    event.record.mCostUpdate.disabled=true;
    event.record.deviceCost.disabled=true;
    event.record.importExpenses.disabled=true;
    event.record.developCost.disabled=true;
    return event;
  });
  
  kintone.events.on('app.record.edit.show',function(event){
    // 編集画面は、全フィールド編集不可で表示する
    event.record.mName.disabled=true;
    event.record.mImg.disabled=true;
    event.record.mCode.disabled=true;
    event.record.mType.disabled=true;
    event.record.mVendor.disabled=true;
    event.record.mNickname.disabled=true;
    event.record.mWarranty.disabled=true;
    event.record.mClassification.disabled=true;
    for (var sti in event.record.packageComp.value){
      event.record.packageComp.value[sti].value.pc_mVendor.disabled=true;
      event.record.packageComp.value[sti].value.pc_mType.disabled=true;
      event.record.packageComp.value[sti].value.pc_mCode.disabled=true;
      event.record.packageComp.value[sti].value.pc_mName.disabled=true;
      event.record.packageComp.value[sti].value.pc_Num.disabled=true;
    }
    return event;
  });
  
  kintone.events.on('app.record.edit.change.editinfo', function(event){
    // 情報編集チェックボックスが on でなければ、編集させない
    if( event.record.editinfo.value[0]==='情報編集' ){
      // チェックボックスがチェックされている
      event.record.mName.disabled=false;
      event.record.mImg.disabled=false;
      event.record.mType.disabled=false;
      event.record.mVendor.disabled=false;
      event.record.mNickname.disabled=false;
      event.record.mWarranty.disabled=false;
      event.record.mClassification.disabled=false;
      for (var sti in event.record.packageComp.value){
        event.record.packageComp.value[sti].value.pc_mVendor.disabled=false;
        event.record.packageComp.value[sti].value.pc_mType.disabled=false;
        event.record.packageComp.value[sti].value.pc_mCode.disabled=false;
        event.record.packageComp.value[sti].value.pc_mName.disabled=false;
        event.record.packageComp.value[sti].value.pc_Num.disabled=false;
      }
    }else{
      // チェックボックスがチェックされていない
      event.record.mName.disabled=true;
      event.record.mImg.disabled=true;
      event.record.mCode.disabled=true;
      event.record.mType.disabled=true;
      event.record.mVendor.disabled=true;
      event.record.mNickname.disabled=true;
      event.record.mWarranty.disabled=true;
      event.record.mClassification.disabled=true;
      for (var sti in event.record.packageComp.value){
        event.record.packageComp.value[sti].value.pc_mVendor.disabled=true;
        event.record.packageComp.value[sti].value.pc_mType.disabled=true;
        event.record.packageComp.value[sti].value.pc_mCode.disabled=true;
        event.record.packageComp.value[sti].value.pc_mName.disabled=true;
        event.record.packageComp.value[sti].value.pc_Num.disabled=true;
      }
    }
    return event;
  });

  kintone.events.on('app.record.edit.submit', function(event){
    // 保存ボタンが押されたら、情報編集チェックボックスをクリア
    event.record.editinfo.value=[];
    if(event.record.mType.value=='パッケージ品'){
      if(event.record.mClassification.value!='非在庫'){
        event.record.mClassification.error='品目区分がパッケージ品の場合、取扱区分を非在庫にしてください。';
      }
    }
    return event;
  });

  var events_cd = [ 'app.record.create.show','app.record.detail.show' ];
  kintone.events.on(events_cd, function(event){
    // レコード追加＆詳細閲覧時は「情報編集」フィールドは非表示
    setFieldShown('editinfo', false);
    return event;
  })
})();
