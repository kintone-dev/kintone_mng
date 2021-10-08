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
    // [].forEach.call(document.getElementsByClassName("subtable-operation-gaia"), function(button){ button.style.display='none'; });

    for (var i in event.record.forecastList.value) {
      event.record.forecastList.value[i].value.afterLeadTimeStock.disabled = true;
      event.record.forecastList.value[i].value.forecast_arrival.disabled = true;
      event.record.forecastList.value[i].value.forecast_mName.disabled = true;
      event.record.forecastList.value[i].value.forecast_mStock.disabled = true;
      event.record.forecastList.value[i].value.forecast_shipNum.disabled = true;
      event.record.forecastList.value[i].value.mLeadTime.disabled = true;
      event.record.forecastList.value[i].value.mOrderingPoint.disabled = true;
      event.record.forecastList.value[i].value.remainingNum.disabled = true;
    }

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
          setFieldShown('forecastList', false);
          setSpaceShown('itemSortBtn', 'line', 'none');
          setSpaceShown('locationSortBtn', 'line', 'none');
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
          setFieldShown('forecastList', false);
          setSpaceShown('itemSortBtn', 'line', 'block');
          setSpaceShown('locationSortBtn', 'line', 'block');
          break;
        case '#製品別在庫残数':
          setFieldShown('totalInventoryAmount', false);
          setFieldShown('finishProduct', false);
          setFieldShown('inProcess', false);
          setFieldShown('totalAmountArrival', false);
          setFieldShown('acquisitionCost', false);
          setFieldShown('developmentCost', false);
          setFieldShown('subscription', false);
          setFieldShown('nonSalesAmount', false);
          setFieldShown('inventoryList', false);
          setFieldShown('forecastList', true);
          setSpaceShown('itemSortBtn', 'line', 'none');
          setSpaceShown('locationSortBtn', 'line', 'none');
          break;
      }
    }
    tabSwitch('#概要');
    tabMenu('tab_report', ['概要', '在庫リスト', '製品別在庫残数']); //タブメニュー作成
    $('.tabMenu a').on('click', function () { //タブメニュークリック時アクション
      var idName = $(this).attr('href'); //タブ内のリンク名を取得
      tabSwitch(idName); //tabをクリックした時の表示設定
      return false;
    });
    return event;
  });

  //ソートボタン表示、処理
  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], function (event) {
    setBtn('itemSortBtn', '商品順');
    setBtn('locationSortBtn', '拠点順');

    $('#itemSortBtn').on('click', function () {
      var eRecord = kintone.app.record.get();
      var table = eRecord.record.inventoryList.value
      table = sortItemTable(table, 'sys_code', true);

      kintone.app.record.set(eRecord);
    });

    $('#locationSortBtn').on('click', function () {
      var eRecord = kintone.app.record.get();
      var table = eRecord.record.inventoryList.value
      table = sortLocTable(table, 'sys_code', true);

      kintone.app.record.set(eRecord);
    });

    for (var i in event.record.inventoryList.value) {
      event.record.inventoryList.value[i].value.mCode.lookup = true;
    }

    return event;
  });

  //差引数量０以下の時行を赤背景に
  kintone.events.on('app.record.detail.show', function (event) {
    // startLoad('<span>ただいま処理中です。</span><br />処理完了まで1分ほどお待ちください。<br />※更新とページバックはしないでください。');
    startLoad2('type_m1');
    const GET_FIELD_CODE = Object.values(cybozu.data.page.SCHEMA_DATA.subTable);
    var iListTableClass = 'subtable-' + GET_FIELD_CODE.find(_ => _.label === '在庫一覧').id;
    var fListTableClass = 'subtable-' + GET_FIELD_CODE.find(_ => _.label === '製品別在庫残数').id;
    var inventoryData = [];
    var forecastData = [];
    var alertData = [];
    //在庫一覧テーブルデータ取得
    for (var i in event.record.inventoryList.value) {
      var inventoryBody = {
        'rowNum': parseInt(i) + 1,
        'deductionNum': event.record.inventoryList.value[i].value.deductionNum.value,
        'location': event.record.inventoryList.value[i].value.stockLocation.value
      }
      inventoryData.push(inventoryBody);
    }

    //製品別在庫残数テーブルデータ取得
    for (var i in event.record.forecastList.value) {
      var forecastBody = {
        'rowNum': parseInt(i) + 1,
        'remainingNum': event.record.forecastList.value[i].value.remainingNum.value,
        'mOrderingPoint': event.record.forecastList.value[i].value.mOrderingPoint.value,
        'forecast_mName': event.record.forecastList.value[i].value.forecast_mName.value
      }
      forecastData.push(forecastBody);
    }

    //データ表示後動かす
    setTimeout(function () {
      for (var i in inventoryData) {
        //差引数量マイナスのものを赤背景に
        if (parseInt(inventoryData[i].deductionNum) < 0) {
          $('.' + iListTableClass + ' tr:nth-child(' + inventoryData[i].rowNum + ')').css({
            'background-color': 'red'
          });
          $('.' + iListTableClass + ' tr:nth-child(' + inventoryData[i].rowNum + ') td div').css({
            'color': 'white'
          })
        }
      }

      for (var i in forecastData) {
        //差引残数が発注点の10%以下のものを赤背景に
        if (parseInt(forecastData[i].mOrderingPoint) * 0.1 >= parseInt(forecastData[i].remainingNum)) {
          $('.' + fListTableClass + ' tr:nth-child(' + forecastData[i].rowNum + ')').css({
            'background-color': 'red'
          });
          $('.' + fListTableClass + ' tr:nth-child(' + forecastData[i].rowNum + ') td div').css({
            'color': 'white'
          })
          alertData.push(forecastData[i].forecast_mName);
          //差引残数が発注点の30%以下のものを赤背景に
        } else if (parseInt(forecastData[i].mOrderingPoint) * 0.3 >= parseInt(forecastData[i].remainingNum)) {
          $('.' + fListTableClass + ' tr:nth-child(' + forecastData[i].rowNum + ')').css({
            'background-color': 'yellow'
          });
        }
      }

      if (alertData != 0) {
        var alertTxt = '以下の商品は、差引残数が発注点の10%以下です。\n'
        for (var i in alertData) {
          alertTxt = alertTxt + alertData[i] + '\n';
        }
        alert(alertTxt);
      }
      endLoad();
    }, 60000);

    if (event.record.EoMcheck.value == '締切' || event.record.EoMcheck.value == '一時締切') {
      setTimeout(function () {
        for (var i in inventoryData) {
          //差引数量0の文字色を青色に
          if (parseInt(inventoryData[i].deductionNum) == 0) {
            $('.' + iListTableClass + ' tr:nth-child(' + inventoryData[i].rowNum + ') td div').css({
              'color': 'blue',
              'font-weight': 'bold'
            });
          }

          //特定拠点の文字色を緑に
          if (inventoryData[i].location == '〇〇〇〇') {
            $('.' + iListTableClass + ' tr:nth-child(' + inventoryData[i].rowNum + ') td div').css({
              'color': 'green',
              'font-weight': 'bold'
            });
          }
        }
      }, 60000);
    }

    return event;
  });

  // 締切保存時 特定の拠点を削除
  kintone.events.on(['app.record.edit.submit', 'app.record.create.submit'], function (event) {
    if (event.record.EoMcheck.value == '締切') {
      var inventoryList = event.record.inventoryList.value;
      var newList = [];
      var ignoreUnitArray = ['ns-', '-oo', '-xx', '-zz', '-aa'];
      var ignoreUnit = new RegExp(ignoreUnitArray.join('|'));
      //特定の拠点以外を抜き出して再度格納
      for (var i in inventoryList) {
        if (!inventoryList[i].value.sys_code.value.match(ignoreUnit)) {
          newList.push(inventoryList[i]);
        }
      }
      event.record.inventoryList.value = newList;
      return event;
    }
  });

  //商品順ソート関数
  var sortItemTable = function (table, orderBy, isDesc) {
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

  //拠点順ソート関数
  var sortLocTable = function (table, orderBy, isDesc) {
    table.sort(function (a, b) {
      var codeCutterA = a.value[orderBy].value.lastIndexOf('-');
      var codeCutterB = b.value[orderBy].value.lastIndexOf('-');
      var v1 = a.value[orderBy].value.slice(codeCutterA + 1) + a.value[orderBy].value.substring(0, codeCutterA);
      var v2 = b.value[orderBy].value.slice(codeCutterB + 1) + b.value[orderBy].value.substring(0, codeCutterB);
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