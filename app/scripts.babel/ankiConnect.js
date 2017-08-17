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

function deckNames(callback) {
  ankiInvoke('deckNames').then(response => {
    if (callback) {
      callback({
        success: true,
        deckNames: response
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

function deckReview(deckName, callback) {
  ankiInvoke('guiDeckReview', {
    name: deckName,
  }).then(response => {
    if (response == true) {
      callback({
        success: response
      });
    } else {
      callback({
        success: false,
        message: response
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
  ankiInvoke('guiCurrentCard').then(response => {
    if (response) {
      var buttonLength = response.buttons.length;
      response['answerButtons'] = response.buttons.map(function(idx) {
        var label;
        switch (idx) {
          case 1:
            label = 'Again';
            break;
          case 2:
            label = (buttonLength == 4 ? 'Hard' : 'Good');
            break;
          case 3:
            label = (buttonLength == 4 ? 'Good' : 'Easy');
            break;
          case 4:
            label = 'Easy';
            break;
          default:
            label = 'Other';
        }
        return [idx, label];
      });
      if (callback) {
        callback(response);
      }
    } else {
      if (callback) {
        callback(response);
      }
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

function startCardTimer(callback) {
  ankiInvoke('guiStartCardTimer').then(response => {
    if (callback) {
      if (response) {
        callback({
          success: response
        });
      } else {
        callback({
          success: false
        });
      }
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
      if (response == true) {
        callback({
          success: response
        });
      } else {
        callback(response);
      }
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
      if (response == true) {
        callback({
          success: response
        });
      } else {
        callback(response);
      }
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

function answerCard(ans_ease, callback) {
  ankiInvoke('guiAnswerCard', {
    ease: ans_ease
  }).then(response => {
    callback({
      success: response
    });
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
