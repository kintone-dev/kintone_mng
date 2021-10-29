(function () {
  //プロセスエラー処理
  kintone.events.on('app.record.detail.show', async function (event) {
    var processECheck = await processError(event);
    if (processECheck[0] == 'error') {
      alert(processECheck[1]);
    }
    return event;
  });
})();