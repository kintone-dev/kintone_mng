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
      eRecord.record.hStockList.value.splice(0, 1);
      //ahl: auto hub list
      for (var ahl in tarRecords) {
        eRecord.record.hStockList.value.push({
          value: {
            hCode: {value: tarRecords[ahl].uCode.value, type: 'SINGLE_LINE_TEXT'},
            hName: {value: tarRecords[ahl].uName.value, type: 'SINGLE_LINE_TEXT'},
            hStock: {value: '', type: 'NUMBER'}
          }
        });
        eRecord.record.uStockList.value[ahl].value.uCode.disabled=true;
        eRecord.record.uStockList.value[ahl].value.uName.disabled=true;
        eRecord.record.uStockList.value[ahl].value.uStock.disabled=true;
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
      var tarRecords=resp.records;

      // 拠点管理アプリの品目リストに上書きするデータ作成
      var NewPrdInfo={
        'app': sysid.INV.app_id.unit,
        'records': []
      };
      //spd: set product data
      for (var spd in tarRecords) {
        var records_set={
          'id': tarRecords[spd].$id.value,
          'record': {
            'mStockList': tarRecords[spd].mStockList
          }
        };
        var addRowData={
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
    /*.then(function (resp) {
      // 転送成功
      console.log('put data to UNIT is success');
    }).catch(function (error) {
      //event error
      console.log(error);
      console.log('UNITにデータ更新失敗' + error.message);
    });*/

    /* 新規データ転送 */
    //　転送データ作成
    var postItemBody={
      'app': '',
      'record': {
        'mName': event.record.mName,
        'mCode': event.record.mCode,
        'mNickname': event.record.mNickname,
        'mType': event.record.mType,
        'mVendor': event.record.mVendor,
        'mClassification':event.record.mClassification,
        'packageComp': event.record.packageComp
      }
    };
    // 転送先指定
    var tarAPP=[
      sysid.PM.app_id.item,
      sysid.SUP.app_id.item,
      sysid.ASS.app_id.item
    ];
    // 転送実行
    for (var pi in tarAPP){
      postItemBody.app=tarAPP[pi];
      kintone.api(kintone.api.url('/k/v1/record', true), 'POST', postItemBody);
      /*
      .then(function (resp) {
        console.log(tarAPP[pi]+' success');
      }).catch(function (error) {
        console.log(tarAPP[pi]+error.message);
      });
      */
    }
    return event;
  });

  // 編集保存時アクション
  kintone.events.on('app.record.edit.submit', function (event) {

    /* 更新データ転送 */
    // 転送データ作成
    var putItemBody={
      'app': '',
      'updateKey': {'field': 'mCode','value': event.record.mCode.value},
      'record': {
        'mName': event.record.mName,
        'mNickname': event.record.mNickname,
        'mType': event.record.mType,
        'mVendor': event.record.mVendor,
        'mClassification':event.record.mClassification,
        'packageComp': event.record.packageComp
      }
    };
    // 転送先指定
    var tarAPP=[
      sysid.PM.app_id.item,
      sysid.SUP.app_id.item,
      sysid.ASS.app_id.item
    ];
    // 転送実行
    for (var pi in tarAPP){
      putItemBody.app=tarAPP[pi];
      kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', putItemBody);
      /*
      .then(function (resp) {
        console.log(tarAPP[pi]+' success');
      }).catch(function (error) {
        console.log(tarAPP[pi]+error.message);
      });
      */
    }
    return event;
  });

})();