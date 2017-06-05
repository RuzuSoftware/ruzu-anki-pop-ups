'use strict';

// Saves options to chrome.storage.sync.
function save_options() {
  var frequencyVal = document.getElementById('frequency').value;
  var test_amtVal = document.getElementById('test_amt').value;
  var enabledVal = document.getElementById('enabled').checked;
  var syncVal = document.getElementById('sync').checked;
  chrome.storage.sync.set({
    frequency: frequencyVal,
    test_amt: test_amtVal,
    enabled: enabledVal,
    sync: syncVal
  }, function() {
    // Show message to let user know options were saved.
    showMessage('Options saved.');
    restore_options();
  });
}

function connectToAnki(callback) {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:8765', true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      console.log(xhr.responseText);
      if (xhr.responseText) {
        if (callback) {
          callback(true);
        }
      } else {
        if (callback) {
          callback(false);
        }
      }
    }
  }
  xhr.send();
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default values if not set
  chrome.storage.sync.get({
    frequency: defaultFrequency,
    test_amt: defaultTest_amt,
    enabled: defaultEnabled,
    sync: defaultSync
  }, function(items) {

    connectToAnki(function(success) {
      if (!success) {
        showMessage('Error connecting to Anki.');
        setIconStatus('Error');
        $('#connection_error').show();
      } else {
        setIconStatus('On');
        $('#connection_error').hide();
        if (items.enabled) {
          $('#showNextQuestion').prop('disabled', false);
        } else {
          $('#showNextQuestion').prop('disabled', true);
        }
      }

      document.getElementById('frequency').value = items.frequency;
      document.getElementById('test_amt').value = items.test_amt;
      document.getElementById('enabled').checked = items.enabled;
      document.getElementById('sync').checked = items.sync;
    });
  });

}

function showMessage(msg) {
  $('#status').text(msg);
  $('#status').fadeTo('slow', 1);
  setTimeout(function() {
    $('#status').fadeTo('slow', 0);
  }, 3000);
}

function showNextQuestion() {
  chrome.runtime.sendMessage({
    id: 'showNextQuestion'
  });
}

function setIconStatus(status) {
  chrome.runtime.sendMessage({
    id: 'setIconStatus',
    value: status
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('tryAgain').addEventListener('click', restore_options);
document.getElementById('showNextQuestion').addEventListener('click', showNextQuestion);
