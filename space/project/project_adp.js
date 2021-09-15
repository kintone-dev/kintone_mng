(function() {
  'use strict';

  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const PAGE_RECORD = event.record;
    var nStatus = event.nextStatus.value;
    if (nStatus === '納品準備中') {
      var postShipData = [];
      var postShipBody = {
        'aboutDelivery':{
          'value':PAGE_RECORD.aboutDelivery.value
        },
        'tarDate':{
          'value':PAGE_RECORD.tarDate.value
        },
        'dstSelection':{
          'value':PAGE_RECORD.dstSelection.value
        },
        'Contractor':{
          'value':PAGE_RECORD.Contractor.value
        },
        'instName':{
          'value':PAGE_RECORD.instName.value
        },
        'receiver':{
          'value':PAGE_RECORD.receiver.value
        },
        'phoneNum':{
          'value':PAGE_RECORD.phoneNum.value
        },
        'zipcode':{
          'value':PAGE_RECORD.zipcode.value
        },
        'prefectures':{
          'value':PAGE_RECORD.prefectures.value
        },
        'city':{
          'value':PAGE_RECORD.city.value
        },
        'address':{
          'value':PAGE_RECORD.address.value
        },
        'buildingName':{
          'value':PAGE_RECORD.buildingName.value
        },
        'corpName':{
          'value':PAGE_RECORD.corpName.value
        },
        'sys_instAddress':{
          'value':PAGE_RECORD.sys_instAddress.value
        },
        'sys_unitAddress':{
          'value':PAGE_RECORD.sys_unitAddress.value
        },
        'deviceList':{
          'value':[]
        },
      }
      for(var pdv in PAGE_RECORD.deviceList.value){
        var devListBody = {
          'value':{
            'mName':{
              'value':PAGE_RECORD.deviceList.value[pdv].value.mNickname.value
            },
            'shipNum':{
              'value':PAGE_RECORD.deviceList.value[pdv].value.shipNum.value
            }
          }
        }
        postShipBody.deviceList.value.push(devListBody);
      }

      postShipData.push(postShipBody);
      postRecords(sysid.INV.app_id.shipment, postShipData);
    }

  });

  // 計算ボタン
  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], function (event) {
    setBtn('calBtn', '計算');
    $('#calBtn').on('click', function () {
      const ERECORD = kintone.app.record.get();
      var shipTable = ERECORD.record.deviceList.value;
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
      if(pkgQuery.length != 0){
        var getPkg = {
          'app': sysid.INV.app_id.device,
          'query': 'mCode in (' + pkgQuery.join() + ') order by 更新日時 asc',
        };
      } else{
        var getPkg = {
          'app': sysid.INV.app_id.device,
          'query': 'order by 更新日時 asc',
        };
      }
      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getPkg)
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
                      subBtn: {
                        type: "RADIO_BUTTON",
                        value: '通常'
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
                          subBtn: {
                            type: "RADIO_BUTTON",
                            value: '通常'
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

          ERECORD.record.deviceList.value = newShipTable;
          console.log(ERECORD.record.deviceList.value);
          for (var i in ERECORD.record.deviceList.value) {
            ERECORD.record.deviceList.value[i].value.mNickname.lookup = true;
          }
          kintone.app.record.set(ERECORD);

        });
    });

    return event;
  });

    // カーテンレールが選択された場合、シリアル番号欄にデータを記入
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


})();
