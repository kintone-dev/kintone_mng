(function () {
  'use strict';

  // 拠点情報取得＆繰り返し利用
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const PAGE_RECORD = event.record;
    var nStatus = event.nextStatus.value;
    if (nStatus === "集荷待ち") {
      var deviceList = PAGE_RECORD.deviceList.value;
      var shipmentName = PAGE_RECORD.shipment.value;
      var sysShipmentCode = PAGE_RECORD.sys_shipmentCode.value;
      var sysArrivalCode = PAGE_RECORD.sys_arrivalCode.value;
      var stockData = [];
      for (var sdl in deviceList) {
        var stockDataBody = {
          'mCode': deviceList[sdl].value.mCode.value,
          'shipNum': deviceList[sdl].value.shipNum.value
        }
        stockData.push(stockDataBody);
      }
      var sNums = sNumRecords(PAGE_RECORD.deviceList.value, 'table');

      //ID更新
      if (shipmentName === '矢倉倉庫') {
        var postSnumData = [];
        for (var y in sNums) {
          var snRecord = {
            'sNum': {
              'value': sNums[y]
            },
            'shipment': event.record.shipment,
            'sendDate': event.record.sendDate,
            'shipType': event.record.shipType,
            'instName': event.record.instName
          };
          postSnumData.push(snRecord);
        }
        postRecords(sysid.DEV.app_id.sNum, postSnumData);
      } else {
        var putSnumData = [];
        for (var y in sNums) {
          var snRecord = {
            'updateKey': {
              'field': 'sNum',
              'value': sNums[y]
            },
            'record': {
              'shipment': event.record.shipment,
              'sendDate': event.record.sendDate,
              'shipType': event.record.shipType,
              'instName': event.record.instName
            }
          };
          putSnumData.push(snRecord);
        }
        putRecords(sysid.DEV.app_id.sNum, putSnumData);
      }

      setDeliveryInfo(PAGE_RECORD);
      if (PAGE_RECORD.shipType.value == '移動-販売' || PAGE_RECORD.shipType.value == '移動-サブスク') {
        stockCount('normal', sysShipmentCode, sysArrivalCode, stockData);
      } else if (PAGE_RECORD.shipType.value == '販売' || PAGE_RECORD.shipType.value == 'サブスク') {
        stockCount('normal', sysShipmentCode, sysArrivalCode, stockData);
      } else if (PAGE_RECORD.shipType.value == '移動-拠点間' || PAGE_RECORD.shipType.value == '移動-ベンダー') {
        stockCount('normal', sysShipmentCode, sysArrivalCode, stockData);
      } else if (PAGE_RECORD.shipType.value == '社内利用' || PAGE_RECORD.shipType.value == '貸与' || PAGE_RECORD.shipType.value == '修理') {
        stockCount('shiponly', sysShipmentCode, sysArrivalCode, stockData);
      } else if (PAGE_RECORD.shipType.value == '返品') {
        stockCount('shiponly', sysShipmentCode, sysArrivalCode, stockData);
      }
    } else if (nStatus === "出荷完了") {
      if (PAGE_RECORD.shipType.value == '移動-販売' || PAGE_RECORD.shipType.value == '移動-サブスク') {
        reportCreate(PAGE_RECORD, 'distribute');
      } else if (PAGE_RECORD.shipType.value == '販売' || PAGE_RECORD.shipType.value == 'サブスク') {
        reportCreate(PAGE_RECORD, 'distribute');
      } else if (PAGE_RECORD.shipType.value == '移動-拠点間' || PAGE_RECORD.shipType.value == '移動-ベンダー') {
        reportCreate(PAGE_RECORD, 'arrival');
      } else if (PAGE_RECORD.shipType.value == '社内利用' || PAGE_RECORD.shipType.value == '貸与' || PAGE_RECORD.shipType.value == '修理') {
        reportCreate(PAGE_RECORD, 'shiponly');
      } else if (PAGE_RECORD.shipType.value == '返品') {
        reportCreate(PAGE_RECORD, 'shiponly');
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

      for (var st in shipTable) {
        if (numRegExp.test(shipTable[st].value.shipNum.value)) {
          shipNum = shipTable[st].value.shipNum.value;
          shipTable[st].value.shipNum.error = null;
        } else {
          shipTable[st].value.shipNum.error = '入力形式が間違えています';
        }

        if (String(shipTable[st].value.shipRemarks.value).match(/WFP/)) {
          if (String(shipTable[st].value.mCode.value).match(/pkg_/)) {
            var shipNum = shipTable[st].value.shipNum.value;
            var pacInfo = {
              'app': sysid.INV.app_id.device,
              'query': 'mCode="' + shipTable[st].value.mCode.value + '"',
            };

            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', pacInfo).then(function (resp) {
              var pkgItems = resp.records[0].packageComp.value;
              for (var pil in pkgItems) {
                var pkgItemBody = {
                  value: {
                    mCode: {
                      type: "SINGLE_LINE_TEXT",
                      value: JSON.stringify(pkgItems[pil].value.pc_mCode.value).replace(/\"/g, '')
                    },
                    mName: {
                      type: "SINGLE_LINE_TEXT",
                      value: JSON.stringify(pkgItems[pil].value.pc_mName.value).replace(/\"/g, '')
                    },
                    mType: {
                      type: "SINGLE_LINE_TEXT",
                      value: JSON.stringify(pkgItems[pil].value.pc_mType.value).replace(/\"/g, '')
                    },
                    mVendor: {
                      type: "SINGLE_LINE_TEXT",
                      value: JSON.stringify(pkgItems[pil].value.pc_mVendor.value).replace(/\"/g, '')
                    },
                    shipNum: {
                      type: "NUMBER",
                      value: JSON.stringify(pkgItems[pil].value.pc_Num.value * shipNum).replace(/\"/g, '')
                    },
                    sNum: {
                      type: "MULTI_LINE_TEXT",
                      value: ''
                    },
                    shipRemarks: {
                      type: "MULTI_LINE_TEXT",
                      value: ''
                    }
                  }
                }
                var spliceCount = perseInt(st) + 1;
                console.log(spliceCount);
                shipTable.splice(spliceCount, 0, pkgItemBody);
              }
              kintone.app.record.set(eRecord);
              return resp;
            });

            shipTable[st].value.shipRemarks.value = String(shipTable[st].value.shipRemarks.value).replace(/WFP/g, '');
          } else if (String(shipTable[st].value.mCode.value).match(/TRT-DY/)) {

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
                  mCode: {
                    type: "SINGLE_LINE_TEXT",
                    value: JSON.stringify(railItems[ril].value.mCode.value).replace(/\"/g, '')
                  },
                  mName: {
                    type: "SINGLE_LINE_TEXT",
                    value: JSON.stringify(railItems[ril].value.mName.value).replace(/\"/g, '')
                  },
                  mType: {
                    type: "SINGLE_LINE_TEXT",
                    value: JSON.stringify(railItems[ril].value.mType.value).replace(/\"/g, '')
                  },
                  mVendor: {
                    type: "SINGLE_LINE_TEXT",
                    value: JSON.stringify(railItems[ril].value.mVendor.value).replace(/\"/g, '')
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
              var spliceCount = perseInt(st) + 1;
              console.log(spliceCount);
              shipTable.splice(spliceCount, 0, railItemBody);
            }
          }
        }
      }

      console.log(shipTable);

      var lookupcount = 0;
      for (var st in shipTable) {
        shipTable[lookupcount].value.mName.lookup = true;
        lookupcount++;
      }

      kintone.app.record.set(eRecord);
    });

    return event;
  });

  // レポート処理
  const reportCreate = function (pageRecod, param) {
    var sendDate = pageRecod.sendDate.value;
    var deviceList = pageRecod.deviceList.value;
    var sysShipmentCode = pageRecod.sys_shipmentCode.value;
    var sysArrivalCode = pageRecod.sys_arrivalCode.value;
    var stockData = []
    for (var sdl in deviceList) {
      var stockDataBody = {
        'mCode': deviceList[sdl].value.mCode.value,
        'shipNum': deviceList[sdl].value.shipNum.value
      }
      stockData.push(stockDataBody);
    }
    sendDate = sendDate.replace(/-/g, '');
    sendDate = sendDate.slice(0, -2);
    //同じ月のレポート情報取得
    var getReportBody = {
      'app': sysid.INV.app_id.report,
      'query': 'report_key = "' + sendDate + '" order by 更新日時 asc'
    };
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
      .then(function (resp) {
        if (resp.records.length != 0) {
          //更新レポート情報格納配列
          var putReportData = [];
          //更新レポート情報
          var putReportBody = {
            'updateKey': {
              'field': 'report_key',
              'value': sendDate
            },
            'record': {
              'inventoryList': {
                'value': resp.records[0].inventoryList.value
              }
            }
          }
          //レポート内sysコード格納
          var reportSysCode = [];
          var inventoryList = resp.records[0].inventoryList.value;
          for (var il in inventoryList) {
            var reportSysData = {
              'sysCode': inventoryList[il].value.sys_code.value,
              'rowId': inventoryList[il].id,
              'shipNum': inventoryList[il].value.shipNum.value
            }
            reportSysCode.push(reportSysData);
          }

          //作成したsysコードを格納
          var shipSysCode = [];
          for (var dl in deviceList) {
            var shipSysData = {
              'sysCode': deviceList[dl].value.mCode.value + '-' + sysShipmentCode,
              'shipNum': deviceList[dl].value.shipNum.value,
            }
            shipSysCode.push(shipSysData);
          }

          for (var ssc in shipSysCode) {
            //サブテーブル追加
            if (reportSysCode.some(item => item.sysCode === shipSysCode[ssc].sysCode)) {
              for (var il in putReportBody.record.inventoryList.value) {
                if (putReportBody.record.inventoryList.value[il].value.sys_code.value == shipSysCode[ssc].sysCode) {
                  putReportBody.record.inventoryList.value[il].value.shipNum.value = (parseInt(shipSysCode[ssc].shipNum) || 0) + (parseInt(putReportBody.record.inventoryList.value[il].value.shipNum.value) || 0);
                  var totalShipNum = putReportBody.record.inventoryList.value[il].value.shipNum.value;
                }
              }
            } else {
              var putInventoryBody = {
                'value': {
                  'sys_code': shipSysCode[ssc].sysCode,
                  'stockLocation': pageRecod.shipment.value,
                  'shipNum': shipSysCode[ssc].shipNum
                }
              }
              putReportBody.record.inventoryList.value.push(putInventoryBody);
            }
          }

          if (param == 'arrival') {
            //作成したarrivalsysコード格納
            var arrivalSysCode = [];
            for (var dl in deviceList) {
              var arrivalSysData = {
                'sysCode': deviceList[dl].value.mCode.value + '-' + sysArrivalCode,
                'shipNum': deviceList[dl].value.shipNum.value,
                'location': pageRecod.Contractor.value
              }
              arrivalSysCode.push(arrivalSysData);
            }

            for (var asc in arrivalSysCode) {
              //arrivalテーブル追加
              if (reportSysCode.some(item => item.sysCode === arrivalSysCode[asc].sysCode)) {
                for (var il in putReportBody.record.inventoryList.value) {
                  if (putReportBody.record.inventoryList.value[il].value.sys_code.value == arrivalSysCode[asc].sysCode) {
                    putReportBody.record.inventoryList.value[il].value.arrivalNum.value = (parseInt(putReportBody.record.inventoryList.value[il].value.arrivalNum.value) || 0) + (parseInt(arrivalSysCode[asc].shipNum) || 0);
                    var totalArrivalNum = putReportBody.record.inventoryList.value[il].value.arrivalNum.value;
                  }
                }

              } else {
                var putArrivalBody = {
                  'value': {
                    'sys_code': arrivalSysCode[asc].sysCode,
                    'stockLocation': arrivalSysCode[asc].location,
                    'arrivalNum': arrivalSysCode[asc].shipNum
                  }
                }
                putReportBody.record.inventoryList.value.push(putArrivalBody);
              }
            }
          } else if (param == 'distribute') {
            //作成したdistributesyscode
            var shipDistributeCode = [];
            for (var dl in deviceList) {
              var shipDistributeData = {
                'sysCode': deviceList[dl].value.mCode.value + '-distribute',
                'shipNum': deviceList[dl].value.shipNum.value
              }
              shipDistributeCode.push(shipDistributeData);
            }

            for (var sdc in shipDistributeCode) {
              //distributeテーブル追加
              if (reportSysCode.some(item => item.sysCode === shipDistributeCode[sdc].sysCode)) {
                for (var il in putReportBody.record.inventoryList.value) {
                  if (putReportBody.record.inventoryList.value[il].value.sys_code.value == shipDistributeCode[sdc].sysCode) {
                    putReportBody.record.inventoryList.value[il].value.arrivalNum.value = (parseInt(putReportBody.record.inventoryList.value[il].value.arrivalNum.value) || 0) + (parseInt(shipDistributeCode[sdc].shipNum) || 0);
                    var totalArrivalNum = putReportBody.record.inventoryList.value[il].value.arrivalNum.value;
                  }
                }
              } else {
                var putDistributeBody = {
                  'value': {
                    'sys_code': shipDistributeCode[sdc].sysCode,
                    'stockLocation': '積送',
                    'arrivalNum': shipDistributeCode[sdc].shipNum
                  }
                }
                putReportBody.record.inventoryList.value.push(putDistributeBody);
              }
            }
          } else if (param == 'shiponly') {}

          putReportData.push(putReportBody);
          putRecords(sysid.INV.app_id.report, putReportData);
        } else {
          //レポート新規作成
          var postReportData = [];
          var postInventoryListArray = [];
          var postReportBody = {
            'report_key': {
              'value': sendDate
            },
            'inventoryList': {
              'value': postInventoryListArray
            }
          }
          //作成したsysコードを格納
          var shipSysCode = [];
          for (var dl in deviceList) {
            var shipSysData = {
              'sysCode': deviceList[dl].value.mCode.value + '-' + sysShipmentCode,
              'shipNum': deviceList[dl].value.shipNum.value,
            }
            shipSysCode.push(shipSysData);
          }

          for (var ssc in shipSysCode) {
            //サブテーブル追加
            var postInventoryBody = {
              'value': {
                'sys_code': shipSysCode[ssc].sysCode,
                'stockLocation': pageRecod.shipment.value,
                'shipNum': shipSysCode[ssc].shipNum
              }
            }
            postInventoryListArray.push(postInventoryBody);
          }

          if (param == 'arrival') {
            //作成したarrivalSysコード格納
            var arrivalSysCode = [];
            for (var dl in deviceList) {
              var arrivalSysData = {
                'sysCode': deviceList[dl].value.mCode.value + '-' + sysArrivalCode,
                'shipNum': deviceList[dl].value.shipNum.value,
                'location': pageRecod.Contractor.value
              }
              arrivalSysCode.push(arrivalSysData);
            }
            for (var asc in arrivalSysCode) {
              //arrivalテーブル追加
              var postArrivalBody = {
                'value': {
                  'sys_code': arrivalSysCode[asc].sysCode,
                  'stockLocation': arrivalSysCode[asc].location,
                  'arrivalNum': arrivalSysCode[asc].shipNum
                }
              }
              postInventoryListArray.push(postArrivalBody);
            }
          } else if (param == 'distribute') {
            //作成したdistributeSysCode
            var shipDistributeCode = [];
            for (var dl in deviceList) {
              var shipDistributeData = {
                'sysCode': deviceList[dl].value.mCode.value + '-distribute',
                'shipNum': deviceList[dl].value.shipNum.value
              }
              shipDistributeCode.push(shipDistributeData);
            }
            for (var sdc in shipDistributeCode) {
              //distributeテーブル追加
              var postDistributeBody = {
                'value': {
                  'sys_code': shipDistributeCode[sdc].sysCode,
                  'stockLocation': '積送',
                  'arrivalNum': shipDistributeCode[sdc].shipNum
                }
              }
              postInventoryListArray.push(postDistributeBody);
            }
          } else if (param == 'shiponly') {}

          postReportData.push(postReportBody);
          postRecords(sysid.INV.app_id.report, postReportData);
        }
      });
  }

  // 在庫処理
  const stockCount = function (param, shipCode, arrivalCode, stockItemData) {
    var codeArray = [shipCode, arrivalCode];
    if (param == 'shiponly') {
      var getUnitBody = {
        'app': sysid.INV.app_id.unit,
        'query': 'uCode = "' + shipCode + '" order by 更新日時 asc'
      };
    } else {
      var getUnitBody = {
        'app': sysid.INV.app_id.unit,
        'query': 'uCode = "' + shipCode + '" or uCode = "' + arrivalCode + '" order by 更新日時 asc'
      };
    }
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getUnitBody)
      .then(function (resp) {
        var unitRecords = resp.records;
        //商品管理情報クエリ
        var deviceQuery = [];
        for (var sid in stockItemData) {
          deviceQuery.push('"' + stockItemData[sid].mCode + '"');
        }
        var getDeviceBody = {
          'app': sysid.INV.app_id.device,
          'query': 'mCode in (' + deviceQuery.join() + ') order by 更新日時 asc'
        };

        //更新在庫格納配列
        var putStockData = [];
        //在庫情報
        var totalStockData = [];
        if (param == 'shiponly') {
          for (var ur in unitRecords) {
            //更新在庫情報
            var putStockBody = {
              'updateKey': {
                'field': 'uCode',
                'value': shipCode
              },
              'record': {
                'mStockList': {
                  'value': unitRecords[ur].mStockList.value
                }
              }
            }
            if (putStockBody.updateKey.value == shipCode) {
              for (var msl in putStockBody.record.mStockList.value) {
                for (var sid in stockItemData) {
                  if (putStockBody.record.mStockList.value[msl].value.mCode.value == stockItemData[sid].mCode) {
                    putStockBody.record.mStockList.value[msl].value.mStock.value = parseInt(putStockBody.record.mStockList.value[msl].value.mStock.value || 0) - parseInt(stockItemData[sid].shipNum || 0);
                    var totalStockBody = {
                      'mCode': putStockBody.record.mStockList.value[msl].value.mCode.value,
                      'uCode': shipCode,
                      'stockNum': putStockBody.record.mStockList.value[msl].value.mStock.value
                    }
                    totalStockData.push(totalStockBody);
                  }
                }
              }
            }

            putStockData.push(putStockBody);
          }

          //商品管理に在庫数反映
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getDeviceBody)
            .then(function (resp) {
              var deviceRecords = resp.records;
              //更新商品格納配列
              var putDeviceData = [];
              for (var dr in deviceRecords) {
                var putStockBody = {
                  'updateKey': {
                    'field': 'mCode',
                    'value': deviceRecords[dr].mCode.value
                  },
                  'record': {
                    'uStockList': {
                      'value': deviceRecords[dr].uStockList.value
                    }
                  }
                }
                for (var tsd in totalStockData) {
                  if (totalStockData[tsd].mCode == deviceRecords[dr].mCode.value) {
                    for (var duv in deviceRecords[dr].uStockList.value) {
                      if (totalStockData[tsd].uCode == deviceRecords[dr].uStockList.value[duv].value.uCode.value) {
                        deviceRecords[dr].uStockList.value[duv].value.uStock.value = totalStockData[tsd].stockNum;
                      }
                    }
                  }
                }
                putDeviceData.push(putStockBody);
              }

              putRecords(sysid.INV.app_id.unit, putStockData);
              putRecords(sysid.INV.app_id.device, putDeviceData);
            });
        } else {
          //出荷在庫と入荷在庫を拠点から増減
          for (var ca in codeArray) {
            for (var ur in unitRecords) {
              if (codeArray[ca] == unitRecords[ur].uCode.value) {
                //更新在庫情報
                var putStockBody = {
                  'updateKey': {
                    'field': 'uCode',
                    'value': codeArray[ca]
                  },
                  'record': {
                    'mStockList': {
                      'value': unitRecords[ur].mStockList.value
                    }
                  }
                }
                if (putStockBody.updateKey.value == shipCode) {
                  for (var msl in putStockBody.record.mStockList.value) {
                    for (var sid in stockItemData) {
                      if (putStockBody.record.mStockList.value[msl].value.mCode.value == stockItemData[sid].mCode) {
                        putStockBody.record.mStockList.value[msl].value.mStock.value = parseInt(putStockBody.record.mStockList.value[msl].value.mStock.value || 0) - parseInt(stockItemData[sid].shipNum || 0);
                        var totalStockBody = {
                          'mCode': putStockBody.record.mStockList.value[msl].value.mCode.value,
                          'uCode': shipCode,
                          'stockNum': putStockBody.record.mStockList.value[msl].value.mStock.value
                        }
                        totalStockData.push(totalStockBody);
                      }
                    }
                  }
                } else if (putStockBody.updateKey.value == arrivalCode) {
                  for (var msl in putStockBody.record.mStockList.value) {
                    for (var sid in stockItemData) {
                      if (putStockBody.record.mStockList.value[msl].value.mCode.value == stockItemData[sid].mCode) {
                        putStockBody.record.mStockList.value[msl].value.mStock.value = parseInt(putStockBody.record.mStockList.value[msl].value.mStock.value || 0) + parseInt(stockItemData[sid].shipNum || 0);
                        var totalStockBody = {
                          'mCode': putStockBody.record.mStockList.value[msl].value.mCode.value,
                          'uCode': arrivalCode,
                          'stockNum': putStockBody.record.mStockList.value[msl].value.mStock.value
                        }
                        totalStockData.push(totalStockBody);
                      }
                    }
                  }
                }
                putStockData.push(putStockBody);
              }
            }
          }

          //商品管理に在庫数反映
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getDeviceBody)
            .then(function (resp) {
              var deviceRecords = resp.records;
              //更新商品格納配列
              var putDeviceData = [];
              for (var dr in deviceRecords) {
                var putStockBody = {
                  'updateKey': {
                    'field': 'mCode',
                    'value': deviceRecords[dr].mCode.value
                  },
                  'record': {
                    'uStockList': {
                      'value': deviceRecords[dr].uStockList.value
                    }
                  }
                }
                for (var tsd in totalStockData) {
                  if (totalStockData[tsd].mCode == deviceRecords[dr].mCode.value) {
                    for (var duv in deviceRecords[dr].uStockList.value) {
                      if (totalStockData[tsd].uCode == deviceRecords[dr].uStockList.value[duv].value.uCode.value) {
                        deviceRecords[dr].uStockList.value[duv].value.uStock.value = totalStockData[tsd].stockNum;
                      }
                    }
                  }
                }
                putDeviceData.push(putStockBody);
              }

              putRecords(sysid.INV.app_id.unit, putStockData);
              putRecords(sysid.INV.app_id.device, putDeviceData);
            });
        }
      });
  }

  // 輸送情報連携
  const setDeliveryInfo = function (pageRecod) {
    var putDeliveryData = [];
    var putDeliveryBody = {
      'id': pageRecod.prjId.value,
      'record': {
        'deliveryCorp': {
          'value': pageRecod.deliveryCorp.value
        },
        'trckNum': {
          'value': pageRecod.trckNum.value
        },
        'sendDate': {
          'value': pageRecod.sendDate.value
        },
        'expArrivalDate': {
          'value': pageRecod.expArrivalDate.value
        }
      }
    }
    putDeliveryData.push(putDeliveryBody);

    var putStatusBody = {
      'app': sysid.PM.app_id.project,
      'id': pageRecod.prjId.value,
      'action': '製品発送待ち'
    }
    var putStatusBody2 = {
      'app': sysid.PM.app_id.project,
      'id': pageRecod.prjId.value,
      'action': '納品手配'
    }

    putRecords(sysid.PM.app_id.project, putDeliveryData);
    kintone.api(kintone.api.url('/k/v1/record/status.json', true), "PUT", putStatusBody);
    kintone.api(kintone.api.url('/k/v1/record/status.json', true), "PUT", putStatusBody2);
  }

})();