(function() {
  'use strict';
  kintone.events.on(['app.record.create.change.dstSelection','app.record.edit.change.dstSelection'], function(event) {
    doSelection(event);
    return event;
  });
  kintone.events.on(['app.record.create.show','app.record.edit.show','app.record.detail.show'], function(event){
    console.log(event.record.sys_instAddress.value);
    console.log(event.record.sys_unitAddress.value);
    //$('.gaia-app-statusbar').css('display', 'none');


    // システム用フィールド非表示
    setFieldShown('sys_unitAddress', false);
    setFieldShown('sys_instAddress', false);
    
    // lookupコピー対象の編集不可を解除
    event.record.zipcode.disabled=false;
    event.record.phoneNum.disabled=false;
    event.record.address.disabled=false;
    event.record.buildingName.disabled=false;
    event.record.Receiver.disabled=false;
    //tabメニューの選択肢による表示設定
    function tabSwitch(onSelect){
      switch(onSelect){
        case '#宛先情報':
          kintone.app.record.setFieldShown('dstSelection', true);
          doSelection(event);
          setFieldShown('zipcode', true);
          setFieldShown('phoneNum', true);
          setFieldShown('address', true);
          setFieldShown('buildingName', true);
          setFieldShown('corpName', true);
          setFieldShown('Receiver', true);
          setFieldShown('prefectures', true);
          setFieldShown('city', true);

          setFieldShown('deviceList', false);

          //setFieldShown('postage', false);
          //setFieldShown('tariff', false);

          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);

          setFieldShown('shipment', false);
          setFieldShown('shipType', false);
          setFieldShown('tarDate', false);
          setFieldShown('instFile', false);
          setFieldShown('shipNote', false);
          setFieldShown('aboutDelivery', false);
          break;
        case '#品目情報':
          setFieldShown('dstSelection', false);
          setFieldShown('Contractor', false);
          setFieldShown('instName', false);
          setFieldShown('zipcode', false);
          setFieldShown('phoneNum', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);
          setFieldShown('Receiver', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);

          setFieldShown('deviceList', true);

          //setFieldShown('postage', false);
          //setFieldShown('tariff', false);

          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);

          setFieldShown('shipment', false);
          setFieldShown('shipType', false);
          setFieldShown('tarDate', false);
          setFieldShown('instFile', false);
          setFieldShown('shipNote', false);
          setFieldShown('aboutDelivery', false);
          break;
        case '#出荷情報':
          setFieldShown('dstSelection', false);
          setFieldShown('Contractor', false);
          setFieldShown('instName', false);
          setFieldShown('zipcode', false);
          setFieldShown('phoneNum', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);
          setFieldShown('Receiver', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);

          setFieldShown('deviceList', false);

          //setFieldShown('postage', false);
          //setFieldShown('tariff', false);

          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);

          setFieldShown('shipment', true);
          setFieldShown('shipType', true);
          setFieldShown('tarDate', true);
          setFieldShown('instFile', true);
          setFieldShown('shipNote', true);
          setFieldShown('aboutDelivery', true);
          break;
        case '#輸送情報':
          setFieldShown('dstSelection', false);
          setFieldShown('Contractor', false);
          setFieldShown('instName', false);
          setFieldShown('zipcode', false);
          setFieldShown('phoneNum', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);
          setFieldShown('Receiver', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);

          setFieldShown('deviceList', false);

          //setFieldShown('postage', false);
          //setFieldShown('tariff', false);

          setFieldShown('deliveryCorp', true);
          setFieldShown('trckNum', true);
          setFieldShown('sendDate', true);
          setFieldShown('expArrivalDate', true);

          setFieldShown('shipment', false);
          setFieldShown('shipType', false);
          setFieldShown('tarDate', false);
          setFieldShown('instFile', false);
          setFieldShown('shipNote', false);
          setFieldShown('aboutDelivery', false);
          break;
      }
    }tabSwitch('#出荷情報');//tab初期表示設定
    //タブメニュー作成
    tabMenu('tab_ship', ['出荷情報','宛先情報','品目情報','輸送情報']);
    //タブ切り替え表示設定
    $('.tabMenu a').on('click', function(){
      var idName = $(this).attr('href');//タブ内のリンク名を取得  
      tabSwitch(idName);//tabをクリックした時の表示設定
      return false;//aタグを無効にする
    });
    return event;
  });
  
  kintone.events.on('app.record.create.show', function(event){
    //レコード作成時、発送関連情報を非表示
    setFieldShown('shipment', false);
    setFieldShown('deliveryCorp', false);
    setFieldShown('trckNum', false);
    setFieldShown('sendDate', false);
    setFieldShown('expArrivalDate', false);
    return event;
  });
  
  // 納品依頼に進めた場合、作業者から組織情報を取得し、「出荷ロケーション」に格納
  kintone.events.on('app.record.detail.process.proceed',function(event){
    var nStatus = event.nextStatus.value;
    //var loginUserCode = event.record.作業者.value[0].code;
    console.log(event.record.作業者);
    //console.log(loginUserCode);
    /*
    if(nStatus === "受領待ち"){
      //作業者取得
      console.log(event.record.作業者)
      var loginUserCode = event.record.作業者.value[0].code;//kintone.getLoginUser()['code'];
      var getORGname= new kintone.api('/v1/user/organizations', 'GET', {code: loginUserCode});
      return getORGname.then(function(resp){
        event.record.shipment.value=resp.organizationTitles[0].organization.name;
        return event;
      }).catch(function(error){
        console.log('所属組織取得時にエラーが発生しました。'+'\n'+error.message);
      });
    }else{
    }
    */
  });
  // 輸送業者を「担当手渡し」にした場合、追跡番号を「none」にする
  kintone.events.on(['app.record.create.change.deliveryCorp','app.record.edit.change.deliveryCorp'], function(event){
    if(event.record.deliveryCorp.value=='担当手渡し') {
      event.record.trckNum.value='none';
      event.record.trckNum.disabled=true;
    }else{
      event.record.trckNum.value=null;
      event.record.trckNum.disabled=false;
    }

    return event;
  });
  // カーテンレールが選択された場合、シリアル番号欄にデータを記入
  kintone.events.on(['app.record.edit.change.mCode','app.record.create.change.mCode'], function(event) {
    for (var i in event.record.deviceList.value){
      if(event.record.deviceList.value[i].value.mCode.value=='TRT-DY'){
        if(event.record.deviceList.value[i].value.sNum.value===undefined){
          event.record.deviceList.value[i].value.sNum.value='カーテンレール全長(mm)：\n開き勝手：(S)片開き/(W)両開き\n取り付け方法：天井/壁付S/壁付W';
        }
      }
    }
    return event;
  });
  function doSelection(event){
    if(event.record.dstSelection.value=='施工業者へ納品'){
      setFieldShown('Contractor', true);
      setFieldShown('instName', false);
    }else if(event.record.dstSelection.value=='設置先と同じ'){
      setFieldShown('Contractor', false);
      setFieldShown('instName', true);
    }else{
      setFieldShown('Contractor', false);
      setFieldShown('instName', false);
      console.log(event)
      event.record.Contractor.lookup='CLEAR';
    }
  }
})();
