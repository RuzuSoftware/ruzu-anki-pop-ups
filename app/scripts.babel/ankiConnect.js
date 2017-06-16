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

function checkVersion(callback) {
  ankiInvoke('version').then(response => {
    if (callback) {
      callback({
        success: true,
        version: response
      });
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: false,
        message: error
      });
    }
  });
}

function getNextCard(callback) {
  ankiInvoke('guiGetNextCard').then(response => {
    if (callback) {
      callback(response);
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: false,
        message: error
      });
    }
  });
}

function showQuestion(callback) {
  ankiInvoke('guiShowQuestion').then(response => {
    if (callback) {
      callback(response);
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: false,
        message: error
      });
    }
  });
}

function showAnswer(callback) {
  ankiInvoke('guiShowAnswer').then(response => {
    if (callback) {
      callback(response);
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: false,
        message: error
      });
    }
  });
}

function answerCard(card_id, ans_ease, callback) {
  ankiInvoke('guiAnswerCard', {
    id: card_id,
    ease: ans_ease
  }).then(response => {
    if (callback) {
      callback(response);
    }
  }).catch(error => {
    console.log(`Error: ${error}`);
    if (callback) {
      callback({
        success: false,
        message: error
      });
    }
  });
}
