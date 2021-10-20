function deletSB(subTable, fCode){
  // let subTableValue=kintone.app.record.get().record[subTable];
  // for(let i in subTableValue){
  //   subTableValue[i].value[fCode].value='';
  // }
  kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', {app:kintone.app.getId()}).then(function(resp){
    console.log(resp);
    let recordList=resp.records;
    for(let i in recordList){
      let subTableValue=recordList[i][subTable].value;
      for (let y in subTableValue){
        subTableValue[y].value[fCode].value='';
      }
    }
    console.log(resp);
  });
}