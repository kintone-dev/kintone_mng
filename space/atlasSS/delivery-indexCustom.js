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

        console.log(deleteData);

        var deleteBody = {
          'app': kintone.app.getId(),
          'ids': deleteData
        };

        //配列の長さが100より大きい場合
        if (deleteData.length > 100) {
          //配列の長さを100で割って切り捨て
          var loopNum = Math.floor(deleteData.length / 100);
          for (var i = 0; i <= loopNum; i++) {
            if (i == 0) {
              //100ずつ配列をスライスして格納
              var cutDeleteData = deleteData.slice(0, 100);
              deleteBody = {
                'app': kintone.app.getId(),
                'ids': cutDeleteData
              };

              kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteBody).then(function (resp) {
                location.reload();
                console.log('データを削除いたしました。')
              }).catch(function (error) {
                console.log(error);
              });

            } else {
              //100ずつ配列をスライスして格納
              var cutDeleteData = deleteData.slice(i * 100, (i * 100) + 100);

              deleteBody = {
                'app': kintone.app.getId(),
                'ids': cutDeleteData
              };

              kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteBody).then(function (resp) {
                location.reload();
                console.log('データを削除いたしました。')
              }).catch(function (error) {
                console.log(error);
              });
            }
          }

        } else {
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteBody).then(function (resp) {
            location.reload();
            console.log('データを削除いたしました。')
          }).catch(function (error) {
            console.log(error);
          });
        }

      }).catch(function (error) {
        console.log(error);
      });
    });

    //内部連携ボタンクリック時
    $('#' + sync_kintone.id).on('click', function () {
      var getReqBody = {
        'app': kintone.app.getId(),
        'query': 'working_status in (\"TOASTCAM登録待ち\") and person_in_charge in (\"Accel Lab\") order by 更新日時 asc'
      };

      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReqBody).then(function (resp) {
        var shipList = resp.records;

        for (let ri in shipList) {
          // 申し込み種別が新規申し込みの時
          if (shipList[ri].application_type.value.match(/新規申込/)) {
            // 会員情報関連
            var postBody_member = {
              app: sysid.ASS.app_id.member,
              record: {
                member_id: {
                  value: shipList[ri].member_id.value
                },
                member_type: {
                  value: shipList[ri].member_type.value
                },
                application_datetime: {
                  value: shipList[ri].application_datetime.value
                },
                application_type: {
                  value: shipList[ri].application_type.value
                }
              }
            };

            console.log(postBody_member);

            kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', postBody_member).then(function (resp) {
              // ログデータ
              var logBody_ship = {
                app: kintone.app.getId(),
                id: parseInt(shipList[ri].レコード番号.value),
                record: {
                  working_status: {
                    value: '必要情報入力済み'
                  },
                  syncLog_list: {
                    value: [
                      {
                        value: {
                          syncLog_date: {
                            value: new Date()
                          },
                          syncLog_type: {
                            value: 'KT-会員情報'
                          },
                          syncLog_status: {
                            value: 'success'
                          },
                          syncLog_message: {
                            value: '会員情報を連携しました。'
                          }
                        }
                      }
                    ]
                  }
                }
              };

              // var logInfo = {
              //   value: {
              //     syncLog_date: {
              //       value: new Date()
              //     },
              //     syncLog_type: {
              //       value: 'KT-会員情報'
              //     },
              //     syncLog_status: {
              //       value: 'success'
              //     },
              //     syncLog_message: {
              //       value: '会員情報を連携しました。'
              //     }
              //   }
              // }

              // logList.push(logInfo);

              console.log(logBody_ship);

              kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', logBody_ship).then(function (resp) {
                console.log('log success');
              }).catch(function (error) {
                console.log(error);
              });

            }).catch(function (error) {
              console.log(error);
            });


          } else if (resp.records[ri].application_type.value.match(/故障交換/)) {
            console.log('故障交換');
          }
        }

      }).catch(function (error) {
        console.log(error);
      });
    });

  });
})();