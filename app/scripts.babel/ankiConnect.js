'use strict';

function ankiInvoke(action, params = {}) {
  console.log(action + ' called...');
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('loadend', () => {
      if (xhr.responseText) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject('Unable to connect to Anki');
      }
    });

    xhr.open('POST', 'http://localhost:8765');
    xhr.send(JSON.stringify({
      action,
      params
    }));
  });
}

function checkState(callback) {
  ankiInvoke('checkState').then(response => {
    if (callback) {
      callback(JSON.parse(response));
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: 'false',
        message: error
      });
    }
  });
}

function getNextCard(callback) {
  ankiInvoke('getNextCard').then(response => {
    if (callback) {
      callback(JSON.parse(response));
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: 'false',
        message: error
      });
    }
  });
}

function showQuestion(callback) {
  ankiInvoke('showQuestion').then(response => {
    if (callback) {
      callback(JSON.parse(response));
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: 'false',
        message: error
      });
    }
  });
}

function showAnswer(callback) {
  ankiInvoke('showAnswer').then(response => {
    if (callback) {
      callback(JSON.parse(response));
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: 'false',
        message: error
      });
    }
  });
}
