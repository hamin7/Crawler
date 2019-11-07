function sortPosts(obj) {
    return Object.keys(obj)
      .sort(function(a, b) {
        return obj[b].unixDate - obj[a].unixDate;
      })
      .reduce((a, v) => {
        a.push(obj[v]);
        return a;
      }, []);
  }
  
  function extractHostname(url){
      var hostname;
      if (url.indexOf("//") > -1){
          hostname = url.split('/')[2];
      }else{
          hostname = url.split('/')[0];
      }
      hostname = hostname.split(':')[0];
      hostname = hostname.split('?')[0];
      return hostname;
  }
  
  function isNewFeed(url, callback){
    chrome.storage.local.get(["feeds"], function(result){
      var isNew = true;
      for(var idx in result.feeds){
        var feed = result.feeds[idx];
        if(feed.url == url){
          isNew = false;
          break;
        }
      }
      if(isNew){
        callback(true, result.feeds);
      }else{
        callback(false, result.feeds);
      }
    });
  }
  
  function getProp($element, properties){
    var property = properties.split(".");
    var result;
    for(var idx in property){
      if(idx == 0){
        result = $element.prop(property[idx]);
      }else{
        result = result[property[idx]];
      }
    }
    return result;
  }
  
  $("[data-i18n-code]").each(function(){
    var $this = $(this);
    var code = $this.data("i18nCode");
    var message = whale.i18n.getMessage(code);
    var attrName = $this.data("i18nAttr");
    if(attrName){
      $this.attr(attrName, message);
    }else{
      $this.text(message);
    }
  });