'use strict';

chrome.runtime.onInstalled.addListener(function(object) {
  if (object.reason == 'install') {
    chrome.tabs.create({
      url: 'welcome.html'
    });
  } else if (object.reason == 'update') {
    chrome.tabs.create({
      url: 'whatsnew.html'
    });
  }
});
