'use strict';

// Copyright (c) 2017 Ruzu Studios. All rights reserved.

var not_list = [];
var qnum = 0;
var error_not;
var globalCard;


/*
 * Check if a notification is a valid Ruzu Anki pop-up question
 * Then pass the not_list value to the callback
 * Note that this does not consider error notifications as valid
 */
function validNotID(notifId, callback) {
  for (var i = 0; i < not_list.length; i++) {
    if (not_list[i].notID == notifId) {
      callback(not_list[i]);
      return;
    }
  }
  callback(null);
}

/*
 * Collect the next question and display a pop-up
 */
function popUpTest() {

  checkState(function(currentState) {
    console.log('window_state: ' + currentState.window_state);
    console.log('review_state: ' + currentState.review_state);

    //Pick up next card and show the question
    console.log('Get next card...');
    getNextCard(function(thisCard) {
      if (thisCard.success == 'true') {
        globalCard = thisCard; //For debug purposes only
        console.log('Card collected, now show question...');
        showQuestion(function(showQuestionResponse) {
          if (showQuestionResponse.success == 'true') {
            if (thisCard.ord == thisCard._fmap['Front'][1].ord) {
              var question = JSON.parse(thisCard.fields)[thisCard._fmap['Front'][0]];
            } else {
              var question = JSON.parse(thisCard.fields)[thisCard._fmap['Back'][0]];
            }

            var optionsType;
            var optionsTitle;

            if (true) {
              optionsType = 'basic';
              optionsTitle = question;
            } else if (false /*TODO - Add support for images*/ ) {
              optionsType = 'image';
              optionsTitle = 'Image';
            }

            //Prep notification details
            var options = {
              type: optionsType,
              title: optionsTitle,
              message: '',
              contextMessage: 'Click to show answer...',
              iconUrl: 'images/icon48.png',
              requireInteraction: true
            };
            //Must be done after the above
            if (optionsType == 'image') {
              options.imageUrl = question;
            }

            //Create notifications and add to array for tracking
            chrome.notifications.create('', options, function(id) {
              //Add notification to array
              not_list.push({
                notID: id,
                stage: 1
              });

              if (not_list.length > 1 /*TODO CONFIG VAR*/ ) {
                var removeNotID = not_list.shift().notID;
                //Clear overflow notification
                chrome.notifications.clear(removeNotID);
              }
            });
          } else {
            console.log('Issue showing question...');
            console.log(showQuestionResponse);
          }
        });
      } else {
        console.log('Issue getting the next card...');
        console.log(thisCard);
        errorNotifiction();
      }
    });
  });
}


function showAns(notifId) {
  getNextCard(function(thisCard) {
    if (thisCard.success == 'true' && thisCard.id == globalCard.id) {
      showAnswer(function(showAnswerResponse) {
        if (showAnswerResponse.success == 'true') {
          if (thisCard.ord == thisCard._fmap['Front'][1].ord) {
            var answer = JSON.parse(thisCard.fields)[thisCard._fmap['Back'][0]];
          } else {
            var answer = JSON.parse(thisCard.fields)[thisCard._fmap['Front'][0]];
          }

          if (thisCard.answerButtons.length == 1) {
            var cardButtons = [{
              title: thisCard.answerButtons[0][0] + ': ' + thisCard.answerButtons[0][1],
            }];
            var stages = 1;
          } else if (thisCard.answerButtons.length == 2) {
            var cardButtons = [{
              title: thisCard.answerButtons[0][0] + ': ' + thisCard.answerButtons[0][1],
            }, {
              title: thisCard.answerButtons[1][0] + ': ' + thisCard.answerButtons[1][1],
            }];
            var stages = 1;
          } else if (thisCard.answerButtons.length == 3) {
            var cardButtons = [{
              title: thisCard.answerButtons[0][0] + ': ' + thisCard.answerButtons[0][1],
            }, {
              title: thisCard.answerButtons[1][0] + ': ' + thisCard.answerButtons[1][1] + ' ' + spacer + ' ' + thisCard.answerButtons[2][0] + ': ' + thisCard.answerButtons[2][1],
            }];
            var stages = 2;
          } else if (thisCard.answerButtons.length == 4) {
            var cardButtons = [{
              title: thisCard.answerButtons[0][0] + ': ' + thisCard.answerButtons[0][1] + ' ' + spacer + ' ' + thisCard.answerButtons[1][0] + ': ' + thisCard.answerButtons[1][1],
            }, {
              title: thisCard.answerButtons[2][0] + ': ' + thisCard.answerButtons[2][1] + ' ' + spacer + ' ' + thisCard.answerButtons[3][0] + ': ' + thisCard.answerButtons[3][1],
            }];
            var stages = 2;
          } else {
            //Some error TODO
          }

          var options = {
            message: answer,
            contextMessage: '',
            buttons: cardButtons
          };

          chrome.notifications.update(notifId, options);

          //Mark notification as stage 1
          not_list.map(function(not) {
            if (not.notID == notifId) {
              not.answerButtons = thisCard.answerButtons;
              not.card_id = thisCard.id;
              not.stage = 1;
              not.stages = stages;
            }
          });
        } else {
          console.log('There was an error showing the answer...');
          errorNotifiction();
        }
      });
    } else {
      if (thisCard.id != globalCard.id) {
        console.log('Question expired, showing current question...');
        popUpTest();
      } else {
        console.log('There was an error showing the answer...');
        errorNotifiction();
      }
    }
  });
}

/*
 * Update buttons or answer card depending on notification stage
 */
function answerQuestion(validNot, btnIdx) {
  getNextCard(function(thisCard) {
    if (thisCard.success == 'true' && thisCard.id == validNot.card_id) {
      // Only 3 & 4 button notifications have validNot.stages == 2
      if (validNot.stage == 1 && validNot.stages == 2) {
        var update_notification = true;
        if (validNot.answerButtons.length == 3) {
          // 3 button notification update / send answer logic
          if (btnIdx == 0) {
            //First button is a single item so can be sent directly
            chrome.notifications.clear(validNot.notID);
            console.log('Send answer - ' + thisCard.answerButtons[0][0] + ': ' + thisCard.answerButtons[0][1]);
            sendAnswer(thisCard.id, thisCard.answerButtons[0][0]);
            update_notification = false;
          } else {
            //Second button requires update before being sent
            var options = {
              buttons: [{
                title: thisCard.answerButtons[1][0] + ': ' + thisCard.answerButtons[1][1],
              }, {
                title: thisCard.answerButtons[2][0] + ': ' + thisCard.answerButtons[2][1],
              }]
            };
          }
        } else {
          // 4 button notification update logic
          if (btnIdx == 0) {
            var options = {
              buttons: [{
                title: thisCard.answerButtons[0][0] + ': ' + thisCard.answerButtons[0][1],
              }, {
                title: thisCard.answerButtons[1][0] + ': ' + thisCard.answerButtons[1][1],
              }]
            };
          } else {
            var options = {
              buttons: [{
                title: thisCard.answerButtons[2][0] + ': ' + thisCard.answerButtons[2][1],
              }, {
                title: thisCard.answerButtons[3][0] + ': ' + thisCard.answerButtons[3][1],
              }]
            };
          }
        }

        if (update_notification) {
          chrome.notifications.update(validNot.notID, options);
          //Mark notification as stage 2
          not_list.map(function(not) {
            if (not.notID == validNot.notID) {
              not.stage = 2;
              not.first_ans = btnIdx;
            }
          });
        }
      } else {
        //Logic for 1 / 2 answer cards & already updated 3 / 4 answer cards
        chrome.notifications.clear(validNot.notID);

        if (validNot.stages == 2) {
          // 3 / 4 answer card logic
          if (validNot.answerButtons.length == 3) {
            if (validNot.first_ans != 0) {
              if (btnIdx == 0) {
                console.log('Send answer - ' + thisCard.answerButtons[1][0] + ': ' + thisCard.answerButtons[1][1]);
                sendAnswer(thisCard.id, thisCard.answerButtons[1][0]);
              } else {
                console.log('Send answer - ' + thisCard.answerButtons[2][0] + ': ' + thisCard.answerButtons[2][1]);
                sendAnswer(thisCard.id, thisCard.answerButtons[2][0]);
              }
            } else {
              /*
               * This code should never be called as validNot.first_ans
               * should always be '1' for 3 answer cards
               */
              console.log('Error: answer should have already been sent...');
              errorNotifiction('internal_error');
            }
          } else {
            if (validNot.first_ans == 0) {
              if (btnIdx == 0) {
                console.log('Send answer - ' + thisCard.answerButtons[0][0] + ': ' + thisCard.answerButtons[0][1]);
                sendAnswer(thisCard.id, thisCard.answerButtons[0][0]);
              } else {
                console.log('Send answer - ' + thisCard.answerButtons[1][0] + ': ' + thisCard.answerButtons[1][1]);
                sendAnswer(thisCard.id, thisCard.answerButtons[1][0]);
              }
            } else {
              if (btnIdx == 0) {
                console.log('Send answer - ' + thisCard.answerButtons[2][0] + ': ' + thisCard.answerButtons[2][1]);
                sendAnswer(thisCard.id, thisCard.answerButtons[2][0]);
              } else {
                console.log('Send answer - ' + thisCard.answerButtons[3][0] + ': ' + thisCard.answerButtons[3][1]);
                sendAnswer(thisCard.id, thisCard.answerButtons[3][0]);
              }
            }
          }
        } else {
          // 1 / 2 answer card logic
          if (btnIdx == 0) {
            console.log('Send answer - ' + thisCard.answerButtons[0][0] + ': ' + thisCard.answerButtons[0][1]);
            sendAnswer(thisCard.id, thisCard.answerButtons[0][0]);
          } else {
            console.log('Send answer - ' + thisCard.answerButtons[1][0] + ': ' + thisCard.answerButtons[1][1]);
            sendAnswer(thisCard.id, thisCard.answerButtons[1][0]);
          }
        }
      }
    } else {
      console.log('Card on notification has expired...');
      console.log(thisCard.id + ' != ' + validNot.card_id);
      popUpTest();
    }
  });
}

function sendAnswer(card_id, ans_ease) {
  answerCard(card_id, ans_ease, function(ansResp) {
    console.log(ansResp);
  });
}


function setIconStatus(status) {

  var badgeBackgroundColor, badgeText;

  switch (status) {
    case 'On':
      badgeBackgroundColor = '#5cb85c';
      badgeText = status;
      break;
    case 'Error':
      badgeBackgroundColor = '#ff033e';
      badgeText = status;
      break;
    case 'Off':
      badgeBackgroundColor = '#1e90ff';
      badgeText = status;
      break;
    default:
      badgeText = '';
  }

  if (badgeBackgroundColor) {
    chrome.browserAction.setBadgeBackgroundColor({
      color: badgeBackgroundColor
    });
  }
  chrome.browserAction.setBadgeText({
    text: badgeText
  });

}

function errorNotifiction(error_type) {
  clearNotifications();
  setIconStatus('Error');
  var iconUrl = 'images/error_temp.png';
  switch (error_type) {
    case 'connection_issue':
      var options = {
        type: 'basic',
        title: 'Error!',
        message: 'There was an issue connecting to Anki',
        contextMessage: 'Start Anki and click to try again.',
        iconUrl: iconUrl,
        isClickable: true,
        requireInteraction: true,
        buttons: [{
          title: 'Options',
        }]
      };
      break;
    case 'no_results':
      var options = {
        type: 'basic',
        title: 'Attention!',
        message: 'No questions to review.',
        contextMessage: 'Select other course or wait until later.',
        iconUrl: 'images/icon48.png',
        isClickable: true,
        requireInteraction: true,
        buttons: [{
          title: 'Options',
        }]
      };
      break;
    case 'internal_error':
      var options = {
        type: 'basic',
        title: 'Error!',
        message: 'Internal Error.',
        contextMessage: 'Sorry, there was an internal issue.',
        iconUrl: 'images/icon48.png',
        isClickable: true,
        requireInteraction: true
      };
      break;
    default:
      var options = {
        type: 'basic',
        title: 'Error!',
        message: 'There was an issue connecting to Anki',
        contextMessage: 'Start Anki and click to try again.',
        iconUrl: iconUrl,
        isClickable: true,
        requireInteraction: true,
        buttons: [{
          title: 'Options',
        }, {
          title: 'Try Again',
        }]
      };
  }

  chrome.notifications.create('', options, function(id) {
    //Clear old error notification
    if (error_not) {
      chrome.notifications.clear(error_not);
    }
    //Record new error notification
    error_not = id;
  });

}

/*
 * Clear current on-screen notifications
 */
function clearNotifications() {
  for (var i = 0; i < not_list.length; i++) {
    chrome.notifications.clear(not_list[i].notID);
  }
}

/*
 * Derive whether Alarm is set + user settings
 * to callback for alarm refresh / initial set up [initialSetUp()]
 */
function checkAlarm(alarmName, callback) {

  clearNotifications();

  chrome.alarms.getAll(function(alarms) {
    var hasAlarm = alarms.some(function(a) {
      return a.name == alarmName;
    });
    chrome.storage.sync.get({
      frequency: defaultFrequency,
      enabled: defaultEnabled,
    }, function(settings) {
      callback(settings.enabled, hasAlarm);
    });
  });

}

function cancelAlarm(alarmName) {
  setIconStatus('Off');
  chrome.alarms.clear(alarmName);
}

/*
 * Create alarm, only when settings are enabled
 */
function createAlarm(alarmName) {
  chrome.storage.sync.get({
    frequency: defaultFrequency,
    enabled: defaultEnabled
  }, function(settings) {
    if (settings.enabled) {
      setIconStatus('On');
      var alarmOptions = {
        delayInMinutes: Number(settings.frequency),
        periodInMinutes: Number(settings.frequency)
      }
      console.log('Creating alarm with the following settings:');
      console.log(alarmOptions);
      chrome.alarms.create(alarmName, alarmOptions);
    } else {
      setIconStatus('Off');
      cancelAlarm(alarmName);
      console.log('Alarm cancelled / not created due to enabled flag being false.');
    }
  });
}

/*
 * Used for initial setup of alarm
 * and refresh of alarm when settings have changed
 */
function initialSetUp(enabled, alarmExists) {
  if (alarmExists) {
    if (enabled) {
      console.log('Alarm already exists, resetting alarm.');
      cancelAlarm(alarmName);
      createAlarm(alarmName);
    } else {
      console.log('Ruzu Anki pop-ups disabled, disabling alarm.');
      cancelAlarm(alarmName);
    }
  } else {
    if (enabled) {
      console.log('Alarm does not exist, creating alarm...');
      createAlarm(alarmName);
    } else {
      setIconStatus('Off');
      console.log('Ruzu Anki pop-ups disabled, no need to create alarm.');
    }
  }
}

/*
 * Show next pop-up, suppress questions when settings are disabled and
 * pull more questions if all local questions have been displayed already
 */
function showNextQuestion() {
  chrome.storage.sync.get({
    enabled: defaultEnabled,
  }, function(settings) {
    if (settings.enabled) {
      popUpTest();
    } else {
      console.log('Cannot show next question when app disabled. Please enable in options page.');
    }
  });
}

function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
}

/*
 * Respond to the user's clicking one of the buttons
 */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
  validNotID(notifId, function(validNot) {
    if (validNot) {
      answerQuestion(validNot, btnIdx);
    } else if (notifId == error_not) {
      if (btnIdx === 0) {
        openOptions();
      } else if (btnIdx === 1) {
        chrome.notifications.clear(notifId);
        checkAlarm(alarmName, initialSetUp);
        popUpTest();
      }
    } else {
      console.error('Error: Something went wrong when dealing with this notification.');
    }
  });
});

/*
 * onClicked listener, handles error notification removal
 * and stage 2 revertQuestion function
 */
chrome.notifications.onClicked.addListener(function(notifId) {
  validNotID(notifId, function(validNot) {
    if (notifId == error_not) {
      checkAlarm(alarmName, initialSetUp);
    } else if (validNot && validNot.stage == 1) {
      //Do not clear valid questions on click
      showAns(notifId);
    } else if (validNot && validNot.stage == 2) {
      //Revert stage 2 questions
      showAns(notifId); //This will re-display original buttons...
    } else {
      chrome.notifications.clear(notifId);
    }
  });
});

/*
 * Command listener for keyboard shortcuts
 */
chrome.commands.onCommand.addListener(function(command) {
  if (command == 'ruzu-toggle-enabled') {
    chrome.storage.sync.get({
      enabled: defaultEnabled
    }, function(items) {
      chrome.storage.sync.set({
        enabled: !items.enabled
      });
    });
  } else if (command == 'ruzu-show-next-question') {
    showNextQuestion();
  }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  console.log('Alarm elapsed:', alarm);
  if (alarm.name == alarmName) {
    chrome.storage.sync.get({
      frequency: defaultFrequency,
    }, function(settings) {
      var secs = (settings.frequency * 2) * 60
      chrome.idle.queryState(secs, function(state) {
        if (state == 'active') {
          showNextQuestion();
        } else {
          console.log('Question suppressed as PC is ' + state);
        }
      });
    });
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];
    // console.log('Storage key ' + key + ' in namespace ' + namespace + ' changed. ' +
    //   'Old value was ' + storageChange.oldValue + ', new value is ' + storageChange.newValue + '.');
    if ((key == 'enabled' || key == 'frequency' || key == 'courseID') && storageChange.oldValue != storageChange.newValue) {
      console.log('Reset Alarm...');
      checkAlarm(alarmName, initialSetUp);
      break;
    } else {
      //Update badge on save
      setIconStatus('On');
    }
  }
});

/*
 * Handle messages from options page etc
 */
chrome.runtime.onMessage.addListener(function(request) {
  if (request && (request.id == 'refresh')) {
    checkAlarm(alarmName, initialSetUp);
  } else if (request && (request.id == 'showNextQuestion')) {
    showNextQuestion();
  } else if (request && (request.id == 'setIconStatus')) {
    setIconStatus(request.value);
  }
});

checkAlarm(alarmName, initialSetUp);
