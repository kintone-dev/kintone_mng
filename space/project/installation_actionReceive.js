(function () {
  'use strict';

  kintone.events.on('app.record.create.show', function (event) {
    //コピー元の「prjNum」の値をsessionStorageの値から代入
    event.record.prjNum.value = sessionStorage.getItem('prjNum');
    event.record.bnName.value = sessionStorage.getItem('bnName');
    event.record.bName.value = sessionStorage.getItem('bName');
    event.record.bnName.disabled = sessionStorage.getItem('setShown');
    event.record.bName.disabled = sessionStorage.getItem('setShown');
    // setSpaceShown('btn_newORG','individual',sessionStorage.getItem('btn_newORG_shown'))
    //キャンセルした時の処理
    var cancel_btn = document.getElementsByClassName('gaia-ui-actionmenu-cancel');
    cancel_btn[0].addEventListener('click', function () {
      window.close();
    }, false);

    //反映したあとはsessionStorageの中身を削除
    //sessionStorage.clear();
    sessionStorage.removeItem('prjNum');
    sessionStorage.removeItem('bnName');
    sessionStorage.removeItem('bName');
    sessionStorage.removeItem('setShown');
    // sessionStorage.removeItem('btn_newORG_shown');
    return event;
  });

  kintone.events.on('app.record.create.submit', function (event) {
    var save_btn = document.getElementsByClassName('gaia-ui-actionmenu-save');
    save_btn[0].addEventListener('click', function () {
      window.close();
    }, true);
  });
})();