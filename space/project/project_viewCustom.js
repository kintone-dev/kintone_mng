(function () {
  'use strict';
  // 新規導入案件 案件番号自動採番
  kintone.events.on('app.record.create.show', function (event) {
    autoNum('PRJ_', 'prjNum');
    event.record.prjNum.disabled = true;
    setFieldShown('invoiceNum', false);
    setFieldShown('invoiceStatus', false);
    return event;
  });

  var prjNumValue='';
  kintone.events.on('app.record.create.change.prjNum', function(event) {
    prjNumValue=event.record.prjNum.value;
    return event;
  });

  kintone.events.on('app.record.edit.change.invoiceNum', function(event){
    if(event.record.invoiceNum.value===''||event.record.invoiceNum.value===undefined) setFieldShown('invoiceStatus', false);
    else setFieldShown('invoiceStatus', true);
  });
  kintone.events.on(['app.record.create.show', 'app.record.detail.show', 'app.record.edit.show'], function (event) {
    event.record.cSales.disabled = false;
    setFieldShown('sys_suptitle', true);
    if(event.record.invoiceNum.value===''||event.record.invoiceNum.value===undefined) setFieldShown('invoiceStatus', false);
    else setFieldShown('invoiceStatus', true);
    // 新・既存案件表示切り替え
    function tabSwitch(onSelect){
      switch(onSelect){
        case '#案件情報':
          setFieldShown('prjNum', true);
          setFieldShown('Exist_Project', true);
          setFieldShown('salesType', true);
          setFieldShown('predictDate', true);
          setFieldShown('purchaseOrder', true);
          setFieldShown('prjMemo', true);
          if (event.record.Exist_Project.value == '既存案件') setFieldShown('samePRJ', true);
          else setFieldShown('samePRJ', false);
          setSpaceShown('btn_newINST', 'individual', 'none');
          setSpaceShown('btn_unknowINST', 'individual', 'none');
          setFieldShown('orgName', false);
          setFieldShown('cName', false);
          setFieldShown('cSales', false);
          setFieldShown('instName', false);
          setFieldShown('instStatus', false);
          setFieldShown('instDate', false);
          setFieldShown('instDDday', false);
          setFieldShown('tarDate', false);
          setFieldShown('aboutDelivery', false);
          setFieldShown('deviceList', false);
          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          break;
        case '#設置先情報':
          setFieldShown('prjNum', false);
          setFieldShown('Exist_Project', false);
          setFieldShown('salesType', false);
          setFieldShown('predictDate', false);
          setFieldShown('purchaseOrder', false);
          setFieldShown('prjMemo', false);
          setFieldShown('samePRJ', false);
          if(event.record.instName.value==undefined){
            setSpaceShown('btn_newINST', 'individual', 'block');
            setSpaceShown('btn_unknowINST', 'individual', 'block');
          }else{
            setSpaceShown('btn_newINST', 'individual', 'none');
            setSpaceShown('btn_unknowINST', 'individual', 'none');
          }
          setFieldShown('orgName', true);
          setFieldShown('cName', true);
          setFieldShown('cSales', true);
          setFieldShown('instName', true);
          setFieldShown('instStatus', true);
          setFieldShown('instDate', true);
          setFieldShown('instDDday', true);
          setFieldShown('tarDate', false);
          setFieldShown('aboutDelivery', false);
          setFieldShown('deviceList', false);
          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          break;
        case '#納品依頼リスト':
          setFieldShown('prjNum', false);
          setFieldShown('Exist_Project', false);
          setFieldShown('salesType', false);
          setFieldShown('predictDate', false);
          setFieldShown('purchaseOrder', false);
          setFieldShown('prjMemo', false);
          setFieldShown('samePRJ', false);
          setSpaceShown('btn_newINST', 'individual', 'none');
          setSpaceShown('btn_unknowINST', 'individual', 'none');
          setFieldShown('orgName', false);
          setFieldShown('cName', false);
          setFieldShown('cSales', false);
          setFieldShown('instName', false);
          setFieldShown('instStatus', false);
          setFieldShown('instDate', false);
          setFieldShown('instDDday', false);
          setFieldShown('tarDate', true);
          setFieldShown('aboutDelivery', true);
          setFieldShown('deviceList', true);
          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          break;
        case '#宛先情報':
          setFieldShown('prjNum', false);
          setFieldShown('Exist_Project', false);
          setFieldShown('salesType', false);
          setFieldShown('predictDate', false);
          setFieldShown('purchaseOrder', false);
          setFieldShown('prjMemo', false);
          setFieldShown('samePRJ', false);
          setSpaceShown('btn_newINST', 'individual', 'none');
          setSpaceShown('btn_unknowINST', 'individual', 'none');
          setFieldShown('orgName', false);
          setFieldShown('cName', false);
          setFieldShown('cSales', false);
          setFieldShown('instName', false);
          setFieldShown('instStatus', false);
          setFieldShown('instDate', false);
          setFieldShown('instDDday', false);
          setFieldShown('tarDate', false);
          setFieldShown('aboutDelivery', false);
          setFieldShown('deviceList', false);
          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);

          break;
        case '#輸送情報':
          setFieldShown('prjNum', false);
          setFieldShown('Exist_Project', false);
          setFieldShown('salesType', false);
          setFieldShown('predictDate', false);
          setFieldShown('purchaseOrder', false);
          setFieldShown('prjMemo', false);
          setFieldShown('samePRJ', false);
          setSpaceShown('btn_newINST', 'individual', 'none');
          setSpaceShown('btn_unknowINST', 'individual', 'none');
          setFieldShown('orgName', false);
          setFieldShown('cName', false);
          setFieldShown('cSales', false);
          setFieldShown('instName', false);
          setFieldShown('instStatus', false);
          setFieldShown('instDate', false);
          setFieldShown('instDDday', false);
          setFieldShown('tarDate', false);
          setFieldShown('aboutDelivery', false);
          setFieldShown('deviceList', false);
          setFieldShown('deliveryCorp', true);
          setFieldShown('trckNum', true);
          setFieldShown('sendDate', true);
          setFieldShown('expArrivalDate', true);
          break;
      }
    }tabSwitch('#案件情報');
    //タブメニュー作成
    tabMenu('tab_project', ['案件情報','設置先情報','納品依頼リスト','宛先情報','輸送情報']);
    //タブ切り替え表示設定
    $('.tab_project a').on('click', function(){
      var idName = $(this).attr('href');//タブ内のリンク名を取得
      tabSwitch(idName);//tabをクリックした時の表示設定
      return false;//aタグを無効にする
    });
    var newINST=setBtn('btn_newINST','新規設置先');
    $('#'+newINST.id).on('click', function(){
      // createNewREC(sysid.PM.app_id.installation, ['prjNum', 'btn_newORG_shown'], [prjNumValue, 'none']);
      createNewREC(sysid.PM.app_id.installation, ['prjNum','unknowINST','setShown'], [prjNumValue,'','']);
    });

    var unknowINST=setBtn('btn_unknowINST','新規不特定設置先');
    $('#'+unknowINST.id).on('click', function(){
      createNewREC(sysid.PM.app_id.installation, ['prjNum','unknowINST','setShown'], [prjNumValue,'不特定設置先','disable']);
    });
  });
  kintone.events.on(['app.record.index.edit.show', 'app.record.edit.show'], function (event) {
    // 新規作成以外、案件管理番号編集と既存案件切り替え不可
    event.record.prjNum.disabled = true;
    event.record.Exist_Project.disabled = true;

    return event;
  });
  // 新・既存案件表示切り替え
  kintone.events.on(['app.record.create.change.Exist_Project', 'app.record.edit.change.Exist_Project'], function (event) {
    if (event.record.Exist_Project.value == '既存案件') {
      setFieldShown('samePRJ', true);
      event.record.prjNum.value = "";
      event.record.prjNum.disabled = false;
    } else {
      setFieldShown('samePRJ', false);
      autoNum('PRJ_', 'prjNum');
      event.record.prjNum.disabled = true;
    }
  });

/*
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    var nStatus = event.nextStatus.value;
    if (nStatus == '納品手配済') {
      var queryBody = {
        'app': sysID.DIPM.app.ship,
        'query': 'prjNum="' + event.record.prjNum.value + '" and ステータス in ("納品情報未確定")',
        'fields': ['prjNum', '$id', 'ステータス', 'shipType']
      };

      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', queryBody).then(function (getResp) {
        //「確認中」の「用途」がある場合、「用途」を更新するBody作成
        var update_shipType = {
          'app': sysID.DIPM.app.ship,
          'records': []
        };
        //Statusの更新用Body作成
        var update_Status = {
          'app': sysID.DIPM.app.ship,
          'records': []
        };

        for (var i in getResp.records) {
          //「確認中」の「用途」がある場合、update_shipTypeのrecordsに追加
          if (getResp.records[i].shipType.value == '確認中') {
            update_shipType.records.push({
              'id': getResp.records[i].$id.value,
              'record': {
                'shipType': {
                  'value': event.record.shipType.value
                }
              }
            });
          }
          update_Status.records.push({
            'id': getResp.records[i].$id.value,
            'action': '処理開始',
            //'assignee': 'kintone_mng@accel-lab.com'
          });
        }
        if (update_shipType.records.length > 0) kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', update_shipType); //.then(function(resp){console.log(resp)}).catch(function(error){console.log(error)});
        kintone.api(kintone.api.url('/k/v1/records/status', true), 'PUT', update_Status); //.then(function(resp){console.log(resp)}).catch(function(error){console.log(error)});

      }).catch(function (error) {
        console.log(error);
        console.log(error.message);
      });

      var putBody = {

      };
    }
    return event;
  });
*/
})();