(function() {
  'use strict';
  //拠点管理アプリのレコード情報取得
  var getUNITrecord={
    'app': sysid.INV.app_id.unit,
    'query': null
  };
  //拠点情報取得＆繰り返し利用
  var getUNITdata=kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getUNITrecord);
  
  //新規品目作成時アクション
  kintone.events.on('app.record.create.show', function(event){
    //拠点データを取得し、拠点在庫一覧に格納
    
    return getUNITdata.then(function(resp){
      //反転して格納
      var tarRecords=resp.records.reverse();
      //各拠点情報を当アプリの拠点リストに格納する
      //最初の空白の1行目を削除
      event.record.hStockList.value.splice(0, 1);
      //上から行を追加実行（参考：http://www.htmq.com/js/array_reverse.shtml）
      //ahl: auto hub list
      for(var ahl in tarRecords){
        event.record.hStockList.value.push({
          value: {
            hCode: {
              value: tarRecords[ahl].hCode.value,
              type: 'SINGLE_LINE_TEXT'
            },
            hName: {
              value: tarRecords[ahl].hName.value,
              type: 'SINGLE_LINE_TEXT'
            },
            hStock: {
              value: '',
              type: 'NUMBER'
            }
          }
        });
      }
      return event;
    }).catch(function(error){
      console.log(error);
      alert('拠点データを取得できませんでした。'+error.message);
    });
  });
  
  //新規保存時アクション
  kintone.events.on('app.record.create.submit.success', function(event) {
    //転送用データ取得
    var mname=event.record.mName.value;
    var mcode=event.record.mCode.value;
    var mtype=event.record.mType.value;
    var mvendor=event.record.mVendor.value;
    var mnickname=event.record.mNickname.value;
    
    //品目情報を拠点リストに転送
    getUNITdata.then(function(resp){
      var tarRecords=resp.records;
      
      //拠点管理アプリの品目リストに上書きするデータ作成
      var NewPrdInfo={
        'app': sysid.INV.app_id.unit,
        'records':[]
      };
      //spd: set product data
      for (var spd in tarRecords){
        var records_set={
          'id': tarRecords[spd].$id.value,
          'record': {
            'mStockList': tarRecords[spd].mStockList
          }
        };
        var addRowData={
          'value': {
            'mCode': {'value': mcode},
            'mName': {'value': mname}
          }
        };
        records_set.record.mStockList.value.push(addRowData);
        NewPrdInfo.records.push(records_set);
      }
      return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', NewPrdInfo);
    }).then(function(resp){
      //転送成功
      alert('put data to UNIT is success');
    }).catch(function(error){
      //event error
      console.log(error);
      alert('UNITにデータ更新失敗'+error.message);
    });

    //案件管理にデータ転送
    var newPMinfo = {
      'app': sysid.PM.app_id.item,
      'record': {
        'mName': {'value': mname},
        'mCode': {'value': mcode},
        'mType': {'value': mtype},
        'mVendor': {'value': mvendor},
        'mNickname': {'value': mnickname}
      }
    };
    var pmResult=new kintone.api(kintone.api.url('/k/v1/record', true), 'POST', newPMinfo);
    //転送結果
    pmResult.then(function(resp){
      alert('PM success');
    }).catch(function(error){
      alert('PM'+error.message);
    });
    
    //supportとtitanにデータ転送
    //品目区分が「仕掛品」の場合、転送しない
    if(mtype!='仕掛品'){
      //Titan
      var newASSinfo = {
        'app': sysID.ASS.app.dev,
        'record': {
          'mName': {'value': mname},
          'mCode': {'value': mcode},
          'mType': {'value': mtype},
          'mVendor': {'value': mvendor},
          'mNickname': {'value': mnickname}
        }
      };
      var assResult=new kintone.api(kintone.api.url('/k/v1/record', true), 'POST', newASSinfo);
      //転送結果
      assResult.then(function(resp){
        alert('Titan success');
      }).catch(function(error){
        alert('Titan'+error.message);
      });
      
      //Support
      var newSUPinfo = {
        'app': sysID.SUP.app.dev,
        'record': {
          'mName': {'value': mname},
          'mCode': {'value': mcode},
          'mType': {'value': mtype},
          'mVendor': {'value': mvendor},
          'mNickname': {'value': mnickname}
        }
      };
      var supResult=new kintone.api(kintone.api.url('/k/v1/record', true), 'POST', newSUPinfo);
      //転送結果
      supResult.then(function(resp){
        alert('Support success');
      }).catch(function(error){
        alert('Support'+error.message);
      });
    }
    return event;
  });
  
  //編集詳細閲覧時アクション
  var before_mCode;
  kintone.events.on('app.record.edit.show', function(event){
    before_mCode=event.record.mCode.value;

    return event;
  });
  
  
  //編集保存時アクション
  kintone.events.on('app.record.edit.submit', function(event) {
    //転送用データ取得
    var mname=event.record.mName.value;
    var mtype=event.record.mType.value;
    var mvendor=event.record.mVendor.value;
    var mnickname=event.record.mNickname.value;
    var endservice=event.record.endservice.value;

    //案件管理にデータ転送
    var updPMinfo = {
      'app': sysid.PM.app_id.item,
      'updateKey': {
        'field': 'mCode',
        'value': before_mCode
      },
      'record': {
        'mName': {'value': mname},
        'mType': {'value': mtype},
        'mVendor': {'value': mvendor},
        'mNickname': {'value': mnickname},
        'endservice': {'value': endservice}
      }
    };
    var pmResult=new kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', updPMinfo);
    //更新結果
    pmResult.then(function(resp){
      alert('PM success');
    }).catch(function(error){
      alert('PM'+error.message);
    });
    
    //品目区分が「仕掛品」の場合、更新しない
    if(mtype!='仕掛品'){
      //Titanを更新
      var updASSinfo = {
        'app': sysID.ASS.app.dev,
        'updateKey': {
          'field': 'mCode',
          'value': before_mCode
        },
        'record': {
          'mName': {'value': mname},
          'mType': {'value': mtype},
          'mVendor': {'value': mvendor},
          'mNickname': {'value': mnickname},
          'endservice': {'value': endservice}  
        }
      };
      var assResult=new kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', updASSinfo);
      //更新結果
      assResult.then(function(resp){
        alert('Titan success');
      }).catch(function(error){
        alert('Titan'+error.message);
      });
      
      //supportを更新
      var updSUPinfo = {
        'app': sysID.SUP.app.dev,
        'updateKey': {
          'field': 'mCode',
          'value': before_mCode
        },
        'record': {
          'mName': {'value': mname},
          'mType': {'value': mtype},
          'mVendor': {'value': mvendor},
          'mNickname': {'value': mnickname},
          'endservice': {'value': endservice}  
        }
      };
      var supResult=new kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', updSUPinfo);
      //更新結果
      supResult.then(function(resp){
        alert('Support success');
      }).catch(function(error){
        alert('Support'+error.message);
      });
    }
    return event;
  });

})();