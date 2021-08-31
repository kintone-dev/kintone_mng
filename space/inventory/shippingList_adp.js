(function() {
  'use strict';
  kintone.events.on('app.record.detail.process.proceed',function(event){
    var nStatus = event.nextStatus.value;
    if(nStatus==="集荷待ち"){
      
      //パラメータsNumInfoにjsonデータ作成
      var sNumInfo={'app': sysid.DEV.app.sNum, 'records': []};
      
      var shipTable=event.record.deviceList.value;
      var shipInstName=event.record.instName.value;
      var shipShipment=event.record.shipment.value;

      console.log(shipShipment);
      
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
      return setSNinfo.then(function(resp){
        alert('update success');
      }).catch(function(error){
        alert('update error'+error.message);
        console.log(error)
      });
    }
  });
})();
