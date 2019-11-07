// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// First check to see if this document is a feed. If so, it will redirect.
// Otherwise, check if it has embedded feed links, such as:
// (<link rel="alternate" type="application/rss+xml" etc). If so, show the
// page action icon.

function containsFeed(doc) {
    // Find all the RSS link elements.
    var result = doc.evaluate(
        '//*[local-name()="rss" or local-name()="feed" or local-name()="RDF"]',
        doc, null, 0, null);
    if (!result) {
      return false;  // This is probably overly defensive, but whatever.
    }
    var node = result.iterateNext();
    if (!node) {
      return false;  // No RSS tags were found.
    }
    // The feed for arab dash jokes dot net, for example, contains
    // a feed that is a child of the body tag so we continue only if the
    // node contains no parent or if the parent is the body tag.
    if (node.parentElement && node.parentElement.tagName != "BODY") {
      return false;
    }
    return true;
  }
  
  // See if the document contains a <link> tag within the <head> and
  // whether that points to an RSS feed.
  function findFeedLinks(doc) {
    // Find all the RSS link elements.
    var result = doc.evaluate(
        '//*[local-name()="link"][contains(@rel, "alternate")] ' +
        '[contains(@type, "rss") or contains(@type, "atom") or ' +
        'contains(@type, "rdf")]', doc, null, 0, null);
    var feeds = [];
    var item;
    while (item = result.iterateNext()) {
      feeds.push({"url": item.href, "title": item.title});
    }
    return feeds;
  }
  // Check to see if the current document is a feed delivered as plain text,
  // which Chrome does for some mime types, or a feed wrapped in an html.
  function isFeedDocument() {
    var body = document.body;
    var soleTagInBody = "";
    if (body && body.childElementCount == 1) {
      soleTagInBody = body.children[0].tagName;
    }
    // Some feeds show up as feed tags within the BODY tag, for example some
    // ComputerWorld feeds. We cannot check for this at document_start since
    // the body tag hasn't been defined at that time (contains only HTML element
    // with no children).
    if (soleTagInBody == "RSS" || soleTagInBody == "FEED" ||
        soleTagInBody == "RDF") {
      return true;
    }
    // Chrome renders some content types like application/rss+xml and
    // application/atom+xml as text/plain, resulting in a body tag with one
    // PRE child containing the XML. So, we attempt to parse it as XML and look
    // for RSS tags within.
    if (soleTagInBody == "PRE") {
      var domParser = new DOMParser();
      var doc = domParser.parseFromString(body.textContent, "text/xml");
      // |doc| now contains the parsed document within the PRE tag.
      if (containsFeed(doc)) {
        // Let the extension know that we should show the subscribe page.
        return true;
      }
    }
    return false;
  }