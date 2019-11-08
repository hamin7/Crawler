
  var { Stitch, RemoteMongoClient, BSON } = stitch;
  var client = Stitch.initializeDefaultAppClient("scrapper-upuss");
  var mongodb = client.getServiceClient(stitch.RemoteMongoClient.factory, "mongodb-atlas");
  var db = mongodb.db("scrapper");
  try{
    client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(console.debug("db connected")).catch(e => console.error(err));
  }catch(e){
    localStorage.clear();
  }

  function init(){
    tabHash();
    $("#feedListPanel").children().remove();
    $("#crawlerListPanel").children().remove();
    whale.storage.local.get(["feeds", "interval", "expireDay", "notification", "keywords"], function(storage){
      $("input:radio[name='interval']:radio[value='"+storage.interval+"']").attr("checked",true).parent().addClass("active");
      $("input:radio[name='expireDay']:radio[value='"+storage.expireDay+"']").attr("checked",true).parent().addClass("active");
      $("#notification").prop('checked', storage.notification);
      for(var idx in storage.keywords){
        $('#keywords').tagsinput('add', storage.keywords[idx]);
      }

      for(var idx in storage.feeds){
        var feed = storage.feeds[idx];
        if(feed.linkSelector){
          appendCrawler(feed);
        }else{
          appendFeed(feed);
        }
      }
    });
  }

  var tabHash = function(){
    if(window.location.hash){
      var hashVal = window.location.hash;
      $('a[href="'+hashVal+'"]').tab("show");
    }
  }

  function toast(title, message){
    var toastTag ="";
    toastTag += '<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="true" data-delay="3000">';
    toastTag += '  <div class="toast-header">';
    toastTag += '    <strong class="mr-auto dynamic-title-text"></strong>';
    toastTag += '    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">';
    toastTag += '      <span aria-hidden="true">&times;</span>';
    toastTag += '    </button>';
    toastTag += '  </div>';
    toastTag += '  <div class="toast-body dynamic-message-text"></div>';
    toastTag += '</div>';
    $toast = $(toastTag);
    $toast.find(".dynamic-title-text").text(title);
    $toast.find(".dynamic-message-text").text(message);

    $toast.appendTo("#toastListPanel");
    $toast.on('hidden.bs.toast', function () {
      $toast.remove();
    })
    $toast.toast("show");
  }

  // �??�한 ?�드 ?�업?? 뿌리�?
  function appendSearchFeed(title, url){
    isNewFeed(url, function(isNew, feeds){
      var domain = extractHostname(url);
      var favicon = "http://www.google.com/s2/favicons?domain="+domain;
      var feedTag ="";
      feedTag += '<li class="list-group-item list-group-item-action '+(isNew?'list-group-item-primary':'')+'">';
      feedTag += '  <div class="d-flex w-100 justify-content-between">';
      feedTag += '    <span class="mb-1 mr-1 dynamic-title-text"></span>';
      if(isNew){
        feedTag += '    <button type="button" class="btn btn-primary btn-xsm text-nowrap dynamic-data"><i class="fas fa-plus"></i><span data-i18n-code="add">'+whale.i18n.getMessage("add")+'</span></button>';
      }
      feedTag += '  </div>';
      feedTag += '  <small class="dynamic-text-url"></small>';
      feedTag += '</li>';
      $feedTag = $(feedTag);
      $feedTag.find(".dynamic-title-text").text(title);
      $feedTag.find(".dynamic-data").data("url", url);
      $feedTag.find(".dynamic-data").data("favicon", favicon);
      $feedTag.find(".dynamic-data").data("title", title);
      $favicon = $("<img>").attr("src", favicon);
      $link = $("<span>").addClass("px-1").text(url);
      $feedTag.find(".dynamic-text-url").append($favicon).append($link);
      $("#searchFeedListPanel").append($feedTag);
    });
  }

  // ?�재 추�??�어 ?�는 ?�드?? 리스?? 뿌리�?
  function appendFeed(feed){
    var feedTag ="";
    feedTag += '<li class="list-group-item list-group-item-action '+(feed.isError?'list-group-item-danger':'list-group-item-primary')+'">';
    feedTag += '  <div class="d-flex w-100 justify-content-between">';
    feedTag += '    <input type="text" name="feedTitle" class="form-control form-control-sm mr-5">';
    feedTag += '    <button type="button" name="feedDelBtn" class="btn btn-danger btn-sm text-nowrap"><i class="fas fa-minus-circle"></i> <span data-i18n-code="delete">'+whale.i18n.getMessage("delete")+'</span></button>';
    feedTag += '  </div>';
    feedTag += '  <small class="dynamic-text-url"></small>';
    feedTag += '</li>';
    $feedTag = $(feedTag);
    $feedTag.find("input:text").val(feed.title);
    $feedTag.find("input:text").attr("data-url", feed.url);
    $feedTag.find("button").attr("data-url", feed.url);
    $favicon = $("<img>").attr("src", feed.favicon);
    $link = $("<a>").addClass("px-1").attr("href", feed.url).attr("target", "_blank").text(feed.url);
    $feedTag.find(".dynamic-text-url").append($favicon).append($link);
    $("#feedListPanel").append($feedTag);
  }

  // ?�재 추�??�어 ?�는 ?�롤?�들 리스?? 뿌리�?
  function appendCrawler(feed){
    var feedTag ="";
    feedTag += '<li class="list-group-item list-group-item-action '+(feed.isError?'list-group-item-danger':'list-group-item-primary')+'">';
    feedTag += '  <div class="d-flex w-100 justify-content-between">';
    feedTag += '    <span class="title_text"></span>';
    feedTag += '    <button type="button" name="feedDelBtn" class="btn btn-danger btn-sm text-nowrap"><i class="fas fa-minus-circle"></i> <span data-i18n-code="delete">'+whale.i18n.getMessage("delete")+'</span></button>';
    feedTag += '  </div>';
    feedTag += '  <small class="dynamic-text-url"></small>';
    feedTag += '</li>';
    $feedTag = $(feedTag);
    $feedTag.data("url", feed.url);
    $feedTag.data("title", feed.title);
    $feedTag.data("titleSelector", feed.titleSelector);
    $feedTag.data("titleProp", feed.titleProp);
    $feedTag.data("linkSelector", feed.linkSelector);
    $feedTag.data("linkProp", feed.linkProp);
    $feedTag.data("dateSelector", feed.dateSelector);
    $feedTag.data("dateProp", feed.dateProp);
    $feedTag.data("contentSelector", feed.contentSelector);
    $feedTag.data("contentProp", feed.contentProp);
    $feedTag.data("imageSelector", feed.imageSelector);
    $feedTag.data("imageProp", feed.imageProp);
    $feedTag.find(".title_text").text(feed.title);
    $feedTag.find("button").attr("data-url", feed.url);
    $favicon = $("<img>").attr("src", feed.favicon);
    $link = $("<a>").addClass("px-1").attr("href", feed.url).attr("target", "_blank").text(feed.url);
    $feedTag.find(".dynamic-text-url").append($favicon).append($link);
    $("#crawlerListPanel").append($feedTag);
  }

  // ?�들?? 추�??? 최근 ?�롤?�들 리스?? 뿌리�?
  function appendRecentCrawler(feed){
    var feedTag ="";
    feedTag += '<li class="list-group-item list-group-item-action list-group-item-light">';
    feedTag += '  <div class="d-flex w-100 justify-content-between">';
    feedTag += '    <span class="title_text"></span>';
    feedTag += '  </div>';
    feedTag += '  <small class="dynamic-text-url"></small>';
    feedTag += '</li>';
    $feedTag = $(feedTag);
    $feedTag.data("url", feed.url);
    $feedTag.data("title", feed.title);
    $feedTag.data("titleSelector", feed.titleSelector);
    $feedTag.data("titleProp", feed.titleProp);
    $feedTag.data("linkSelector", feed.linkSelector);
    $feedTag.data("linkProp", feed.linkProp);
    $feedTag.data("dateSelector", feed.dateSelector);
    $feedTag.data("dateProp", feed.dateProp);
    $feedTag.data("contentSelector", feed.contentSelector);
    $feedTag.data("contentProp", feed.contentProp);
    $feedTag.data("imageSelector", feed.imageSelector);
    $feedTag.data("imageProp", feed.imageProp);
    $feedTag.find(".title_text").text(feed.title);
    $favicon = $("<img>").attr("src", feed.favicon);
    $link = $("<a>").addClass("px-1").attr("href", feed.url).attr("target", "_blank").text(feed.url);
    $feedTag.find(".dynamic-text-url").append($favicon).append($link);
    $("#crawlerRecentListPanel").append($feedTag);
  }

  function appendPost(selector, post){
    var postTag ="";
    postTag += '<li class="list-group-item list-group-item-action p-2" data-toggle="tooltip">';
    postTag += '  <div class="d-flex">';
    if(post.image){
      postTag += '    <img src="" class="img-thumbnail mr-2 my-auto" style="width:60px; height:60px;" />';
    }
    postTag += '    <div class="w-100">';
    postTag += '      <div class="d-flex">';
    postTag += '        <span class="mb-1 w-100 text-break dynamic-title-text"></span>';
    postTag += '        <div class="text-nowrap px-1" name="btnDiv">';
    postTag += '        </div>';
    postTag += '      </div>';
    postTag += '      <p class="mb-1"><small class="text-break dynamic-content-text"></small></p>';
    postTag += '      <small class="text-muted dynamic-date-text"></small>';
    postTag += '    </div>';
    postTag += '  </div>';
    postTag += '</li>';

    $postTag = $(postTag);
    $postTag.attr("title", post.link);
    $postTag.find("img").attr("src", post.image).on("error", function(){
      $(this).hide();
    });
    $postTag.find(".dynamic-title-text").text(post.title);
    $postTag.find(".dynamic-content-text").text(post.contentSnippet);
    $favicon = $("<img>").attr("src", post.feedFavicon).css("margin-top", "-2px");
    $feedName = $("<span>").addClass("mx-1").text(post.feedTitle);
    $pubDate = $("<span>").addClass("mx-1").text(moment.unix(post.unixDate).fromNow());
    $postTag.find(".dynamic-date-text").append($favicon).append($feedName).append($pubDate);

    $(selector).append($postTag);
  }

  // 미리보기
  function previewer(){
    $("#postPanel").children().remove();
    var posts = getPostsObjFromHtmlText();
    for(var idx in posts){
      var post = posts[idx];
      appendPost("#postPanel", post);
    }

  }

  // 미리보기
  function getPostsObjFromHtmlText(){
    var feedUrl = $("#webUrl").attr("href");
    var feedTitle = $("#feedTitle").val();
    var linkSelector = $("#linkSelector").val();
    var linkProp = $("#linkProp").val();
    var titleSelector = $("#titleSelector").val();
    var titleProp = $("#titleProp").val();
    var dateSelector = $("#dateSelector").val();
    var dateProp = $("#dateProp").val();
    var imageSelector = $("#imageSelector").val();
    var imageProp = $("#imageProp").val();
    var contentSelector = $("#contentSelector").val();
    var contentProp = $("#contentProp").val();

    var domain = extractHostname(feedUrl);
    var favicon = "http://www.google.com/s2/favicons?domain="+domain;
    var html = $("#htmlText").val();
    var doc = document.implementation.createHTMLDocument("temp");
    doc._URL = feedUrl;
    doc.body.innerHTML = html;
    var base = doc.createElement("base");
    base.setAttribute("href", feedUrl);
    doc.head.appendChild(base);
    try{
      var $html = $(doc);
      var $links = $html.find(linkSelector);
      var $titles = $html.find(titleSelector);
      var $dates = $html.find(dateSelector);
      var $images = $html.find(imageSelector);
      var $contents = $html.find(contentSelector);
    }catch(e){
      toast(whale.i18n.getMessage("preview"), e.message); // "미리 보기"
      return;
    }

    if(linkSelector == ""){
      toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("input_selector_msg")); // "미리 보기", "???�터 ?�현?�을 ?�력?�주?�요"
      $("#linkSelector").focus();
      return;
    }else{
      if(linkProp == ""){
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("input_property_msg")); // "미리 보기", "?�로?�티명을 ?�력?�주?�요"
        $("#linkProp").focus();
        return;
      }
      if($links.length == 0){
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("no_crawling_data")); // "미리 보기", "?�롤링한 ?�이?��? ?�습?�다"
        return;
      }
    }

    if(titleSelector == ""){
      toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("input_selector_msg")); // "미리 보기", "???�터 ?�현?�을 ?�력?�주?�요"
      $("#titleSelector").focus();
      return;
    }else{
      if(titleProp == ""){
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("input_property_msg")); // "미리 보기", "?�로?�티명을 ?�력?�주?�요"
        $("#titleProp").focus();
        return;
      }
      if($links.length == $titles.length){
      }else{
        var info = " ("+whale.i18n.getMessage("link")+": "+$links.length+", "+whale.i18n.getMessage("title")+": "+$titles.length+")";
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("crawling_count_not_match")+info); // "미리 보기", "?�롤링한 ?�이?�의 ?��? ?�치?��? ?�습?�다 (링크: n, ???��?: n)"
        return;
      }
    }
    if(dateSelector == ""){
    }else{
      if(dateProp == ""){
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("input_property_msg")); // "미리 보기", "?�로?�티명을 ?�력?�주?�요"
        $("#dateProp").focus();
        return;
      }
      if($links.length == $dates.length){
      }else{
        var info = " ("+whale.i18n.getMessage("link")+": "+$links.length+", "+whale.i18n.getMessage("date")+": "+$dates.length+")";
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("crawling_count_not_match")+info); // "미리 보기", "?�롤링한 ?�이?�의 ?��? ?�치?��? ?�습?�다 (링크: n, ?�짜: n)"
        return;
      }
    }
    if(imageSelector == ""){
    }else{
      if(imageProp == ""){
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("input_property_msg")); // "미리 보기", "?�로?�티명을 ?�력?�주?�요"
        $("#imageProp").focus();
        return;
      }
      if($links.length == $images.length){
      }else{
        var info = " ("+whale.i18n.getMessage("link")+": "+$links.length+", "+whale.i18n.getMessage("thumbnail")+": "+$images.length+")";
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("crawling_count_not_match")+info); // "미리 보기", "?�롤링한 ?�이?�의 ?��? ?�치?��? ?�습?�다 (링크: n, ?��?�?: n)"
        return;
      }
    }
    if(contentSelector == ""){
    }else{
      if(contentProp == ""){
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("input_property_msg")); // "미리 보기", "?�로?�티명을 ?�력?�주?�요"
        $("#contentProp").focus();
        return;
      }
      if($links.length == $contents.length){
      }else{
        var info = " ("+whale.i18n.getMessage("link")+": "+$links.length+", "+whale.i18n.getMessage("description")+": "+$contents.length+")";
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("crawling_count_not_match")+info); // "미리 보기", "?�롤링한 ?�이?�의 ?��? ?�치?��? ?�습?�다 (링크: n, ?�명: n)"
        return;
      }
    }

    var posts = [];
    $links.each(function(i){
      try{
        var link = getProp($(this), linkProp);
        var title = getProp($titles.eq(i), titleProp);
        var date = getProp($dates.eq(i), dateProp);
        var content = getProp($contents.eq(i), contentProp);
        var image = getProp($images.eq(i), imageProp);
      }catch(e){
        toast(whale.i18n.getMessage("preview"), e.message); // 미리보기
        return false;
      }
      var isoDate;
      var momentObject;
      if(date && typeof date === "string"){
        date = date.trim();
        if(date && date.length == 5){
          momentObject = moment(date, ["HH:mm", "MM/DD", "MM.DD", "MM-DD"], true);
          if(momentObject.isValid()){
            if(moment().startOf('date').isSame(momentObject)){
              isoDate = moment().toISOString();
            }else if(date.indexOf(":") > -1 && moment().isBefore(momentObject)){ // ?�간?? ?�재?�간보다 ?�면 ?�제
              isoDate = momentObject.subtract(1, "day").toISOString();
            }else if(moment().isBefore(momentObject)){ // ?�간?? ?�재?�간보다 ?�면 ?�년
              isoDate = momentObject.subtract(1, "year").toISOString();
            }else{
              isoDate = momentObject.toISOString();
            }
          }else{
            isoDate = moment().toISOString();
          }
        }else if(date && date.length == 8){
          momentObject = moment(date, ["HH:mm:ss", "YY/MM/DD", "YY.MM.DD", "YY-MM-DD"], true);
          if(momentObject.isValid()){
            if(moment().startOf('date').isSame(momentObject)){
              isoDate = moment().toISOString();
            }else if(date.indexOf(":") > -1 && moment().isBefore(momentObject)){
              isoDate = momentObject.subtract(1, "day").toISOString();
            }else{
              isoDate = momentObject.toISOString();
            }
          }else{
            isoDate = moment().toISOString();
          }
        }else{
          try {
            isoDate = new Date(date).toISOString();
          } catch (e) {
            isoDate = moment().toISOString();
          }
        }
      }else{
        isoDate = moment().toISOString();
      }
      var contentSnippet = htmlDecode(content||"");
      contentSnippet = contentSnippet.replace(/[\n\r]/g, " ").replace(/\s{2,}/g, " ");
      if(contentSnippet.length > 100){
        contentSnippet = contentSnippet.substr(0, 100)+"...";
      }
      var post = {};
      post.feedTitle = feedTitle;
      post.feedFavicon = favicon;
      if(link){
        post.link = new URL(link, feedUrl).href;
      }else{
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("no_link_data")); // "미리보기", "링크 ?�보�? ?�습?�다"
        return false;
      }
      if(title && typeof title === "string"){
        post.title = title.trim();
      }else{
        toast(whale.i18n.getMessage("preview"), whale.i18n.getMessage("no_title_data")); // "미리보기", "???��? ?�보�? ?�습?�다"
        return false;
      }
      if(isoDate){
        post.unixDate = moment(isoDate, moment.ISO_8601).unix();
      }
      if(contentSnippet){
        post.contentSnippet = contentSnippet;
      }
      if(image){
        var bgUrlMatch = image.match(/url\(['"]?(.+)['"]\)/i);
        if(bgUrlMatch){
          image = bgUrlMatch[1];
        }
        post.image = new URL(image, feedUrl).href;
      }
      posts.push(post);
    });
    return posts;
  }

  function setCrawlerModal(obj){
    if(obj){
    }else{
      obj = {};
    }
    $("#webUrl").attr("href", obj.url||"").text(obj.url||"");
    $("#feedTitle").val(obj.title||"");
    $("#htmlText").val("");
    $("#titleSelector").val(obj.titleSelector||"");
    $("#titleProp").val(obj.titleProp||"");
    $("#linkSelector").val(obj.linkSelector||"");
    $("#linkProp").val(obj.linkProp||"");
    $("#dateSelector").val(obj.dateSelector||"");
    $("#dateProp").val(obj.dateProp||"");
    $("#imageSelector").val(obj.imageSelector||"");
    $("#imageProp").val(obj.imageProp||"");
    $("#contentSelector").val(obj.contentSelector||"");
    $("#contentProp").val(obj.contentProp||"");

    $("#feedTitle, #linkSelector, #linkProp, #titleSelector, #titleProp").trigger("change");
    $("#postPanel").children().remove();
  }

  $(document).ready(function() {
    moment.locale(whale.i18n.getUILanguage());
    init();

    // ?�정 ???? 버튼
    $("#saveSettingsBtn").on("click", function(){
      var interval = $("input:radio[name='interval']:checked").val();
      var expireDay = $("input:radio[name='expireDay']:checked").val();
      var notification = $("#notification").is(":checked");
      var keywords = $("#keywords").tagsinput('items');

      whale.storage.local.set({
        "interval": interval,
        "expireDay": expireDay,
        "notification": notification,
        "keywords":keywords
      }, function(){
        whale.alarms.clear("getFeed", function(){
          whale.alarms.create("getFeed", {delayInMinutes: parseInt(interval)});
          toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("save_complete")); // "????", "???? ?�었?�니??"
        });
      });

    });

    // ?�드 �??? 버튼
    $("#searchFeedBtn").on("click", function(){
      var $btn = $(this);
      $btn.data("original-text", $btn.html()).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...').prop("disabled", true);
      var searchUrl = $("#searchUrl").val();        // searchUrl�� ũ�Ѹ� �� url.
      $.get({
        url: searchUrl,     // url ����.
        dataType: "text"
      }).done(function(docString){
          var domParser = new DOMParser();      // domParser ��ü ����.
          var doc = domParser.parseFromString(docString, "text/xml");      
          var feeds = [];
          if (containsFeed(doc)){
              feeds.push({
                url: searchUrl,
                title: doc.getElementsByTagName("title")[0].textContent
              });
          }else{
              doc = domParser.parseFromString(docString, "text/html");
              feeds = findFeedLinks(doc);
          }
          if(feeds.length > 0){
            $("#searchFeedListPanel").children().remove();
            for(var idx in feeds){
              var feed = feeds[idx];
              feed.title = htmlDecode(feed.title||"");
              appendSearchFeed(feed.title, feed.url);
            }
            $('#addFeedsModal').modal('show');
          }else{
            toast(whale.i18n.getMessage("search"), whale.i18n.getMessage("feed_not_found")); // "�???", "?�드�? 찾을 ?? ?�습?�다"
          }
          $btn.html($btn.data("original-text")).prop("disabled", false);
      }).fail(function(){
        toast(whale.i18n.getMessage("search"), whale.i18n.getMessage("feed_not_found")); // "�???", "?�드�? 찾을 ?? ?�습?�다"
        $btn.html($btn.data("original-text")).prop("disabled", false);
      });
    });
        

    // ?�드 추�? 버튼
    $("#searchFeedListPanel").on("click", "button", function(){
      var $btn = $(this);
      var url = $(this).data("url");
      var favicon = $(this).data("favicon");
      var title = $(this).data("title");
      var newFeed = {
          "url": url,
          "favicon": favicon,
          "title": title
      };
      isNewFeed(url, function(isNew, feeds){
        if(isNew){
          feeds.push(newFeed);
          whale.storage.local.set({"feeds":feeds}, function(){
            $btn.remove();
            init();
          });
        }else{
          $btn.remove();
        }
      });
    });

    // ?�드�? �?�? ?? ???? 버튼
    $("#saveFeedsBtn").on("click", function(){
      whale.storage.local.get(["feeds"], function(storage){
        $("input[name='feedTitle']").each(function(){
          var url = $(this).data("url");
          var title = $(this).val();
          for(var idx in storage.feeds){
            if(url == storage.feeds[idx].url){
              storage.feeds[idx].title = title;
              break;
            }
          }
        });
        whale.storage.local.set(storage, function(){
        toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("save_complete")); // "????", "???? ?�었?�니??"
        })
      });
    });

    // ?�드 ??�� 버튼
    $("#feedListPanel, #crawlerListPanel").on("click", "button[name='feedDelBtn']", function(event){
      event.stopPropagation();
      var url = $(this).data("url");
      whale.storage.local.get(["feeds", "postGroup", "newPostLinks"], function(storage){
        for(var idx in storage.feeds){
          if(url == storage.feeds[idx].url){
            var removedFeedUrl = storage.feeds.splice(idx, 1)[0].url;
            for(var key in storage.postGroup[removedFeedUrl]){
              var post = storage.postGroup[removedFeedUrl][key];
              delete storage.newPostLinks[post.link];
            }
            delete storage.postGroup[removedFeedUrl];
            break;
          }
        }
        whale.storage.local.set(storage, function(){
          var newCount = Object.keys(storage.newPostLinks).length;
          whale.sidebarAction.setBadgeText({text: newCount.toString()});
          whale.runtime.sendMessage({msg: "refresh"}); // 갱신?�업 ?�작
          init();
          toast(whale.i18n.getMessage("delete"), whale.i18n.getMessage("delete_complete")); // "??��", "??�� ?�었?�니??"
        })
      });
    });

    // ?�롤?? 링크
    $("#crawlerListPanel").on("click", "a", function(event){
      event.stopPropagation();
    });
    //#######################################################################################
    // ?�롤?? url�??? 버튼
    $("#getSiteBtn").on("click", function(){
      var searchUrl = $("#searchWebUrl").val();     // 설정된 사이트 소스 받기.
      if(searchUrl == ""){
        toast(whale.i18n.getMessage("search"), whale.i18n.getMessage("input_crawler_url_msg")); // "�???", "?�사?�트 주소�? ?�력?�세??"
        $("#searchWebUrl").focus();
        return;
      }

      setCrawlerModal()

      var $btn = $(this);
      $btn.data("original-text", $btn.html()).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...').prop("disabled", true);
      $.ajax({
          url: searchUrl,
          dataType: "arraybuffer",
          success: function(data, textStatus, request) {
            var contentType = request.getResponseHeader('content-type').toLowerCase();
            var charset;
            if(contentType.indexOf("charset") > -1){
              charset = contentType.split("charset=")[1];
            }
            if(charset == "ms949" || charset == "cp949"){
              charset = "euc-kr";
            }
            var dataView = new DataView(data);
            var docString = "";
            try{
              var decoder = new TextDecoder(charset);
              var decodedString = decoder.decode(dataView);
              docString = decodedString;
            }catch(e){
              var decoder = new TextDecoder();
              var decodedString = decoder.decode(dataView);
              docString = decodedString;
            }
            if(!charset){ // ?�더?? charset ?�보 ?�으�? html meta tag ?�인
              var charsetMatch = docString.match(/<meta[^>]*charset=[\"|\']([^\"]*)[\"|\'][^>]*>/i);
              if(charsetMatch){ // <meta charset="utf-8">
                charset = charsetMatch[1];
              }else{
                var contentTypeMatch = docString.match(/<meta[^>]*http-equiv=[\"|\']Content-Type[\"|\'][^>]*content=[\"]([^\"]*)[\"][^>]*>/i);
                if(contentTypeMatch){ // <meta http-equiv="Content-Type" content="text/html; charset=euc-kr">
                  charset = contentTypeMatch[1].split("charset=")[1];
                }
              }
              if(charset){
                try{
                  var decoder = new TextDecoder(charset);
                  var decodedString = decoder.decode(dataView);
                  docString = decodedString;
                }catch(e){
                  var decoder = new TextDecoder();
                  var decodedString = decoder.decode(dataView);
                  docString = decodedString;
                }
              }
            }
            var $html = $("<output/>").html(docString);
            var feedTitle = $html.find("title").text();
            $("#webUrl").attr("href", searchUrl).text(searchUrl);
            $("#htmlText").val(docString.trim());
            if(feedTitle){
              $("#feedTitle").val(feedTitle);
              $("#feedTitle").removeClass("is-invalid").addClass("is-valid");
            }else{
              $("#feedTitle").removeClass("is-valid").addClass("is-invalid");
            }
            $("#addCrawlerModal").modal("show");
            $btn.html($btn.data("original-text")).prop("disabled", false);
          },
          error: function(){
            toast(whale.i18n.getMessage("search"), whale.i18n.getMessage("page_not_found")); // "�???", "?? ?�이�?�? 찾을 ?? ?�습?�다"
            $btn.html($btn.data("original-text")).prop("disabled", false);
          }
      });

    });

    //#######################################################################################

    // ?�롤�? ?�정 모달
    // ?�수 �? �?�?
    $("#feedTitle, #linkSelector, #linkProp, #titleSelector, #titleProp").on("change", function(){
      var text = $(this).val();
      if(text){
        $(this).removeClass("is-invalid").addClass("is-valid");
      }else{
        $(this).removeClass("is-valid").addClass("is-invalid");
      }
    });

    // 미리보기 버튼
    $("#previewCrawlerBtn").on("click", function(){
      previewer();
    });

    // 미리보기 ?�릭 ?�팁
    $("#postPanel").tooltip({
        selector: '[data-toggle="tooltip"]',
        trigger: "click"
    });

    // ???? 버튼
    $("#saveCrawlerBtn").on("click", function(){
      var feedUrl = $("#webUrl").attr("href");
      var feedTitle = $("#feedTitle").val();
      var titleSelector = $("#titleSelector").val();
      var titleProp = $("#titleProp").val();
      var linkSelector = $("#linkSelector").val();
      var linkProp = $("#linkProp").val();
      var dateSelector = $("#dateSelector").val();
      var dateProp = $("#dateProp").val();
      var imageSelector = $("#imageSelector").val();
      var imageProp = $("#imageProp").val();
      var contentSelector = $("#contentSelector").val();
      var contentProp = $("#contentProp").val();

      if(feedUrl == ""){
        toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("input_crawler_url_msg")); // "????", "?�사?�트 주소�? ?�력?�세??"
        return;
      }
      if(feedTitle == ""){
        toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("no_title_data")); // "????", "???��? ?�보�? ?�습?�다"
        $("#feedTitle").focus();
        return;
      }
      if(titleSelector == ""){
        toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("input_selector_msg")); // "????", "???�터 ?�현?�을 ?�력?�주?�요"
        $("#titleSelector").focus();
        return;
      }
      if(titleProp == ""){
        toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("input_property_msg")); // "????", "?�로?�티명을 ?�력?�주?�요"
        $("#titleProp").focus();
        return;
      }
      if(linkSelector == ""){
        toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("input_selector_msg")); // "????", "???�터 ?�현?�을 ?�력?�주?�요"
        $("#linkSelector").focus();
        return;
      }
      if(linkProp == ""){
        toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("input_property_msg")); // "????", "?�로?�티명을 ?�력?�주?�요"
        $("#linkProp").focus();
        return;
      }

      var $btn = $(this);
      $btn.data("original-text", $btn.html()).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...').prop("disabled", true);

      var domain = extractHostname(feedUrl);
      var favicon = "http://www.google.com/s2/favicons?domain="+domain;
      var newFeed = {
          url: feedUrl,
          favicon: favicon,
          title: feedTitle,
          titleSelector: titleSelector,
          titleProp: titleProp,
          linkSelector: linkSelector,
          linkProp: linkProp,
          dateSelector: dateSelector,
          dateProp: dateProp,
          imageSelector: imageSelector,
          imageProp: imageProp,
          contentSelector: contentSelector,
          contentProp: contentProp
      };

      whale.storage.local.get("feeds", function(storage){
        var isNew = true;
        for(idx in storage.feeds){
          if(storage.feeds[idx].url == feedUrl){
            isNew = false;
            Object.assign(storage.feeds[idx], newFeed);
          }
        }
        if(isNew){
          storage.feeds.push(newFeed);
        }
        whale.storage.local.set(storage, function(){
          newFeed.regDate = Date.now();
          newFeed.locale = whale.i18n.getUILanguage();
          db.collection("feeds").insertOne(newFeed)
          .catch(err => console.error('Failed to insert item: '+err))
          .finally(() => {
            toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("save_complete")); // "????", "???? ?�었?�니??"
            $("#addCrawlerModal").modal("hide");
            init();
            $btn.html($btn.data("original-text")).prop("disabled", false);
          })
        });
      });

    });

    $("#crawlerListPanel, #crawlerRecentListPanel").on("click", "li", function(){
      var obj = {
        url: $(this).data("url"),
        title: $(this).data("title"),
        linkSelector: $(this).data("linkSelector"),
        linkProp: $(this).data("linkProp"),
        titleSelector: $(this).data("titleSelector"),
        titleProp: $(this).data("titleProp"),
        dateSelector: $(this).data("dateSelector"),
        dateProp: $(this).data("dateProp"),
        contentSelector: $(this).data("contentSelector"),
        contentProp: $(this).data("contentProp"),
        imageSelector: $(this).data("imageSelector"),
        imageProp: $(this).data("imageProp")
      };
      setCrawlerModal(obj);
      $("#addCrawlerModal").modal("show");

      $.ajax({
          url: obj.url,
          dataType: "arraybuffer",
          success: function(data, textStatus, request) {
            var contentType = request.getResponseHeader('content-type').toLowerCase();
            var charset;
            if(contentType.indexOf("charset") > -1){
              charset = contentType.split("charset=")[1];
            }
            if(charset == "ms949" || charset == "cp949"){
              charset = "euc-kr";
            }
            var dataView = new DataView(data);
            var docString = "";
            try{
              var decoder = new TextDecoder(charset);
              var decodedString = decoder.decode(dataView);
              docString = decodedString;
            }catch(e){
              var decoder = new TextDecoder();
              var decodedString = decoder.decode(dataView);
              docString = decodedString;
            }
            if(!charset){ // ?�더?? charset ?�보 ?�으�? html meta tag ?�인
              var charsetMatch = docString.match(/<meta[^>]*charset=[\"|\']([^\"]*)[\"|\'][^>]*>/i);
              if(charsetMatch){ // <meta charset="utf-8">
                charset = charsetMatch[1];
              }else{
                var contentTypeMatch = docString.match(/<meta[^>]*http-equiv=[\"|\']Content-Type[\"|\'][^>]*content=[\"]([^\"]*)[\"][^>]*>/i);
                if(contentTypeMatch){ // <meta http-equiv="Content-Type" content="text/html; charset=euc-kr">
                  charset = contentTypeMatch[1].split("charset=")[1];
                }
              }
              if(charset){
                try{
                  var decoder = new TextDecoder(charset);
                  var decodedString = decoder.decode(dataView);
                  docString = decodedString;
                }catch(e){
                  var decoder = new TextDecoder();
                  var decodedString = decoder.decode(dataView);
                  docString = decodedString;
                }
              }
            }
            $("#htmlText").val(docString.trim());
          }
      });

    });

    // 최근 ?�롤?? 조회
    $('#collapseRecentCrawler').on('show.bs.collapse', function () {
      var recentSearchLimit = localStorage.getItem("recentSearchLimit");
      if(recentSearchLimit){
        if(moment().format("YYYYMMDD") < recentSearchLimit){
          // toast(whale.i18n.getMessage("search"), whale.i18n.getMessage("search_limit_msg")); // "�???", "?�루?? ?�번�? 조회 �??�합?�다"
          // return;
        }
      }
      var $btn = $("#searchCrawlerBtn");
      $btn.data("original-text", $btn.html()).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...').prop("disabled", true);

      $("#crawlerRecentListPanel").children().remove();

      var locale = whale.i18n.getUILanguage();
      const pipeline = [
        {$match: {locale: locale}},
        {$sort: {regDate: -1}},
        {$group: {
           _id: "$url",
           url: {$first: "$url"},
           title: {$first: "$title"},
           linkSelector: {$first: "$linkSelector"},
           linkProp: {$first: "$linkProp"},
           titleSelector: {$first: "$titleSelector"},
           titleProp: {$first: "$titleProp"},
           dateSelector: {$first: "$dateSelector"},
           dateProp: {$first: "$dateProp"},
           contentSelector: {$first: "$contentSelector"},
           contentProp: {$first: "$contentProp"},
           imageSelector: {$first: "$imageSelector"},
           imageProp: {$first: "$imageProp"},
           regDate: {$first: "$regDate"}
        }},
        {$sort: {regDate: -1}},
        {$limit: 20}
      ];
      db.collection("feeds").aggregate(pipeline).toArray()
      .then(items => {
        for(var idx in items){
          var feed = items[idx];
          appendRecentCrawler(feed);
        }
        localStorage.setItem("recentSearchLimit", moment().add(1, "day").format("YYYYMMDD"));
      })
      .catch(err => {
        toast(whale.i18n.getMessage("search"), whale.i18n.getMessage("err_noti")); // "�???", "?�이?��? 찾을 ?? ?�습?�다"
      })
      .finally(() => {
        $btn.html($btn.data("original-text")).prop("disabled", false);
      });
    })

    // Export 버튼
    $("#exportFileBtn").on("click", function(){
      whale.storage.local.get("feeds", function(storage){
        var feeds = [];
        for(idx in storage.feeds){
          delete storage.feeds[idx].isError;
          feeds.push(storage.feeds[idx]);
        }
        var blob = new Blob([JSON.stringify(feeds)], {type: "application/json;charset=utf-8"});
        currentDate = moment().format("YYYYMMDDHHmm");
        saveAs(blob, "RSSnWebCrawlingReader-"+currentDate+".bak");
      });
    });

    // Import 버튼
		var file = document.querySelector('#importFile');
		file.onchange = function(event){
			attachments = [];
			var file     = event.target.files[0];
			var reader   = new FileReader();
			if(file){
				reader.readAsText(file);
        $(".custom-file-label[for=importFile]").text(file.name);
			}
			reader.onload = function () {
        var importJson = JSON.parse(reader.result);
        if(importJson){
          whale.storage.local.get("feeds", function(storage){
            for(var idx in importJson){
              var isNew = true;
              var newFeed = importJson[idx];
              for(var i in storage.feeds){
                if(storage.feeds[i].url == newFeed.url){
                  isNew = false;
                  Object.assign(storage.feeds[i], newFeed);
                  break;
                }
              }
              if(isNew){
                storage.feeds.push(newFeed);
              }
            }
            whale.storage.local.set(storage, function(){
              toast(whale.i18n.getMessage("save"), whale.i18n.getMessage("save_complete")); // "????", "???? ?�었?�니??"
              init();
            });
          });
        }
			}; // reader.onload
		}; // file.onchange

  }); // $(document).ready