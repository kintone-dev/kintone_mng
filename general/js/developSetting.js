(function () {
  'use strict';

  var events_ced = [
    'app.record.index.show',
    'app.record.detail.show',
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.print.show',
    'app.report.show',
    'portal.show',
    'space.portal.show'
  ];
  // indexページでの新規、編集、複製ボタン非表示
  kintone.events.on(events_ced, function (event) {
    //編集を表示するユーザー
    var ignoreUser = ['sysdev','kintone_mng@accel-lab.com'];
    //編集を表示しないページ
    var deletePage = [sysid.INV.app_id.report];
    if(ignoreUser.includes(kintone.getLoginUser().code)){
      if(deletePage.includes(kintone.app.getId())){
        $('.gaia-argoui-app-menu-add').remove();
        $('.recordlist-edit-gaia').remove();
        $('.recordlist-remove-gaia').remove();
        $('.gaia-argoui-app-menu-edit').remove();
        $('.gaia-argoui-app-menu-copy').remove();
      }
    }
    return event;
  });


})();