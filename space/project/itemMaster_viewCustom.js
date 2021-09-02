(function(){
  'use strict';

  kintone.events.on(events_ced, function(event){
    $('.gaia-argoui-app-menu-add').remove();
    $('.recordlist-edit-gaia').remove();
    $('.recordlist-remove-gaia').remove();
    $('.gaia-argoui-app-menu-edit').remove();
    $('.gaia-argoui-app-menu-copy').remove();

  kintone.events.on(['app.record.edit.show'], function(event){    
    event.record.mName.disabled = true;
    event.record.mCode.disabled = true;
    event.record.mNickname.disabled = true;
    event.record.mType.disabled = true;
    event.record.mVendor.disabled = true;
    event.record.endservice.disabled = true;

    return event;
  });

})();