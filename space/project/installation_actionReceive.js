(function() {
  'use strict';
  kintone.events.on('app.record.create.show', function(event) {
    //コピー元の「prj_aNum」の値をsessionStorageの値から代入
    event.record.prj_aNum.value = sessionStorage.getItem('prj_aNum');
    event.record.orgName.value = sessionStorage.getItem('orgName');
    event.record.orgName.lookup=true;
    //キャンセルした時の処理
    var cancel_btn = document.getElementsByClassName('gaia-ui-actionmenu-cancel');
    cancel_btn[0].addEventListener('click', function() {
        window.close();
    }, false);

    //反映したあとはsessionStorageの中身を削除
    //sessionStorage.clear();
    sessionStorage.removeItem('prj_aNum');
    sessionStorage.removeItem('orgName');
    return event;
  });
  kintone.events.on('app.record.create.submit', function(event){
        var save_btn = document.getElementsByClassName('gaia-ui-actionmenu-save');
    save_btn[0].addEventListener('click', function() {
        window.close();
    }, true);
  });
})();