whale.runtime.onMessage.addListener(function(request, sender) {
    if (request.msg == "refreshStart") {
      $("#listLoading, #newLoading, #starLoading").show();
    } else if (request.msg == "noPosts") {
      $("#listLoading, #newLoading, #starLoading").hide();
    } else if (request.msg == "newPosts") {
      toast(whale.i18n.getMessage("new_post"), whale.i18n.getMessage("add_new_post")); // �� 寃뚯떆湲� / �� 湲��� 異붽� �섏뿀�듬땲��
      refresh();
    } else if (request.msg == "setRead") {
      $(".new-count-badge").text(request.badgeCnt);
      $('#postListPanel li button[data-url="' + request.link + '"]').remove();
      $('#postStarPanel li button[data-url="' + request.link + '"]').remove();
      $('#postNewPanel li[data-url="' + request.link + '"]').remove();
      if (request.badgeCnt == 0) {
        $("#newNotFound").show();
      }
    } else if (request.msg == "setStarred") {
      refresh();
    } else if (request.msg == "refresh") {
      refresh();
    }
  });
  
  function toast(title, message) {
    var toastTag = "";
    toastTag += '<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="true" data-delay="1000">';
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
    $toast.on('hidden.bs.toast', function() {
      $toast.remove();
    })
    $toast.toast("show");
  }
  
  function getPosts(callback) {
    whale.storage.local.get(["postGroup"], function(result) {
      callback(result.postGroup);
    });
  }
  
  function sortingPosts(postGroup, callback) {
    whale.storage.local.get(["newPostLinks"], function(storage) {
      var postList = [];
      for (var feedUrl in postGroup) {
        var posts = postGroup[feedUrl];
        for (var link in posts) {
          var post = posts[link];
          var isNew = false;
          var isStarred = false;
          if (storage.newPostLinks[link]) {
            isNew = true;
          }
          post.isNew = isNew;
          if (feedUrl == "starred") {
            isStarred = true;
          }
          post.isStarred = isStarred;
          postList.push(post);
        }
      }
      callback(sortPosts(postList));
    });
  }
  
  function appendPosts(posts, callback) {
    var promise = Promise.resolve();
    $postList = $(document.createDocumentFragment());
    $postNew = $(document.createDocumentFragment());
    $postStar = $(document.createDocumentFragment());
    posts.forEach(function(post, i) {
      promise = promise.then(function() {
        return new Promise(function(resolve) {
          appendPost($postList, post);
  
          if (post.isNew) {
            appendPost($postNew, post);
          }
          if (post.isStarred) {
            appendPost($postStar, post);
          }
  
          resolve();
        });
      });
    });
    promise.then(function() {
      $("#postListPanel").append($postList);
      $("#postNewPanel").append($postNew);
      $("#postStarPanel").append($postStar);
  
      $("#listNotFound, #newNotFound, #starNotFound").hide();
      if ($("#postListPanel li").length == 0) {
        $("#listNotFound").show();
      }
      if ($("#postStarPanel li").length == 0) {
        $("#starNotFound").show();
      }
      if ($("#postNewPanel li").length == 0) {
        $("#newNotFound").show();
      }
      $(".new-count-badge").text($("#postNewPanel li").length);
  
      $("#listLoading, #newLoading, #starLoading").hide();
      callback();
    });
  }
  
  function appendPost(selector, post) {
    var postTag = "";
    postTag += '<li class="list-group-item list-group-item-action p-2 postRow">';
    postTag += '  <div class="d-flex">';
    if (post.image) {
      postTag += '    <div class="thumbnail-wrapper mr-2 my-auto"><img src="" class="img-thumbnail" /></div>';
    }
    postTag += '    <div class="w-100">';
    postTag += '      <div class="d-flex">';
    postTag += '        <span class="mb-1 w-100 text-break dynamic-title-text"></span>';
    postTag += '        <div class="text-nowrap px-1" name="btnDiv">';
    if (post.isStarred) {
      postTag += '          <span name="star" style="cursor: pointer;"><i class="fas fa-star text-primary"></i></span>';
    }
    if (post.isNew) {
      postTag += '          <button type="button" name="new" class="btn btn-primary btn-xsm text-nowrap">NEW</button>';
    }
    postTag += '        </div>';
    postTag += '      </div>';
    postTag += '      <p class="mb-1"><small class="text-break dynamic-content-text"></small></p>';
    postTag += '      <small class="text-muted dynamic-date-text"></small>';
    postTag += '    </div>';
    postTag += '  </div>';
    postTag += '</li>';
  
    $postTag = $(postTag);
  
    $postTag.attr("data-url", post.link);
    $postTag.attr("data-feed-url", post.feedUrl);
    $postTag.attr("data-title", post.title);
    $postTag.attr("data-content", post.contentSnippet);
    $postTag.attr("data-feed-title", post.feedTitle);
    $postTag.find("img").attr("src", post.image).on("error", function() {
      $(this).hide();
    });
    $postTag.find("button[name=new]").attr("data-url", post.link);
    $postTag.find("span[name=star]").attr("data-url", post.link);
    $postTag.find("span[name=star]").attr("data-feed-url", post.feedUrl);
    $postTag.find(".dynamic-title-text").text(post.title);
    $postTag.find(".dynamic-content-text").text(post.contentSnippet);
    $favicon = $("<img>").attr("src", post.feedFavicon).css("margin-top", "-2px");
    $feedName = $("<span>").addClass("mx-1").text(post.feedTitle);
    $pubDate = $("<span>").addClass("mx-1 unix-date").attr("data-unix-date", post.unixDate).text(moment.unix(post.unixDate).fromNow());
    $postTag.find(".dynamic-date-text").append($favicon).append($feedName).append($pubDate);
  
    $(selector).append($postTag);
  }
  
  // 湲� 媛��몄삤湲�
  function refresh() {
    $("#listLoading, #newLoading, #starLoading").show();
    $("div[name=searchInfo]").remove();
    $("#postListPanel, #postNewPanel, #postStarPanel").children().remove();
    getPosts(function(posts) {
      sortingPosts(posts, function(sortedPosts) {
        appendPosts(sortedPosts, function() {
  
        });
      });
    });
  }
  
  function updateDate() {
    $(".unix-date").each(function() {
      var $this = $(this);
      var unixDate = $this.data("unixDate");
      $this.text(moment.unix(unixDate).fromNow());
    });
    setTimeout(function() {
      updateDate();
    }, 1000 * 60);
  }
  
  $(document).ready(function() {
    moment.locale("ko");
    updateDate();
  
    // �쇰뱶 異붽� 踰꾪듉 click
    $("#feedListPanel").on("click", "button", function() {
      var $btn = $(this);
      var url = $btn.data("url");
      var title = $btn.data("title");
      var favicon = $btn.data("favicon");
      var newFeed = {
        "url": url,
        "favicon": favicon,
        "title": title
      };
      isNewFeed(url, function(isNew, feeds) {
        if (isNew) {
          feeds.push(newFeed);
          whale.storage.local.set({
            "feeds": feeds
          }, function() {
            toast(whale.i18n.getMessage("add_feed"), whale.i18n.getMessage("add_new_feed")); // �쇰뱶 異붽� / �� �쇰뱶媛� 異붽� �섏뿀�듬땲��
            $btn.remove();
          });
        } else {
          toast(whale.i18n.getMessage("add_feed"), whale.i18n.getMessage("exist_feed")); // �쇰뱶 異붽� / �대� �깅줉�� �쇰뱶�낅땲��
          $btn.remove();
        }
  
      });
    });
  
    // �� �꾩슱 ��
    $('.nav-link').on('shown.bs.tab', function(e) {
      var $activeTab = $(".tab-pane.active");
      $activeTab.find("div[name=searchInfo]").remove();
      $activeTab.find("li.list-group-item:hidden").show();
    })
  
    // �곷떒 �곗륫 �ㅼ젙 踰꾪듉
    $("button[name=settings]").on("click", function() {
      whale.tabs.create({
        "url": "/options.html"
      });
    });
  
    // �곷떒 �곗륫 �쇰뱶 異붽� 踰꾪듉
    $("button[name=addFeed]").on("click", function() {
      whale.tabs.create({
        "url": "/options.html#nav-feeds"
      });
    });
  
    // 湲� 由ъ뒪�� �대┃
    $("#postListPanel, #postNewPanel, #postStarPanel").on("click", "li", function() {
      var link = $(this).data("url");
  
      whale.storage.local.get(["newPostLinks"], function(storage) {
        if (storage.newPostLinks[link]) {
          delete storage.newPostLinks[link];
          whale.storage.local.set(storage, function() {
            var badgeCnt = Object.keys(storage.newPostLinks).length;
            $(".new-count-badge").text(badgeCnt);
            whale.sidebarAction.setBadgeText({
              text: badgeCnt.toString()
            });
            $('#postListPanel li button[data-url="' + link + '"]').remove();
            $('#postStarPanel li button[data-url="' + link + '"]').remove();
            $('#postNewPanel li[data-url="' + link + '"]').remove();
            if (badgeCnt == 0) {
              $("#newNotFound").show();
            }
            whale.tabs.create({
              url: link
            });
          });
        } else {
          whale.tabs.create({
            url: link
          });
        }
      });
    });
  
    // 由ъ뒪�� new 踰꾪듉 �대┃
    $("#postListPanel, #postNewPanel, #postStarPanel").on("click", "li button[name=new]", function(event) {
      event.stopPropagation();
      menu.close();
      if ($("#listLoading, #newLoading, #starLoading").filter(":visible").length > 0) {
        return;
      }
      $this = $(this);
      var link = $(this).data("url");
      whale.storage.local.get(["newPostLinks"], function(storage) {
        delete storage.newPostLinks[link];
        whale.storage.local.set(storage, function() {
          var badgeCnt = Object.keys(storage.newPostLinks).length;
          $(".new-count-badge").text(badgeCnt);
          whale.sidebarAction.setBadgeText({
            text: badgeCnt.toString()
          });
          $('#postListPanel li button[data-url="' + link + '"]').remove();
          $('#postStarPanel li button[data-url="' + link + '"]').remove();
          $('#postNewPanel li[data-url="' + link + '"]').remove();
          if (badgeCnt == 0) {
            $("#newNotFound").show();
          }
        });
      });
    });
  
    // 由ъ뒪�� 蹂� 踰꾪듉 �대┃
    $("#postListPanel, #postNewPanel, #postStarPanel").on("click", "li span[name=star]", function(event) {
      event.stopPropagation();
      menu.close();
      if ($("#listLoading, #newLoading, #starLoading").filter(":visible").length > 0) {
        return;
      }
      $this = $(this);
      var url = $(this).data("url");
      whale.storage.local.get(["postGroup"], function(storage) {
        if (storage.postGroup.starred[url]) {
          var orgFeedUrl = storage.postGroup.starred[url].feedUrl;
          if (storage.postGroup[orgFeedUrl]) {
            storage.postGroup[orgFeedUrl][url] = storage.postGroup.starred[url];
          }
          delete storage.postGroup.starred[url];
          whale.storage.local.set(storage, function() {
            $('#postListPanel li span[name=star][data-url="' + url + '"]').remove();
            $('#postNewPanel li span[name=star][data-url="' + url + '"]').remove();
            $('#postStarPanel li[data-url="' + url + '"]').remove();
            if ($('#postStarPanel li').length == 0) {
              $("#starNotFound").show();
            }
          });
        }
      });
    });
  
    // 由ъ뒪�� �고겢由� 硫붾돱
    var menu = new BootstrapMenu('.postRow', {
      fetchElementData: function($rowElem) {
        return {
          url: $rowElem.data('url'),
          feedUrl: $rowElem.data('feedUrl')
        };
      },
      actions: [{
        name: whale.i18n.getMessage("mark_all_read"), // '�꾩껜 �쎌쓬 �쒖떆�섍린'
        iconClass: 'fa-check',
        onClick: function() {
          if ($("#listLoading, #newLoading, #starLoading").filter(":visible").length > 0) {
            return;
          }
          whale.storage.local.set({
            newPostLinks: {}
          });
          $("li button[name=new]").remove();
          $("#postNewPanel li").remove();
          $(".new-count-badge").text("0");
          whale.sidebarAction.setBadgeText({
            text: "0"
          });
          $("#newNotFound").show();
        }
      }, {
        name: whale.i18n.getMessage("mark_starred"), // '蹂� �쒖떆�섍린'
        iconClass: 'fa-star',
        onClick: function(data) {
          if ($("#listLoading, #newLoading, #starLoading").filter(":visible").length > 0) {
            return;
          }
          whale.storage.local.get(["postGroup"], function(storage) {
            if (storage.postGroup[data.feedUrl][data.url]) {
              storage.postGroup.starred[data.url] = storage.postGroup[data.feedUrl][data.url];
              delete storage.postGroup[data.feedUrl][data.url];
              whale.storage.local.set(storage, function() {
                refresh();
              });
            }
          });
        },
        isEnabled: function(data) {
          if ($('li[data-url="' + data.url + '"] span[name=star]').length) {
            return false;
          }
          return true;
        }
      }]
    });
  
    $("#pills-tabContent").scroll(function(event) {
      menu.close();
    });
  
    // �뗫낫湲� 踰꾪듉
    $("#searchDropDown").on('click', function() {
      if ($("#searchForm").is(":visible")) {
        $("#searchForm").hide();
      } else { // 寃��됱갹 �꾩슫 ��
        $("#searchForm").show();
        $("#searchText").focus();
      }
    })
  
    // 寃��됱뼱 �낅젰 �� �뷀꽣
    $("#searchForm").on("submit", function() {
      $("#searchBtn").trigger("click");
      return false;
    });
  
    // 寃��� 踰꾪듉
    $("#searchBtn").on("click", function() {
      if ($("#listLoading, #newLoading, #starLoading").filter(":visible").length > 0) {
        return;
      }
      var $activeTab = $(".tab-pane.active");
      $activeTab.find("div[name=searchInfo]").remove();
      $activeTab.find("li.list-group-item:hidden").show();
      var searchText = $("#searchText").val();
      if (searchText == "") {
  
      } else {
        $activeTab.find("li.list-group-item").each(function() {
          var title = $(this).data("title");
          var content = $(this).data("content");
          var feedTitle = $(this).data("feedTitle");
          var isExist = false;
          if (title.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
            isExist = true;
          }
          if (content.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
            isExist = true;
          }
          if (feedTitle.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
            isExist = true;
          }
          if (isExist) {
            $(this).show();
          } else {
            $(this).hide();
          }
        });
        if ($activeTab.find("li.list-group-item:visible").length == 0) {
          toast(whale.i18n.getMessage("search"), whale.i18n.getMessage("no_result")); // "寃���", "寃��됰맂 �댁슜�� �놁뒿�덈떎"
          $activeTab.find("li.list-group-item").show();
        } else {
          $searchInfo = $('<div class="card sticky-top text-center text-primary" name="searchInfo"></div>').text('"' + searchText + '" ' + whale.i18n.getMessage("search_result"));
          $activeTab.prepend($searchInfo);
        }
      }
      $("#searchForm").hide();
      $("#searchText").val("");
    });
  
    refresh();
  }); // $(document).ready