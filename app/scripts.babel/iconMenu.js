'use strict';

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
  title: 'Help',
  contexts: ['browser_action'],
  onclick: function() {
    chrome.tabs.create({
      url: 'welcome.html'
    });
  }
});

chrome.contextMenus.create({
  title: 'Support us',
  contexts: ['browser_action'],
  onclick: function() {
    chrome.tabs.create({
      url: 'support.html'
    });
  }
});

chrome.contextMenus.create({
  title: 'Version history',
  contexts: ['browser_action'],
  onclick: function() {
    chrome.tabs.create({
      url: 'whatsnew.html'
    });
  }
});
