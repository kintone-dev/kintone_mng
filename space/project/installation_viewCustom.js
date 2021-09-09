(function () {
  'use strict';

  kintone.events.on(['app.record.create.change.editMC', 'app.record.edit.change.editMC', 'app.record.create.show', 'app.record.edit.show'], function (event) {
    var editmc = event.record.editMC.value;

    //請求先はずっと編集不可
    event.record.cName.disabled = true;

    //チェックボックス条件
    if (editmc.includes('管理対象外')) {
      event.record.BMC.disabled = false;
      event.record.RRMC.disabled = false;
      event.record.BMC.value = "";
      event.record.RRMC.value = "";
    } else if (editmc[0] == "建物管理" && editmc[1] == "賃貸管理") {
      event.record.BMC.disabled = false;
      event.record.RRMC.disabled = false;
    } else if (editmc.includes('建物管理')) {
      event.record.BMC.disabled = false;
      event.record.RRMC.disabled = true;
    } else if (editmc.includes('賃貸管理')) {
      event.record.BMC.disabled = true;
      event.record.RRMC.disabled = false;
    } else {
      event.record.BMC.disabled = true;
      event.record.RRMC.disabled = true;
    }

    return event;
  });

  kintone.events.on(['app.record.create.show', 'app.record.detail.show', 'app.record.edit.show'], function (event) {
    event.record.prj_aNum.disabled = true;
    setFieldShown('sys_address', false);
    setFieldShown('bType', false);
    setFieldShown('bDivision', false);
    setFieldShown('ルックアップ_0', false);
    setFieldShown('ルックアップ', false);
    setFieldShown('cDate__s_0', false);
    setFieldShown('cDate__s', false);
    setFieldShown('uNum__s', false);
    setFieldShown('iuNum__s', false);
    setFieldShown('sWarranty__s', false);
    setFieldShown('eWarranty__s', false);
    setFieldShown('yWarranty__s', false);

    function tabSwitch(onSelect){
      switch(onSelect){
        case '#設置先概要':
          setFieldShows('orgName', true);
          setSpaceShown('btn_newORG', 'individual', 'block');
          setFieldShows('bnName', true);
          setFieldShows('bName', true);
          setFieldShows('editMC', true);
          setFieldShows('cName', true);
          setFieldShows('BMC', true);
          setFieldShows('RRMC', true);
          setFieldShows('bMemo', true);
          setFieldShows('receiver', false);
          setFieldShows('phoneNum', false);
          setFieldShows('zipcode', false);
          setFieldShows('prefectures', false);
          setFieldShows('city', false);
          setFieldShows('address', false);
          setFieldShows('kittingCorp', false);
          setFieldShows('instCorp', false);
          setFieldShows('instDate', false);
          setFieldShows('instDDday', false);
          setFieldShows('propertieNum', false);
          setFieldShows('instedNum', false);
          setFieldShows('sWarranty', false);
          setFieldShows('eWarranty', false);
          setFieldShows('warranty', false);
          break;
          case '#設置先住所':
            setFieldShows('orgName', false);
            setSpaceShown('btn_newORG', 'individual', 'block');
            setFieldShows('bnName', false);
            setFieldShows('bName', false);
            setFieldShows('editMC', false);
            setFieldShows('cName', false);
            setFieldShows('BMC', false);
            setFieldShows('RRMC', false);
            setFieldShows('bMemo', false);
            setFieldShows('receiver', true);
            setFieldShows('phoneNum', true);
            setFieldShows('zipcode', true);
            setFieldShows('prefectures', true);
            setFieldShows('city', true);
            setFieldShows('address', true);
            setFieldShows('kittingCorp', false);
            setFieldShows('instCorp', false);
            setFieldShows('instDate', false);
            setFieldShows('instDDday', false);
            setFieldShows('propertieNum', false);
            setFieldShows('instedNum', false);
            setFieldShows('sWarranty', false);
            setFieldShows('eWarranty', false);
            setFieldShows('warranty', false);
            break;
        case '#設置情報':
          setFieldShows('orgName', false);
          setSpaceShown('btn_newORG', 'individual', 'block');
          setFieldShows('bnName', false);
          setFieldShows('bName', false);
          setFieldShows('editMC', false);
          setFieldShows('cName', false);
          setFieldShows('BMC', false);
          setFieldShows('RRMC', false);
          setFieldShows('bMemo', false);
          setFieldShows('receiver', false);
          setFieldShows('phoneNum', false);
          setFieldShows('zipcode', false);
          setFieldShows('prefectures', false);
          setFieldShows('city', false);
          setFieldShows('address', false);
          setFieldShows('kittingCorp', true);
          setFieldShows('instCorp', true);
          setFieldShows('instDate', true);
          setFieldShows('instDDday', true);
          setFieldShows('propertieNum', true);
          setFieldShows('instedNum', true);
          setFieldShows('sWarranty', true);
          setFieldShows('eWarranty', true);
          setFieldShows('warranty', true);
          break;
      }
    }tabSwitch('#設置先概要');
    tabMenu('tab_inst', ['設置先概要','設置先住所','設置情報']);
    $('.tab_inst a').on('click', function(){
      var idName = $(this).attr('href'); //タブ内のリンク名を取得  
      tabSwitch(idName); //tabをクリックした時の表示設定
      return false;
    });
    return event;
  });
})();