(function() {
  'use strict';
  //商品情報取得＆繰り返し利用
  var getDEVdata=api_getRecords(sysid.INV.app_id.device);
  
  //新規拠点作成画面表示アクション
  kintone.events.on('app.record.create.show', function(event) {
    //品目一覧を取得し、品目在庫一覧に格納
    return getDEVdata.then(function(resp){
      //反転して格納
      var tarRecords=resp.records.reverse();
      //各拠点情報を当アプリの拠点リストに格納する
      //最初の空白の1行目を削除
      event.record.mStockList.value.splice(1, 1);
      //上から行を追加実行（参考：http://www.htmq.com/js/array_reverse.shtml）
      //aml: auto model list
      for(var aml in tarRecords){
        event.record.mStockList.value.push({//unshift({
          'value': {
            'mCode': {
              'value': tarRecords[aml].mCode.value,
              'type': 'SINGLE_LINE_TEXT'
            },
            'mName': {
              'value': tarRecords[aml].mName.value,
              'type': 'SINGLE_LINE_TEXT'
            },
            'mStock': {
              'value': '',
              'type': 'NUMBER'
            }
          }
        });
      }
      return event;
    }).catch(function(error){
      //event error
      console.log(error);
      alert('品目データを取得できませんでした。'+error.message);
    });
  });
  


  //新規保存時アクション
  kintone.events.on('app.record.create.submit.success', function(event) {
    //転送用データ取得
    var hcode=event.record.hCode.value;
    var hname=event.record.hName.value;
    //品目情報を拠点リストに転送
    getDEVdata.then(function(resp){
      var tarRecords=resp.records;
      
      //商品管理アプリの拠点リストに上書きするデータ作成
      var NewPrdInfo={
        'app': sysID.DIPM.app.dev,
        'records':[]
      };
      //shd: set hub data
      for (var shd in tarRecords){
        var records_set={
          'id': tarRecords[shd].$id.value,
          'record': {
            'hStockList': tarRecords[shd].hStockList
          }
        };
        var addRowData={
          'value': {
            'hCode': {'value': hcode},
            'hName': {'value': hname}
          }
        };
        records_set.record.hStockList.value.push(addRowData);
        NewPrdInfo.records.push(records_set);
      }
      return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', NewPrdInfo);
    }).then(function(resp){
      //転送成功
      alert('put data to device is success');
    }).catch(function(error){
      //event error
      console.log(error);
      alert('品目データ更新失敗'+error.message);
    });
  });
})();
