(function () {
  'use strict';
  kintone.events.on('app.record.index.show', function (event) {
    var sync_kintone = setBtn_index('btn_sync_kintone', '情報連携');

    $('#' + sync_kintone.id).on('click', async function () {
      startLoad();
      /*①
        申込種別：指定なし
        作業ステータス：対応完了

        シリアル管理の対応した会員IDのものに申込種別を更新
      */
      var getCompBody = {
        'app': kintone.app.getId(),
        'query': 'churn_status in ("対応完了")'
      };
      var compData = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getCompBody)
        .then(function (resp) {
          return resp;
        }).catch(function (error) {
          console.log(error);
          return ['error', error];
        });
      if (Array.isArray(compData)) {
        event.error = 'シリアル管理連携の際にエラーが発生しました';
        endLoad();
        return event;
      }
      console.log(compData);




      endLoad();
    });

    return event;
  });
})();