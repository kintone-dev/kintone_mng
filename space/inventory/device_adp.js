(function () {
  'use strict';
  //拠点情報取得＆繰り返し利用
  var getUNITdata = api_getRecords(sysid.INV.app_id.unit);

  //新規品目作成時アクション
  kintone.events.on('app.record.create.show', function (event) {
    //拠点データを取得し、拠点在庫一覧に格納
    getUNITdata.then(function (resp) {
      var eRecord = kintone.app.record.get();
      //反転して格納
      var tarRecords = resp.records.reverse();
      //各拠点情報を当アプリの拠点リストに格納する
      //最初の空白の1行目を削除
      eRecord.record.uStockList.value.splice(0, 1);
      //aul: auto uint list
      for (var aul in tarRecords) {
        eRecord.record.uStockList.value.push({
          value: {
            uCode: {
              value: tarRecords[aul].uCode.value,
              type: 'SINGLE_LINE_TEXT'
            },
            uName: {
              value: tarRecords[aul].uName.value,
              type: 'SINGLE_LINE_TEXT'
            },
            uStock: {
              value: '',
              type: 'NUMBER'
            }
          }
        });
        eRecord.record.uStockList.value[aul].value.uCode.disabled = true;
        eRecord.record.uStockList.value[aul].value.uName.disabled = true;
        eRecord.record.uStockList.value[aul].value.uStock.disabled = true;
        kintone.app.record.set(eRecord);
      }
      kintone.app.record.set(eRecord);
    }).catch(function (error) {
      console.log(error);
      console.log('拠点データを取得できませんでした。' + error.message);
    });
    return event;
  });

  // 新規保存時アクション
  kintone.events.on('app.record.create.submit.success', function (event) {

    // 品目情報を拠点リストに転送
    getUNITdata.then(function (resp) {
      var tarRecords = resp.records;

      // 拠点管理アプリの品目リストに上書きするデータ作成
      var NewPrdInfo = {
        'app': sysid.INV.app_id.unit,
        'records': []
      };
      //spd: set product data
      for (var spd in tarRecords) {
        var records_set = {
          'id': tarRecords[spd].$id.value,
          'record': {
            'mStockList': tarRecords[spd].mStockList
          }
        };
        var addRowData = {
          'value': {
            'mCode': event.record.mCode,
            'mName': event.record.mName
          }
        };
        records_set.record.mStockList.value.push(addRowData);
        NewPrdInfo.records.push(records_set);
      }
      return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', NewPrdInfo);
    });

    /* 新規データ転送 */
    // 転送データ作成
    var postItemBody = {
      'app': '',
      'record': {
        'mName': event.record.mName,
        'mCode': event.record.mCode,
        'mNickname': event.record.mNickname,
        'mType': event.record.mType,
        'mVendor': event.record.mVendor,
        'mClassification': event.record.mClassification,
        'packageComp': event.record.packageComp
      }
    };
    // 転送先指定
    var tarAPP = [
      sysid.PM.app_id.item,
      sysid.SUP.app_id.item,
      sysid.ASS.app_id.item
    ];
    // 品目マスターに転送実行
    for (var pi in tarAPP) {
      postItemBody.app = tarAPP[pi];
      kintone.api(kintone.api.url('/k/v1/record', true), 'POST', postItemBody);
    }

    return event;
  });

  // 編集保存時アクション（現在編集不可）
  kintone.events.on('app.record.edit.submit.success', function (event) {

    // api実行先指定
    var tarAPP = [
      sysid.PM.app_id.item,
      sysid.SUP.app_id.item,
      sysid.ASS.app_id.item
    ];
    /* api実行データ作成 */
    // 転送データ作成
    var putItemBody = {
      'app': '',
      'updateKey': {
        'field': 'mCode',
        'value': event.record.mCode.value
      },
      'record': {
        'mName': event.record.mName,
        'mNickname': event.record.mNickname,
        'mType': event.record.mType,
        'mVendor': event.record.mVendor,
        'mClassification': event.record.mClassification,
        'packageComp': event.record.packageComp,
        'endService': event.record.endService
      }
    };
    // // 削除データ作成
    // var getDelItemID={
    //   'app': '',
    //   'query': 'mCode="'+event.record.mCode.value+'"',
    //   'fields': ['$id']
    // }
    
    
    // api実行
    for (var pi in tarAPP) {
      // if(event.record.endService.value.length>0){
      //   getDelItemID.app=tarAPP[pi];
      //   kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getDelItemID).then(function(resp){
      //     if(resp.records.length>0){
      //       kintone.api(kintone.api.url('/k/v1/records.json', true),'DELETE',{'app':tarAPP[pi],'ids':[resp.records[0].$id.value]}).then(function(delResp){
      //         console.log(delResp);
      //       });
      //     }
      //   }).catch(function(error){
      //     console.erroe(error)
      //   });
      // }else{
      //   putItemBody.app = tarAPP[pi];
      //   kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', putItemBody);
      // }
      putItemBody.app = tarAPP[pi];
      kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', putItemBody);
    }

    return event;
  });

  //パッケージ一覧編集時
  kintone.events.on(['app.record.create.change.pc_mCode','app.record.edit.change.pc_mCode'], function (event) {
    var deviceQuery = [];
    for(var i in event.record.packageComp.value){
      deviceQuery.push('"' + event.record.packageComp.value[i].value.pc_mCode.value + '"');
    }
    var getPacBody = {
      'app': sysid.INV.app_id.device,
      'query': 'mCode in (' + deviceQuery.join() + ') order by 更新日時 asc'
    };
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getPacBody)
    .then(function (resp) {
      var eRecord = kintone.app.record.get();

      for(var i in eRecord.record.packageComp.value){
        for(var j in resp.records){
          if(eRecord.record.packageComp.value[i].value.pc_mCode.value == resp.records[j].mCode.value){
            eRecord.record.packageComp.value[i].value.pc_mVendor.value = resp.records[j].mVendor.value;
            eRecord.record.packageComp.value[i].value.pc_mType.value = resp.records[j].mType.value;
            eRecord.record.packageComp.value[i].value.pc_mName.value = resp.records[j].mName.value;
            eRecord.record.packageComp.value[i].value.pc_mNickname.value = resp.records[j].mNickname.value;
          }
        }
      }

      for (var i in eRecord.record.packageComp.value) {
        eRecord.record.packageComp.value[i].value.pc_mVendor.disabled = true;
        eRecord.record.packageComp.value[i].value.pc_mType.disabled = true;
        eRecord.record.packageComp.value[i].value.pc_mName.disabled = true;
        eRecord.record.packageComp.value[i].value.pc_mNickname.disabled = true;
        eRecord.record.packageComp.value[i].value.pc_Num.disabled = false;
        eRecord.record.packageComp.value[i].value.pc_mCode.disabled = false;
      }


      kintone.app.record.set(eRecord);
      return event;
    });
});

})();