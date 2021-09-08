(function () {
  'use strict';

  var events_ced = [
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.detail.show',
    'app.record.detail.show',
    'app.record.edit.show',
    'app.record.create.show'
  ];
  kintone.events.on(events_ced, function (event) {
    //サプテーブル編集不可＆行の「追加、削除」ボタン非表示
    //[].forEach.call(document.getElementsByClassName("subtable-operation-gaia"), function(button){ button.style.display='none'; });

    function tabSwitch(onSelect) {
      switch (onSelect) {
        case '#概要':
          setFieldShown('totalInventoryAmount', true);
          setFieldShown('finishProduct', true);
          setFieldShown('inProcess', true);
          setFieldShown('totalAmountArrival', true);
          setFieldShown('acquisitionCost', true);
          setFieldShown('developmentCost', true);
          setFieldShown('subscription', true);
          setFieldShown('nonSalesAmount', true);
          setFieldShown('inventoryList', false);
          break;
        case '#在庫リスト':
          setFieldShown('totalInventoryAmount', false);
          setFieldShown('finishProduct', false);
          setFieldShown('inProcess', false);
          setFieldShown('totalAmountArrival', false);
          setFieldShown('acquisitionCost', false);
          setFieldShown('developmentCost', false);
          setFieldShown('subscription', false);
          setFieldShown('nonSalesAmount', false);
          setFieldShown('inventoryList', true);
          break;
      }
    }
    tabSwitch('#在庫リスト');
    tabMenu('tab_report', ['概要', '在庫リスト']); //タブメニュー作成
    $('.tabMenu a').on('click', function () { //タブメニュークリック時アクション
      var idName = $(this).attr('href'); //タブ内のリンク名を取得  
      tabSwitch(idName); //tabをクリックした時の表示設定
      return false;
    });
    return event;
  });

  kintone.events.on('app.record.edit.show', function (event) {
    var table = event.record.inventoryList;
    sortTable(table.value, 'sys_code', true);
    return event;
  });

  //テーブルソート関数
  var sortTable = function (table, orderBy, isDesc) {
    table.sort(function (a, b) {
      var v1 = a.value[orderBy].value;
      var v2 = b.value[orderBy].value;
      var pos = isDesc ? -1 : 1;
      if (v1 > v2) {
        return pos;
      }
      if (v1 < v2) {
        return pos * -1;
      }
    });
    return table;
  };
})();