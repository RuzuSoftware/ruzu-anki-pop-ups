'use strict';

function updateAC() {
  updateAnkiConnect(function(resp) {
    if (resp.success != true) {
      window.alert('Update failed, please ensure Anki is running and AnkiConnect is enabled.');
    }
  })
}

document.getElementById('updateAnkiConnect').addEventListener('click', updateAC);
