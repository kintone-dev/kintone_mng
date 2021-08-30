(function() {
  'use strict';
  kintone.events.on(['app.record.create.change.dstSelection','app.record.edit.change.dstSelection'], function(event) {
    if(event.record.dstSelection.value=='施工業者へ納品'){
      setFieldShown('Contractor', true);
      setFieldShown('instName', false);
    }else if(event.record.dstSelection.value=='設置先と同じ'){
      setFieldShown('Contractor', false);
      setFieldShown('instName', true);
    }else{
      setFieldShown('Contractor', false);
      setFieldShown('instName', false);
      event.record.Contractor.lookup='CLEAR';
    }
    return event;
  });
  kintone.events.on(['app.record.create.show','app.record.edit.show','app.record.detail.show'], function(event){
    //lookupコピー対象の編集不可を解除
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
          if(event.record.dstSelection.value=='施工業者へ納品'){
            setFieldShown('Contractor', true);
            setFieldShown('instName', false);
          }else if(event.record.dstSelection.value=='設置先と同じ'){
            setFieldShown('Contractor', false);
            setFieldShown('instName', true);
          }else{
            setFieldShown('Contractor', false);
            setFieldShown('instName', false);
            event.record.Contractor.lookup='CLEAR';
          }
          setFieldShown('zipcode', true);
          setFieldShown('phoneNum', true);
          setFieldShown('address', true);
          setFieldShown('buildingName', true);
          setFieldShown('corpName', true);
          setFieldShown('Receiver', true);
          setFieldShown('deviceList', false);
          setFieldShown('postage', false);
          setFieldShown('tariff', false);
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
          setFieldShown('deviceList', true);
          setFieldShown('postage', false);
          setFieldShown('tariff', false);
          break;
        case '#その他原価':
          setFieldShown('dstSelection', false);
          setFieldShown('Contractor', false);
          setFieldShown('instName', false);
          setFieldShown('zipcode', false);
          setFieldShown('phoneNum', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);
          setFieldShown('Receiver', false);
          setFieldShown('deviceList', false);
          setFieldShown('postage', true);
          setFieldShown('tariff', true);
          break;
      }
    }
    //タブメニュー作成
    tabMenu('tab_ship', ['品目情報','宛先情報','その他原価']);
    //タブ切り替え表示設定
    $('.tabMenu a').on('click', function(){
      var idName = $(this).attr('href');//タブ内のリンク名を取得  
      tabSwitch(idName);//tabをクリックした時の表示設定
      return false;//aタグを無効にする
    });tabSwitch('#品目情報');//tab初期表示設定
    return event;
  });
  
  kintone.events.on('app.record.create.show', function(event){
    //レコード作成時、発送関連情報を非表示
    setFieldShown('shipment', false);
    setFieldShown('deliveryComp', false);
    setFieldShown('trckNum', false);
    setFieldShown('sendDate', false);
    setFieldShown('expArrivalDate', false);
    return event;
  });
  
  //納品依頼に進めた場合、作業者から組織情報を取得し、「出荷ロケーション」に格納
  kintone.events.on('app.record.detail.process.proceed',function(event){
    var nStatus = event.nextStatus.value;
    if(nStatus==="受領待ち"){
      //作業者取得
      console.log(event.record.作業者)
      var loginUserCode = event.record.作業者.value[0].code;//kintone.getLoginUser()['code'];
      var getORGname= new kintone.api('/v1/user/organizations', 'GET', {code: loginUserCode});
      return getORGname.then(function(resp){
        event.record.shipment.value=resp.organizationTitles[0].organization.name;
        return event;
      }).catch(function(error){
        alert('所属組織取得時にエラーが発生しました。'+'\n'+error.message);
      });
    }
  });
  //輸送業者を「担当手渡し」にした場合、追跡番号を「none」にする
  kintone.events.on(['app.record.create.change.deliveryComp','app.record.edit.change.deliveryComp'], function(event){
    if(event.record.deliveryComp.value==='担当手渡し') {
      event.record.trckNum.value='none';
      event.record.trckNum.disabled=true;
    }else{
      event.record.trckNum.value=null;
      event.record.trckNum.disabled=false;
    }
    return event;
  });/*
  kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event){
    if(event.record.dstSelection.value=='施工業者へ納品'){
      var setShipinfo=event.record.Contractor.value;
      var getShipADDR={
        'app': sysID.DIPM.app.unit,
        'query': 'hName="'+setShipinfo+'"',
        'fields': ['zipcode', 'phoneNum', 'prefectures', 'city', 'town', 'Address', 'hBuildingName', 'Receiver', 'corpName']
      };
      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getShipADDR).then(function(resp){
        var setEvent=kintone.app.record.get();
        setEvent.record.zipcode.value=resp.record.zipcode.value;
        setEvent.record.address.value=resp.record.prefectures.value+resp.record.city.value+resp.record.town.value+resp.record.Address.value;
        setEvent.record.hBuildingName.value=resp.record.hBuildingName.value;
        setEvent.record.Receiver.value=resp.record.Receiver.value;
        setEvent.record.corpName.value=resp.record.corpName.value;
        kintone.app.record.set(setEvent);
      }).catch(function(error){
        console.log(error);
        console.log(error.message);
      });
    }
  });
  //csvファイル処理
  /*
  kintone.events.on(['app.record.detail.show'], function(event) {

    var attached_file = event.record.roomFile.value[0];
    var apiurl = 'https://accel-lab.cybozu.com/k/v1/file.json?fileKey=' + attached_file.fileKey;　
    var auth_token = 'a2ludG9uZV9tbmdAYWNjZWwtbGFiLmNvbTpwQHNzVzByZCUl'; // 「ログインID:パスワード」のBase64エンコード値
    var basic_token = 'a2ludG9uZV9tbmdAYWNjZWwtbGFiLmNvbTpwQHNzVzByZCUl'; // Basic認証における「ログインID:パスワード」のBase64エンコード値
    
    var getcsv=new kintone.proxy(apiurl,'GET',{
      "X-Cybozu-Authorization": auth_token,
      //"Authorization": "Basic " + basic_token
    },{});
    getcsv.then(function(resp){
      var snUpdate={
        'app': '',
        'records':[]
      };
    var getrow=resp[0].split(/\r\n|\n/);
    var get_mCode=getrow[0].split(/,/);
      for (var i=1; i<get_mCode.length; i++){
        //var set_mCode=get_mCode[i];
        for (var y=1; y<getrow.length; y++){
          var get_roomInfo=getrow[y].split(/,/);
          var set_roomCode=get_roomInfo[0];
        }
      }
    });
  return event;
  });*/
/*
  var stv=0;
  kintone.events.on('app.record.edit.change.mCode', function(event){
    while (stv<event.record.deviceList.value.length){
      
      if(event.record.deviceList.value[stv].value.mCode.value=='KRT-DY'){
            event.record.deviceList.value.push({
      'value':{
        //'mName':{'value':'Master Carrier(G)'},
        mCode: {type: "SINGLE_LINE_TEXT", value: ""},
        mName: {type: "SINGLE_LINE_TEXT", value: "Master Carrier(G)"},
        mType: {type: "SINGLE_LINE_TEXT", value: ""},
        mVendor: {type: "SINGLE_LINE_TEXT", value: ""},
        sNum: {type: "MULTI_LINE_TEXT", value: ""},
        shipMemo: {type: "SINGLE_LINE_TEXT", value: ""},
        shipNum: {type: "NUMBER", value: ""}
      }
    });
        break;
      }stv++;
    }

    stv=event.record.deviceList.value.length-1;
    event.record.deviceList.value[stv].value.mName.lookup=true;
    return event;
  });*/
})();
