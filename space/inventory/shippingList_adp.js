(function() {
  'use strict';

  //拠点情報取得＆繰り返し利用
  kintone.events.on('app.record.detail.process.proceed',function(event){
    var nStatus = event.nextStatus.value;
    
    if(nStatus==="集荷待ち"){
      //パラメータsNumInfoにjsonデータ作成
      var sNumInfo={
        'app': sysid.DEV.app.sNum, 
        'records': []
      };
      
      var shipTable=event.record.deviceList.value;
      var shipInstName=event.record.instName.value;
      var shipShipment=event.record.shipment.value;
      
      
      if(shipShipment === '矢倉倉庫'){
        for (var i in shipTable){
          var ship_mcode=shipTable[i].value.mCode.value;
          var ship_shipnum=shipTable[i].value.shipNum.value;
          var ship_sn=shipTable[i].value.sNum.value;
          //get serial numbers
          var get_sNums=ship_sn.split(/\r\n|\n/);
          //except Boolean
          var sNums=get_sNums.filter(Boolean);
          
          for(var y in sNums){
            var snRecord={
              'sNum':{'value':sNums[y]},
              'mCode':{'value':ship_mcode},
              'instName':{'value':shipInstName},
              'shipment':{'value':shipShipment}
            };
            sNumInfo.records.push(snRecord);
          }
        }
        
        var setSNinfo= new kintone.api(kintone.api.url('/k/v1/records', true), 'POST', sNumInfo);
      }else{
        for (var i in shipTable){
          var ship_mcode=shipTable[i].value.mCode.value;
          var ship_shipnum=shipTable[i].value.shipNum.value;
          var ship_sn=shipTable[i].value.sNum.value;
          //get serial numbers
          var get_sNums=ship_sn.split(/\r\n|\n/);
          //except Boolean
          var sNums=get_sNums.filter(Boolean);
          
          for(var y in sNums){      
            var snRecord={
              'updateKey':{
                'field':'sNum',
                'value':sNums[y]
              },
              'record':{
                'mCode':{'value':ship_mcode},
                'instName':{'value':shipInstName},
                'shipment':{'value':shipShipment}
              }
            };
            sNumInfo.records.push(snRecord);
          }
        }
        
        var setSNinfo= new kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', sNumInfo);
      }
      
      return setSNinfo.then(function(resp){
        console.log(resp);
      }).catch(function(error){
        console.error(error);
      });
    }
  });

  kintone.events.on(['app.record.edit.show','app.record.create.show'],function(event){
    setBtn('calBtn','計算');


    $('#calBtn').on('click', function() {
      var eRecord = kintone.app.record.get();
      var shipTable = eRecord.record.deviceList.value;
  
      console.log(shipTable[0]);
      console.log(shipTable[0].sNum.value);

      // trtDY(1,2,3);
      kintone.app.record.set(eRecord);
    });

    return event;
  });


})();
