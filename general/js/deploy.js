(function () {
  'use strict';

  async function deploy() {
    var getDevBody = {
      app: kintone.app.getId()
    };
    var prodAppId = 179;

    var getProdBody = {
      app: prodAppId
    };

    var deployBody = {
      apps: [{
        app: prodAppId
      }]
    }

    var settingsDev = await kintone.api(kintone.api.url('/k/v1/app/settings.json', true), 'GET', getDevBody)
      .then(function (resp) {
        return resp;
      }).catch(function (error) {
        return error;
      });

    var fieldsDev = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', getDevBody)
      .then(function (resp) {
        return resp;
      }).catch(function (error) {
        return error;
      });

    var fieldsProd = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', getProdBody)
    .then(function (resp) {
      return resp;
    }).catch(function (error) {
      return error;
    });

    var layoutDev = await kintone.api(kintone.api.url('/k/v1/app/form/layout.json', true), 'GET', getDevBody)
      .then(function (resp) {
        return resp;
      }).catch(function (error) {
        return error;
      });

    delete settingsDev.revision;
    delete fieldsDev.revision;
    // delete fieldsDev.properties.レコード番号;
    // delete fieldsDev.properties.カテゴリー;
    // delete fieldsDev.properties.ステータス;
    // delete fieldsDev.properties.作成日時;
    // delete fieldsDev.properties.作成者;
    // delete fieldsDev.properties.作業者;
    // delete fieldsDev.properties.更新日時;
    // delete fieldsDev.properties.更新者;
    delete layoutDev.revision;

    settingsDev.name = settingsDev.name.replace(/\(DEV\)/g, '')
    settingsDev.app = prodAppId;
    fieldsDev.app = prodAppId;
    layoutDev.app = prodAppId;

    console.log(Object.keys(fieldsProd.properties).length);
    console.log(Object.keys(fieldsDev.properties).length);
    console.log(settingsDev);
    console.log(fieldsDev);
    console.log(layoutDev);

    await kintone.api(kintone.api.url('/k/v1/preview/app/settings.json', true), 'PUT', settingsDev)
      .then(function (resp) {
        console.log(resp);
        return resp;
      }).catch(function (error) {
        console.log(error);
        return error;
      });

    await kintone.api(kintone.api.url('/k/v1/preview/app/form/fields.json', true), 'POST', fieldsDev)
      .then(function (resp) {
        console.log(resp);
        return resp;
      }).catch(function (error) {
        console.log(error);
        return error;
      });

    await kintone.api(kintone.api.url('/k/v1/preview/app/form/layout.json', true), 'PUT', layoutDev)
      .then(function (resp) {
        console.log(resp);
        return resp;
      }).catch(function (error) {
        console.log(error);
        return error;
      });

    await kintone.api(kintone.api.url('/k/v1/preview/app/deploy.json', true), 'POST', deployBody)
      .then(function (resp) {
        console.log(resp);
        return resp;
      }).catch(function (error) {
        console.log(error);
        return error;
      });
  }

  deploy();
})();