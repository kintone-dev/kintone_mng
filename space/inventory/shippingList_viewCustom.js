(function () {
  'use strict';
  kintone.events.on(['app.record.create.change.dstSelection', 'app.record.edit.change.dstSelection', 'app.record.create.change.sys_instAddress', 'app.record.edit.change.sys_instAddress', 'app.record.create.change.sys_unitAddress', 'app.record.edit.change.sys_unitAddress'], function (event) {
    doSelection(event);
    return event;
  });

  kintone.events.on(['app.record.create.change.shipType', 'app.record.edit.change.shipType'], function (event) {
    disableSet(event);
    return event;
  });

  kintone.events.on(['app.record.create.show', 'app.record.edit.show', 'app.record.detail.show'], function (event) {
    //$('.gaia-app-statusbar').css('display', 'none');
    disableSet(event);
    doSelection(event);

    // システム用フィールド非表示
    setFieldShown('sys_unitAddress', false);
    setFieldShown('sys_instAddress', false);
    //tabメニューの選択肢による表示設定
    function tabSwitch(onSelect) {
      switch (onSelect) {
        case '#宛先情報':
          var eRecord = kintone.app.record.get();
          disableSet(event);
          doSelection(event);
          kintone.app.record.setFieldShown('dstSelection', true);
          setFieldShown('zipcode', true);
          setFieldShown('phoneNum', true);
          setFieldShown('address', true);
          setFieldShown('buildingName', true);
          setFieldShown('corpName', true);
          setFieldShown('receiver', true);
          setFieldShown('prefectures', true);
          setFieldShown('city', true);
          setFieldShown('deviceList', false);
          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          setFieldShown('shipment', false);
          setFieldShown('shipType', false);
          setFieldShown('tarDate', false);
          setFieldShown('instFile', false);
          setFieldShown('shipNote', false);
          setFieldShown('aboutDelivery', false);
          setSpaceShown('calBtn', 'line', 'none');
          if (eRecord.record.shipType.value == '移動-拠点間') {
            setFieldShown('Contractor', true);
            setFieldShown('instName', false);
          } else if (eRecord.record.shipType.value == '移動-ベンダー') {
            setFieldShown('Contractor', true);
            setFieldShown('instName', false);
          } else if (eRecord.record.shipType.value == '返品') {
            setFieldShown('Contractor', true);
            setFieldShown('instName', false);
          } else {
            setFieldShown('Contractor', false);
            setFieldShown('instName', false);
          }
          break;
        case '#品目情報':
          setFieldShown('dstSelection', false);
          setFieldShown('Contractor', false);
          setFieldShown('instName', false);
          setFieldShown('zipcode', false);
          setFieldShown('phoneNum', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);
          setFieldShown('receiver', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);
          setFieldShown('deviceList', true);
          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          setFieldShown('shipment', false);
          setFieldShown('shipType', false);
          setFieldShown('tarDate', false);
          setFieldShown('instFile', false);
          setFieldShown('shipNote', false);
          setFieldShown('aboutDelivery', false);
          setSpaceShown('calBtn', 'line', 'block');
          break;
        case '#出荷情報':
          setFieldShown('dstSelection', false);
          setFieldShown('Contractor', false);
          setFieldShown('instName', false);
          setFieldShown('zipcode', false);
          setFieldShown('phoneNum', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);
          setFieldShown('receiver', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);
          setFieldShown('deviceList', false);
          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          setFieldShown('shipment', true);
          setFieldShown('shipType', true);
          setFieldShown('tarDate', true);
          setFieldShown('instFile', true);
          setFieldShown('shipNote', true);
          setFieldShown('aboutDelivery', true);
          setSpaceShown('calBtn', 'line', 'none');
          break;
        case '#輸送情報':
          setFieldShown('dstSelection', false);
          setFieldShown('Contractor', false);
          setFieldShown('instName', false);
          setFieldShown('zipcode', false);
          setFieldShown('phoneNum', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);
          setFieldShown('receiver', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);
          setFieldShown('deviceList', false);
          setFieldShown('deliveryCorp', true);
          setFieldShown('trckNum', true);
          setFieldShown('sendDate', true);
          setFieldShown('expArrivalDate', true);
          setFieldShown('shipment', false);
          setFieldShown('shipType', false);
          setFieldShown('tarDate', true);
          setFieldShown('instFile', false);
          setFieldShown('shipNote', false);
          setFieldShown('aboutDelivery', false);
          setSpaceShown('calBtn', 'line', 'none');
          break;
      }
    }
    tabSwitch('#出荷情報'); //tab初期表示設定
    //タブメニュー作成
    tabMenu('tab_ship', ['出荷情報', '宛先情報', '品目情報', '輸送情報']);
    //タブ切り替え表示設定
    $('.tabMenu a').on('click', function () {
      var idName = $(this).attr('href'); //タブ内のリンク名を取得
      tabSwitch(idName); //tabをクリックした時の表示設定
      return false; //aタグを無効にする
    });
    return event;
  });

  kintone.events.on('app.record.create.show', function (event) {
    //レコード作成時、発送関連情報を非表示
    setFieldShown('deliveryCorp', false);
    setFieldShown('trckNum', false);
    setFieldShown('sendDate', false);
    setFieldShown('expArrivalDate', false);
    return event;
  });

  // 納品依頼に進めた場合、作業者から組織情報を取得し、「出荷ロケーション」に格納
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    var nStatus = event.nextStatus.value;
    //var loginUserCode = event.record.作業者.value[0].code;
    /*
    if(nStatus === "受領待ち"){
      //作業者取得
      console.log(event.record.作業者)
      var loginUserCode = event.record.作業者.value[0].code;//kintone.getLoginUser()['code'];
      var getORGname= new kintone.api('/v1/user/organizations', 'GET', {code: loginUserCode});
      return getORGname.then(function(resp){
        event.record.shipment.value=resp.organizationTitles[0].organization.name;
        return event;
      }).catch(function(error){
        console.log('所属組織取得時にエラーが発生しました。'+'\n'+error.message);
      });
    }else{
    }
    */
  });

  // ドロップダウン作成
  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function (event) {
    var contsBtn = document.createElement('select');
    contsBtn.id = 'setShipment';
    contsBtn.classList.add('selectCss'); //ボタンにCSS追加
    kintone.app.record.getSpaceElement('setShipment').appendChild(contsBtn); //指定スペースフィールドにボタン設置

    return event;
  });

  // 輸送業者を「担当手渡し」にした場合、追跡番号を「none」にする
  kintone.events.on(['app.record.create.change.deliveryCorp', 'app.record.edit.change.deliveryCorp'], function (event) {
    if (event.record.deliveryCorp.value == '担当手渡し') {
      event.record.trckNum.value = 'none';
      event.record.trckNum.disabled = true;
    } else {
      event.record.trckNum.value = null;
      event.record.trckNum.disabled = false;
    }
    return event;
  });

  // カーテンレールが選択された場合、特記事項にデータを記入
  kintone.events.on(['app.record.edit.change.mCode', 'app.record.create.change.mCode'], function (event) {
    for (var i in event.record.deviceList.value) {
      if (!String(event.record.deviceList.value[i].value.shipRemarks.value).match(/PAC/)) {
        var mCodeValue = event.record.deviceList.value[i].value.mCode.value;
        if (mCodeValue === undefined) event.record.deviceList.value[i].value.shipRemarks.value = '';
        else if (mCodeValue == 'TRT-DY') event.record.deviceList.value[i].value.shipRemarks.value = 'WFP\nカーテンレール全長(mm)：\n開き勝手：(S)片開き/(W)両開き\n取り付け方法：天井/壁付S/壁付W';
        else if (mCodeValue.match(/pkg_/)) event.record.deviceList.value[i].value.shipRemarks.value = 'WFP';
      }
    }
    return event;
  });

  // 計算ボタン
  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], function (event) {
    setBtn('calBtn', '計算');
    $('#calBtn').on('click', function () {
      var eRecord = kintone.app.record.get();
      var shipTable = eRecord.record.deviceList.value;
      var lengthStr = '';
      var openType = '';
      var methodType = '';
      var shipNum = '';
      var numRegExp = new RegExp(/^([1-9]\d*|0)$/);
      var openRegExp = new RegExp(/^[sw]/i);
      var methodRegExp = new RegExp(/壁付[sw]|天井/i);
      var newShipTable = [];

      // 依頼数空欄時エラー
      for (var st in shipTable) {
        if (numRegExp.test(shipTable[st].value.shipNum.value)) {
          shipNum = shipTable[st].value.shipNum.value;
          shipTable[st].value.shipNum.error = null;
        } else {
          shipTable[st].value.shipNum.error = '入力形式が間違えています';
        }
      }

      // パッケージ品取得
      var pkgQuery = [];
      for (var st in shipTable) {
        if (String(shipTable[st].value.shipRemarks.value).match(/WFP/)) {
          if (String(shipTable[st].value.mCode.value).match(/pkg_/)) {
            pkgQuery.push('"' + shipTable[st].value.mCode.value + '"');
          }
        }
      }
      if (pkgQuery.length != 0) {
        var getPkg = {
          'app': sysid.INV.app_id.device,
          'query': 'mCode in (' + pkgQuery.join() + ') order by 更新日時 asc',
        };
      } else {
        var getPkg = {
          'app': sysid.INV.app_id.device,
          'query': 'order by 更新日時 asc',
        };
      }
      return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getPkg)
        .then(function (resp) {
          const RESP_RECORDS = resp.records;
          for (var st in shipTable) {
            if (String(shipTable[st].value.shipRemarks.value).match(/WFP/)) {
              if (shipTable[st].value.mCode.value == 'TRT-DY') {
                shipTable[st].value.shipRemarks.value = shipTable[st].value.shipRemarks.value.replace(/WFP/g, 'PAC')
                newShipTable.push(shipTable[st]);
                var railSpecs = (String(shipTable[st].value.shipRemarks.value)).split(/,\n|\n/);
                var numCutter = railSpecs[1].indexOf('：');
                railSpecs[0] = railSpecs[1].slice(numCutter + 1);
                var openCutter = railSpecs[2].indexOf('：');
                railSpecs[1] = railSpecs[2].slice(openCutter + 1);
                var methodCutter = railSpecs[3].indexOf('：');
                railSpecs[2] = railSpecs[3].slice(methodCutter + 1);

                if (railSpecs[1] == '(S)片開き') {
                  railSpecs[1] = 's';
                } else if (railSpecs[1] == '(W)両開き') {
                  railSpecs[1] = 'w';
                } else {
                  railSpecs[1] = '';
                }

                railSpecs.pop();

                for (var i in railSpecs) {
                  if (numRegExp.test(railSpecs[i])) {
                    if (parseInt(railSpecs[i]) >= 580) {
                      lengthStr = railSpecs[i];

                      shipTable[st].value.shipRemarks.error = null;
                    } else {
                      shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                      break;
                    }
                  } else {
                    shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                  }

                  if (openRegExp.test(railSpecs[i])) {
                    if (railSpecs[i].length === 1) {
                      openType = railSpecs[i];
                      openType = openType.toLowerCase();

                      shipTable[st].value.shipRemarks.error = null;
                    } else {
                      shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                      break;
                    }
                  } else {
                    shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                  }

                  if (methodRegExp.test(railSpecs[i])) {
                    if (railSpecs[i].match(/壁付s/i)) {
                      methodType = '壁付s';
                    } else if (railSpecs[i].match(/壁付w/i)) {
                      methodType = '壁付w';
                    } else {
                      methodType = '天井';
                    }
                    shipTable[st].value.shipRemarks.error = null;
                  } else {
                    shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                  }
                }

                var spec = {
                  rLength: lengthStr,
                  rType: openType,
                  rMethod: methodType,
                  shipNum: shipTable[st].value.shipNum.value
                }

                var railItems = railConf(spec);
                for (var ril in railItems) {
                  var railItemBody = {
                    value: {
                      mVendor: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mVendor.value).replace(/\"/g, '')
                      },
                      mType: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mType.value).replace(/\"/g, '')
                      },
                      mCode: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mCode.value).replace(/\"/g, '')
                      },
                      mName: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mName.value).replace(/\"/g, '')
                      },
                      mNickname: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mNickname.value).replace(/\"/g, '')
                      },
                      sNum: {
                        type: "MULTI_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.sNum.value).replace(/\"/g, '')
                      },
                      shipRemarks: {
                        type: "MULTI_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.shipRemarks.value).replace(/\"/g, '')
                      },
                      shipNum: {
                        type: "NUMBER",
                        value: JSON.stringify(railItems[ril].value.shipNum.value).replace(/\"/g, '')
                      }
                    }
                  }
                  newShipTable.push(railItemBody);
                }
              } else if (String(shipTable[st].value.mCode.value).match(/pkg_/)) {
                shipTable[st].value.shipRemarks.value = shipTable[st].value.shipRemarks.value.replace(/WFP/g, 'PAC')
                newShipTable.push(shipTable[st]);
                for (var rr in RESP_RECORDS) {
                  if (shipTable[st].value.mCode.value == RESP_RECORDS[rr].mCode.value) {
                    for (var pkgr in RESP_RECORDS[rr].packageComp.value) {
                      var pkgBody = {
                        value: {
                          mVendor: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mVendor.value
                          },
                          mType: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mType.value
                          },
                          mCode: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mCode.value
                          },
                          mName: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mName.value
                          },
                          mNickname: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mNickname.value
                          },
                          sNum: {
                            type: "MULTI_LINE_TEXT",
                            value: ''
                          },
                          shipRemarks: {
                            type: "MULTI_LINE_TEXT",
                            value: ''
                          },
                          shipNum: {
                            type: "NUMBER",
                            value: parseInt(RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_Num.value) * parseInt(shipTable[st].value.shipNum.value)
                          }
                        }
                      }
                      newShipTable.push(pkgBody);
                    }
                  }
                }
              }
            } else {
              newShipTable.push(shipTable[st]);
            }
          }

          eRecord.record.deviceList.value = newShipTable;
          console.log(eRecord.record.deviceList.value);
          for (var i in eRecord.record.deviceList.value) {
            eRecord.record.deviceList.value[i].value.mNickname.lookup = true;
          }
          kintone.app.record.set(eRecord);

        });
    });

    return event;
  });


  const disableSet = function (event) {
    if (event.record.shipType.value == '移動-拠点間') {
      event.record.dstSelection.value = '施工業者/拠点へ納品';
      event.record.receiver.disabled = true;
      event.record.phoneNum.disabled = true;
      event.record.zipcode.disabled = true;
      event.record.prefectures.disabled = true;
      event.record.city.disabled = true;
      event.record.address.disabled = true;
      event.record.buildingName.disabled = true;
      event.record.corpName.disabled = true;
      event.record.dstSelection.disabled = true;
      event.record.Contractor.disabled = false;
      if (event.record.sys_unitAddress.value !== undefined) {
        var unitAddress = event.record.sys_unitAddress.value.split(',');
        event.record.receiver.value = unitAddress[0];
        event.record.phoneNum.value = unitAddress[1];
        event.record.zipcode.value = unitAddress[2];
        event.record.prefectures.value = unitAddress[3];
        event.record.city.value = unitAddress[4];
        event.record.address.value = unitAddress[5];
        event.record.buildingName.value = unitAddress[6];
        event.record.corpName.value = unitAddress[7];
      }
    } else if (event.record.shipType.value == '移動-ベンダー') {
      event.record.dstSelection.value = '施工業者/拠点へ納品';
      event.record.Contractor.value = 'ベンダー';
      event.record.Contractor.lookup = true;
      event.record.receiver.disabled = true;
      event.record.phoneNum.disabled = true;
      event.record.zipcode.disabled = true;
      event.record.prefectures.disabled = true;
      event.record.city.disabled = true;
      event.record.address.disabled = true;
      event.record.buildingName.disabled = true;
      event.record.corpName.disabled = true;
      event.record.dstSelection.disabled = true;
      event.record.Contractor.disabled = true;
    } else if (event.record.shipType.value == '返品') {
      event.record.dstSelection.value = '施工業者/拠点へ納品';
      event.record.shipment.value = 'ベンダー';
      event.record.shipment.lookup = true;
      event.record.Contractor.value = 'ベンダー';
      event.record.Contractor.lookup = true;
      event.record.receiver.disabled = true;
      event.record.phoneNum.disabled = true;
      event.record.zipcode.disabled = true;
      event.record.prefectures.disabled = true;
      event.record.city.disabled = true;
      event.record.address.disabled = true;
      event.record.buildingName.disabled = true;
      event.record.corpName.disabled = true;
      event.record.dstSelection.disabled = true;
      event.record.Contractor.disabled = true;
    } else {
      event.record.dstSelection.value = '手入力';
      event.record.receiver.disabled = false;
      event.record.phoneNum.disabled = false;
      event.record.zipcode.disabled = false;
      event.record.prefectures.disabled = false;
      event.record.city.disabled = false;
      event.record.address.disabled = false;
      event.record.buildingName.disabled = false;
      event.record.corpName.disabled = false;
      event.record.dstSelection.disabled = false;
      event.record.Contractor.disabled = false;
    }
  }

  function doSelection(event) {
    var selection = event.record.dstSelection.value;
    if (selection == '施工業者/拠点へ納品') {
      setFieldShown('Contractor', true);
      setFieldShown('instName', false);
      event.record.receiver.disabled = true;
      event.record.phoneNum.disabled = true;
      event.record.zipcode.disabled = true;
      event.record.prefectures.disabled = true;
      event.record.city.disabled = true;
      event.record.address.disabled = true;
      event.record.buildingName.disabled = true;
      event.record.corpName.disabled = true;
      if (event.record.sys_unitAddress.value !== undefined) {
        var unitAddress = event.record.sys_unitAddress.value.split(',');
        event.record.receiver.value = unitAddress[0];
        event.record.phoneNum.value = unitAddress[1];
        event.record.zipcode.value = unitAddress[2];
        event.record.prefectures.value = unitAddress[3];
        event.record.city.value = unitAddress[4];
        event.record.address.value = unitAddress[5];
        event.record.buildingName.value = unitAddress[6];
        event.record.corpName.value = unitAddress[7];
      }
    } else if (selection == '設置先と同じ') {
      setFieldShown('Contractor', false);
      setFieldShown('instName', true);
      event.record.receiver.disabled = false;
      event.record.phoneNum.disabled = false;
      event.record.zipcode.disabled = false;
      event.record.prefectures.disabled = false;
      event.record.city.disabled = false;
      event.record.address.disabled = false;
      event.record.buildingName.disabled = false;
      event.record.corpName.disabled = false;
      if (event.record.sys_instAddress.value !== undefined) {
        var instAddress = event.record.sys_instAddress.value.split(',');
        event.record.receiver.value = instAddress[0];
        event.record.phoneNum.value = instAddress[1];
        event.record.zipcode.value = instAddress[2];
        event.record.prefectures.value = instAddress[3];
        event.record.city.value = instAddress[4];
        event.record.address.value = instAddress[5];
        event.record.buildingName.value = instAddress[6];
        event.record.corpName.value = instAddress[7];
      }
    } else if (selection == '担当手渡し') {
      setFieldShown('Contractor', false);
      setFieldShown('instName', false);
      event.record.receiver.disabled = false;
      event.record.phoneNum.disabled = false;
      event.record.zipcode.disabled = true;
      event.record.prefectures.disabled = true;
      event.record.city.disabled = true;
      event.record.address.disabled = true;
      event.record.buildingName.disabled = true;
      event.record.corpName.disabled = true;

      event.record.zipcode.value = '';
      event.record.prefectures.value = '';
      event.record.city.value = '';
      event.record.address.value = '';
      event.record.buildingName.value = '';
      event.record.corpName.value = '';
    } else {
      setFieldShown('Contractor', false);
      setFieldShown('instName', false);
      event.record.receiver.disabled = false;
      event.record.phoneNum.disabled = false;
      event.record.zipcode.disabled = false;
      event.record.prefectures.disabled = false;
      event.record.city.disabled = false;
      event.record.address.disabled = false;
      event.record.buildingName.disabled = false;
      event.record.corpName.disabled = false;
    }
  }
})();