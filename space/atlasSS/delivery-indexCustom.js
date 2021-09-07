(function () {
  'use strict';

  kintone.events.on('app.record.index.show', function (event) {
    var del_records = setBtn_index('btn_del_records', '処理済みデータ削除');
    var sync_kintone = setBtn_index('btn_sync_kintone', '内部連携');

    //処理済みデータ削除
    $('#' + del_records.id).on('click', function () {

      var deleteReqBody = {
        'app': kintone.app.getId(),
        'query': 'working_status in (\"登録完了\") and person_in_charge in (\"ATLAS Smart Security\") order by 更新日時 asc'
      };

      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', deleteReqBody).then(function (resp) {
        var currentDate = new Date();
        var deleteData = [];

        //90日以上経ったデータを配列に格納
        for (var di in resp.records) {
          var createDate = new Date(resp.records[di].更新日時.value);
          var dateComp = currentDate.getTime() - createDate.getTime();

          if (dateComp > 7776000 * 1000) {
            deleteData.push(resp.records[di].$id.value)
          }
        }

        deleteRecords(kintone.app.getId(), deleteData);

      }).catch(function (error) {
        console.log(error);
      });
    });

    //内部連携ボタンクリック時
    $('#' + sync_kintone.id).on('click', function () {
      /*
        作業ステータス：準備中
        担当者：--------
        申込種別：新規申込

        会員情報に情報を更新
        AL専用を会員情報登録済に
      */

      var getNewMemBody = {
        'app': kintone.app.getId(),
        'query': 'working_status in ("準備中") and application_type in ("新規申込") and al_result = "" order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getNewMemBody)
        .then(function (resp) {
          var newMemList = resp.records;
          console.log(newMemList);

          //新規申込データ作成
          var postMemData = [];

          //新規申込作業ステータスデータ作成
          var putWStatNewData = [];

          for (let nml in newMemList) {
            var postBody_member = {
              'member_id': {
                value: newMemList[nml].member_id.value
              },
              'member_type': {
                value: newMemList[nml].member_type.value
              },
              'application_datetime': {
                value: newMemList[nml].application_datetime.value
              },
              'application_type': {
                value: newMemList[nml].application_type.value
              }
            };

            var putBody_workStatNew = {
              'id': newMemList[nml].レコード番号.value,
              'record': {
                'al_result': {
                  'value': '会員情報登録済'
                }
              }
            };

            postMemData.push(postBody_member);
            putWStatNewData.push(putBody_workStatNew);
          }

          //会員情報連携データ
          console.log('会員情報連携データ');
          console.log(postMemData);
          //会員情報連携完了ステータスデータ
          console.log('会員情報連携完了ステータスデータ');
          console.log(putWStatNewData);

          //新規申込
          postRecords(sysid.ASS.app_id.member, postMemData)
            .then(function (resp) {
              alert('新規申込情報連携に成功しました。');
              putRecords(kintone.app.getId(), putWStatNewData);
            }).catch(function (error) {
              console.log(error);
              alert('新規申込情報連携に失敗しました。システム管理者に連絡してください。');
            });
        });

      /*
        作業ステータス：TOASTCAM登録待ち
        担当者：Accel Lab
        申込種別：故障交換（保証期間内）、故障交換（保証期間外）

        ・故障品の情報を「検証待ち」、「故障品」に
        ・交換品の情報は出荷日、出荷用途以外は故障品からコピー
          出荷日、出荷用途は配送先リストから更新
      */
      var getReqBody = {
        'app': kintone.app.getId(),
        'query': 'working_status in ("TOASTCAM登録待ち") and person_in_charge in ("Accel Lab") and application_type in ("故障交換（保証期間内）", "故障交換（保証期間外）") order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReqBody)
        .then(function (resp) {
          var shipList = resp.records;
          console.log(shipList);

          //故障品データ作成
          var putDefData = [];

          //交換品query
          var getRepQueryArray = [];
          var getRepBody = {
            'app': sysid.DEV.app_id.sNum,
            'query': ''
          };

          //交換品データ作成
          var putRepData = [];

          for (let ri in shipList) {
            var putDefBody_sNum = {
              'updateKey': {
                'field': 'sNum',
                'value': resp.records[ri].failure_sNum.value
              },
              'memId': resp.records[ri].member_id.value,
              'record': {
                'sState': {
                  'value': '故障品'
                },
                'sDstate': {
                  'value': '検証待ち'
                }
              }
            };

            var putRepBody_sNum = {
              'updateKey': {
                'field': 'sNum',
                'value': resp.records[ri].replacement_sNum.value
              },
              'defKey': resp.records[ri].failure_sNum.value,
              'appType': shipList[ri].application_type.value,
              'shipDate': shipList[ri].shipping_datetime.value,
              'record': ''
            };

            getRepQueryArray.push('sNum = ');
            getRepQueryArray.push('"' + resp.records[ri].failure_sNum.value + '"');
            getRepQueryArray.push(' or ');

            putDefData.push(putDefBody_sNum);
            putRepData.push(putRepBody_sNum);
          }

          if (getRepQueryArray != []) {
            getRepQueryArray.pop();
          }

          var getDefQuery = getRepQueryArray.join('');
          getRepBody.query = getDefQuery;
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getRepBody)
            .then(function (resp) {
              var defRec = resp.records;
              console.log(defRec);

              //メンバーID比較
              for (let pdd in putDefData) {
                var defSnum = putDefData[pdd].updateKey.value;
                var defMemId = putDefData[pdd].memId;
                for (let ri in defRec) {
                  if (defRec[ri].sNum.value == defSnum) {
                    if (!defRec[ri].roomName.value == defMemId) {
                      putDefData.splice(pdd, 1);
                    }
                  }
                }
              }

              for (let pd in putDefData) {
                delete putDefData[pd].memId;
              }

              for (let prd in putRepData) {
                var defKey = putRepData[prd].defKey;
                for (let ri in defRec) {
                  if (defKey == defRec[ri].sNum.value) {
                    delete defRec[ri].$id;
                    delete defRec[ri].$revision;
                    delete defRec[ri].sDstate;
                    delete defRec[ri].sState;
                    delete defRec[ri].レコード番号;
                    delete defRec[ri].作成日時;
                    delete defRec[ri].作成者;
                    delete defRec[ri].ステータス;
                    delete defRec[ri].更新者;
                    delete defRec[ri].更新日時;

                    putRepData[prd].record = defRec[ri];
                  }
                }
              }

              for (let rd in putRepData) {
                putRepData[rd].record.sendDate.value = putRepData[rd].shipDate;
                putRepData[rd].record.sendType.value = putRepData[rd].appType;

                delete putRepData[rd].defKey;
                delete putRepData[rd].appType;
                delete putRepData[rd].shipDate;
                delete putRepData[rd].record.sNum;
              }

              var putDefRepData = putDefData.concat(putRepData);

              //故障品連携データ
              console.log('故障品連携データ');
              console.log(putDefData);
              //交換品連携データ
              console.log('交換品連携データ');
              console.log(putRepData);
              //故障品、交換品連携データ
              console.log('故障品、交換品連携データ');
              console.log(putDefRepData);

              //故障交換
              putRecords(sysid.DEV.app_id.sNum, putDefRepData)
                .then(function (resp) {
                  alert('故障交換情報連携に成功しました。');
                }).catch(function (error) {
                  console.log(error);
                  alert('故障交換情報連携に失敗しました。システム管理者に連絡してください。');
                });

            }).catch(function (error) {
              console.log(error);
            });
        });

      /*
        作業ステータス：TOASTCAM登録待ち
        担当者：Accel Lab
        申込種別：故障交換（保証期間内）、故障交換（保証期間外）以外

        ・記入されたシリアル番号に配送先リストの情報を追加する
      */
      var getNotDefBody = {
        'app': kintone.app.getId(),
        'query': 'working_status in ("TOASTCAM登録待ち") and person_in_charge in ("Accel Lab") and application_type not in ("故障交換（保証期間内）", "故障交換（保証期間外）") order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getNotDefBody)
        .then(function (resp) {
          var notDefList = resp.records;
          console.log(notDefList);

          //故障交換ステータスデータ作成
          var putSnumData = [];

          for (var ndl in notDefList) {
            var sNumsArray = sNumRecords(notDefList[ndl].deviceList.value, 'table');
            for (var snl in sNumsArray) {
              var dateCutter1 = notDefList[ndl].shipping_datetime.value.indexOf('T')
              var dateCutter2 = notDefList[ndl].application_datetime.value.indexOf('T')

              var putSnumBody = {
                'updateKey': {
                  'field': 'sNum',
                  'value': sNumsArray[snl]
                },
                'record': {
                  'sendDate': {
                    'value': notDefList[ndl].shipping_datetime.value.substring(0, dateCutter1)
                  },
                  'sendType': {
                    'value': '検証待ち'
                  },
                  'shipment': {
                    'value': '123倉庫'
                  },
                  'instName': {
                    'value': '高井戸西2丁目'
                  },
                  'roomName': {
                    'value': notDefList[ndl].member_id.value
                  },
                  'startDate': {
                    'value': notDefList[ndl].application_datetime.value.substring(0, dateCutter2)
                  },
                }
              };
              for (var psdl in putSnumData) {
                if (putSnumData[psdl].updateKey.value == putSnumBody.updateKey.value) {
                  putSnumData.splice(psdl, 1);
                }
              }
              putSnumData.push(putSnumBody);
            }
          }

          //シリアル番号連携データ
          console.log('シリアル番号連携データ');
          console.log(putSnumData);

          putRecords(sysid.DEV.app_id.sNum, putSnumData)
            .then(function (resp) {
              alert('シリアル番号情報連携に成功しました。');
            }).catch(function (error) {
              console.log(error);
              alert('シリアル番号情報連携に失敗しました。システム管理者に連絡してください。');
            });

        });


      /*
        作業ステータス：TOASTCAM登録待ち
        担当者：Accel Lab
        申込種別：--------
        BizID登録済み

        ・作業ステータスを必要情報入力済みに
      */
      var getStaBody = {
        'app': kintone.app.getId(),
        'query': 'working_status in ("TOASTCAM登録待ち") and person_in_charge in ("Accel Lab") and toastcam_bizUserId != "" order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getStaBody)
        .then(function (resp) {
          var bizInList = resp.records;
          console.log(bizInList);
          //故障交換ステータスデータ作成
          var putStatData = [];

          for (var bil in bizInList) {
            var putBody_workStat = {
              'id': bizInList[ri].レコード番号.value,
              'record': {
                'working_status': {
                  'value': '必要情報入力済み'
                }
              }
            };
            putStatData.push(putBody_workStat);
          }
          putRecords(kintone.app.getId(), putStatData);
        });

    });
  });
})();