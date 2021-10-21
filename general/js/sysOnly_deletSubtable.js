(function () {
  'use strict';
  kintone.events.on('app.record.index.show', function(event){
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', {app:kintone.app.getId()}).then(function(resp){
      let recordList=resp.records;
      let body={
        app:kintone.app.getId(),
        records:[]
      }
      for(let i in recordList){
        let subTableValue=recordList[i].uStockList.value;
        for (let y in subTableValue){
          subTableValue[y].value.uStock.value='';
        }
        body.records.push({
          id:recordList[i].$id,
          record:{uStockList:recordList[i].uStockList}
        })
      }
      console.log(body);
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', body).then(function(resp){
        console.log(resp);
      }).catch(function(err){
        console.log(err);
      });
      // console.log(body);
    }).catch(function(err){
      console.log(err);
    });
  });
})();