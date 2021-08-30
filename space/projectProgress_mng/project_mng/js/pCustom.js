
(function() {
  'use strict';
  kintone.events.on(['app.record.create.show', 'app.record.detail.show', 'app.record.edit.show'], function(event){
    event.record.cSales.disabled=false;
    if(event.record.Exist_Project.value=='既存案件'){
      setFieldShown('samePRJ', true);
    }else{
      setFieldShown('samePRJ', false);
    }
  });
  kintone.events.on(['app.record.create.change.Exist_Project', 'app.record.edit.change.Exist_Project'], function(event){
    if(event.record.Exist_Project.value=='既存案件'){
      setFieldShown('samePRJ', true);
    }else{
      setFieldShown('samePRJ', false);
    }
  });
  //新規導入案件
  kintone.events.on('app.record.create.show', function(event){
    autoNum('PRJ_', 'prj_aNum');
    event.record.prj_aNum.disabled=true;
    return event;
  });
  //新・既存案件切り替え
  kintone.events.on('app.record.create.change.Exist_Project', function(event){
    var epValue=event.record.Exist_Project.value;
    if(epValue=="既存案件"){
      event.record.prj_aNum.value="";
      event.record.prj_aNum.disabled=false;
    }else{
      autoNum('PRJ_', 'prj_aNum');
      event.record.prj_aNum.disabled=true;
    }
    return event;
  });
  kintone.events.on(['app.record.index.edit.show','app.record.edit.show'], function(event){
    event.record.prj_aNum.disabled=true;
    event.record.Exist_Project.disabled=true;
      return event;
  });
  kintone.events.on('app.record.detail.process.proceed', function(event){
    var nStatus=event.nextStatus.value;
    if(nStatus=='納品手配済'){
      var queryBody={
        'app': sysID.DIPM.app.ship,
        'query': 'prj_aNum="'+event.record.prj_aNum.value+'" and ステータス in ("納品情報未確定")',
        'fields': ['prj_aNum','$id','ステータス','shipType']
      };
      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', queryBody).then(function(getResp){
        //「確認中」の「用途」がある場合、「用途」を更新するBody作成
        var update_shipType={
          'app':sysID.DIPM.app.ship,
          'records':[]
        };
        //Statusの更新用Body作成
        var update_Status={
          'app':sysID.DIPM.app.ship,
          'records':[]
        };
        
        for(var i in getResp.records){
          //「確認中」の「用途」がある場合、update_shipTypeのrecordsに追加
          if(getResp.records[i].shipType.value=='確認中'){
            update_shipType.records.push({
              'id': getResp.records[i].$id.value,
              'record': {'shipType': {'value':event.record.shipType.value}}
            });
          }
          update_Status.records.push({
            'id':getResp.records[i].$id.value,
            'action': '処理開始',
            //'assignee': 'kintone_mng@accel-lab.com'
          });
        }
        if(update_shipType.records.length>0) kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', update_shipType);//.then(function(resp){console.log(resp)}).catch(function(error){console.log(error)});
        kintone.api(kintone.api.url('/k/v1/records/status', true), 'PUT', update_Status);//.then(function(resp){console.log(resp)}).catch(function(error){console.log(error)});
        
          
      }).catch(function(error){
        console.log(error);
        console.log(error.message);
      });
      
      var putBody={
        
      };
    }
    return event;
  });

})();
