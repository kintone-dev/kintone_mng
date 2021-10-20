function deletSB(subTable, fCode){
  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', {app:kintone.app.getId()}).then(function(resp){
    let recordList=resp.records;
    let body={
      app:kintone.app.getId(),
      records:[]
    }
    for(let i in recordList){
      let subTableValue=recordList[i][subTable].value;
      for (let y in subTableValue){
        subTableValue[y].value[fCode].value='';
      }
      body.records.push({
        id:recordList[i].$id,
        record:{[subTable]:recordList[i][subTable]}
      })
    }
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
    // console.log(body);
  }).then(function(resp){
    console.log(resp);
  }).catch(function(err){
    console.log(err);
  });
}