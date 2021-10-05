(function () {
  'use strict';

  // 拠点情報取得＆繰り返し利用
  kintone.events.on('app.record.detail.process.proceed', async function (event) {
    var nStatus = event.nextStatus.value;

    //ステータスが集荷待ちの場合
    if (nStatus === "集荷待ち") {
      var shipmentName = event.record.shipment.value;
      var sNums = sNumRecords(event.record.deviceList.value, 'table');

      //ID更新
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
      //ID更新 end

      // if (shipmentName == '矢倉倉庫') {
      //   var postSnumData = [];
      //   for (var y in sNums) {
      //     var snRecord = {
      //       'sNum': {
      //         'value': sNums[y]
      //       },
      //       'shipment': event.record.shipment,
      //       'sendDate': event.record.sendDate,
      //       'shipType': event.record.shipType,
      //       'instName': event.record.instName
      //     };
      //     postSnumData.push(snRecord);
      //   }
      //   postRecords(sysid.DEV.app_id.sNum, postSnumData);
      // } else {
      // }

      //在庫処理
      await stockCtrl(event, kintone.app.getId());
      // ステータスが出荷完了の場合
    } else if (nStatus === "出荷完了") {
      // 輸送情報連携
      setDeliveryInfo(event.record);

      // レポート処理
      await reportCtrl(event, kintone.app.getId());

    } else if (nStatus === "受領待ち") {
      var txt = $('[name=setShipment] option:selected').text();
      var val = $('[name=setShipment] option:selected').val();
      if (val != 'noSelect') {
        event.record.shipment.value = txt;
        event.record.sys_shipmentCode.value = val;
      } else {
        event.error = '出荷ロケーションを選択して下さい。';
      }
    }

    return event;
  });

  // 納品情報未確定のものをステータス変更
  kintone.events.on('app.record.index.show', function (event) {
    if (sessionStorage.getItem('record_updated') === '1') {
      sessionStorage.setItem('record_updated', '0');
      return event;
    }
    var getShipBody = {
      'app': sysid.INV.app_id.shipment,
      'query': 'prjId != "" order by レコード番号'
    };
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getShipBody)
      .then(function (resp) {
        if (resp.records != 0) {
          var putStatusData = {
            'app': sysid.INV.app_id.shipment,
            'records': []
          };
          for (var i in resp.records) {
            if (resp.records[i].ステータス.value == '納品情報未確定') {
              var putStatusBody = {
                'id': resp.records[i].$id.value,
                'action': '処理開始'
              };
              putStatusData.records.push(putStatusBody);
            }
          }
          kintone.api(kintone.api.url('/k/v1/records/status.json', true), "PUT", putStatusData);
          sessionStorage.setItem('record_updated', '1');
          location.reload();
        }
      });
  });

  /* ---以下関数--- */
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
      'action': '製品発送'
    };
    putRecords(sysid.PM.app_id.project, putDeliveryData);
    kintone.api(kintone.api.url('/k/v1/record/status.json', true), "PUT", putStatusBody);
  }
})();