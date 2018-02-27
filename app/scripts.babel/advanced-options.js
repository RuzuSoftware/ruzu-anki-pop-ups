'use strict';

// Saves options to chrome.storage.sync.
function save_options() {

  //Model -> Template -> Card -> Field
  var newModelSettings = {};

  $('#templateList > li').each(function() {

    newModelSettings[$(this).text()] = {};

    newModelSettings[$(this).text()]['Question'] = {
      title: $('#' + $(this).text() + 'q_title option:selected').val(),
      subTitle: $('#' + $(this).text() + 'q_subtitle option:selected').val(),
      context: $('#' + $(this).text() + 'q_context option:selected').val()
    };

    newModelSettings[$(this).text()]['Answer'] = {
      title: $('#' + $(this).text() + 'a_title option:selected').val(),
      subTitle: $('#' + $(this).text() + 'a_subtitle option:selected').val(),
      context: $('#' + $(this).text() + 'a_context option:selected').val()
    };


    if ($('#radio_auto').prop('checked')) {
      var display_mode = 'Automatic';
    } else {
      var display_mode = 'Custom';
    }

    //Avoid overwriting card type field values if there is a card type called DisplayMode
    if (!newModelSettings['DisplayMode']) {
      newModelSettings['DisplayMode'] = {
        mode: display_mode
      };
    } else {
      newModelSettings['DisplayMode'].mode = display_mode;
    }

  });

  chrome.storage.sync.get({
    modelSettings: defaultmodelSettings
  }, function(results) {

    results.modelSettings[$('#model').val()] = newModelSettings;
    chrome.storage.sync.set({
      modelSettings: results.modelSettings
    }, function() {
      // Show message to let user know options were saved.
      showMessage('Options saved.');
      refresh_model(results.modelSettings);
    });
  });

  console.log(newModelSettings);

  console.log('Options saved.');
}

function connectToAnki(callback) {

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:8765', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.responseText) {
        modelNames(function(resp) {
          // Populate list of models.
          var modelSelect = $('#model');
          modelSelect.empty();
          for (var i = 0; i < resp.modelNames.length; i++) {
            modelSelect.append(
              $('<option></option>').val(resp.modelNames[i]).html(resp.modelNames[i])
            );
          }
          if (callback) {
            callback({
              success: true,
              version: xhr.responseText
            });
          }
        });
      } else {
        if (callback) {
          callback({
            success: false,
            version: 0
          });
        }
      }
    }
  }
  xhr.send(JSON.stringify({
    action: 'version'
  }));
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default values if not set
  chrome.storage.sync.get({
    modelSettings: defaultmodelSettings,
    enabled: defaultEnabled,
  }, function(items) {

    connectToAnki(function(connectResp) {
      if (!connectResp.success || connectResp.version < requiredVersion) {
        if (!connectResp.success) {
          showMessage('Error connecting to Anki.');
        } else {
          showMessage('Please download the latest version of AnkiConnect and try again.');
        }
        setIconStatus('Error');
        $('#connection_error').show();
      } else {
        $('#connection_error').hide();
        $('#model').prop('disabled', false);
        if (items.enabled) {
          setIconStatus('On');
          $('#showNextQuestion').prop('disabled', false);
        } else {
          setIconStatus('Off');
          $('#showNextQuestion').prop('disabled', true);
        }
      }

      refresh_model(items.modelSettings);
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

function refresh_model(modelSettings) {
  //Remove template tabs
  $('#templateList > li').each(function() {
    this.remove()
  });
  $('#templateTabs > div').each(function() {
    this.remove()
  });

  modelFieldsOnTemplates($('#model').val(), function(resp) {

    $.each(resp.modelFieldsOnTemplates, function(index, value) {

      //Add template tab button
      $('#templateList').append('<li><a data-toggle="tab" href="#' + index + '">' + index + '</a></li>');

      //Add template tab
      $('#templateTabs').append(`
    <div id="` + index + `" class="tab-pane fade in">
        <h4>Question</h4>
        <div class="form-group">
          <label for="` + index + `q_title">Title</label>
          <select class="form-control" id="` + index + `q_title">
              <option value="0" selected>[Blank]</option>
          </select>
        </div>
        <div class="form-group">
          <label for="` + index + `q_subtitle">Subtitle</label>
          <select class="form-control" id="` + index + `q_subtitle">
              <option value="0" selected>[Blank]</option>
          </select>
        </div>
        <div class="form-group">
          <label for="` + index + `q_context">Context</label>
          <select class="form-control" id="` + index + `q_context">
              <option value="0" selected>[Blank]</option>
          </select>
        </div>
        <br/>
        <br/>

        <h4>Answer</h4>
        <div class="form-group">
          <label for="` + index + `a_title">Title</label>
          <select class="form-control" id="` + index + `a_title">
              <option value="0" selected>[Blank]</option>
          </select>
        </div>
        <div class="form-group">
          <label for="` + index + `a_subtitle">Subtitle</label>
          <select class="form-control" id="` + index + `a_subtitle">
              <option value="0" selected>[Blank]</option>
          </select>
        </div>
        <div class="form-group">
          <label for="` + index + `a_context">Context</label>
          <select class="form-control" id="` + index + `a_context">
              <option value="0" selected>[Blank]</option>
          </select>
        </div>
    </div>`).ready(function() {

        //Add select values to drop down boxes...

        //Question fields
        for (var i = 0; i < value[0].length; i++) {

          //Add to question and answer dropdowns
          if ($('#' + index + 'q_title option[value="' + value[0][i] + '"]').length == 0) {
            $('#' + index + 'q_title').append('<option value="' + value[0][i] + '">' + value[0][i] + '</option>');
            $('#' + index + 'q_subtitle').append('<option value="' + value[0][i] + '">' + value[0][i] + '</option>');
            $('#' + index + 'q_context').append('<option value="' + value[0][i] + '">' + value[0][i] + '</option>');
            $('#' + index + 'a_title').append('<option value="' + value[0][i] + '">' + value[0][i] + '</option>');
            $('#' + index + 'a_subtitle').append('<option value="' + value[0][i] + '">' + value[0][i] + '</option>');
            $('#' + index + 'a_context').append('<option value="' + value[0][i] + '">' + value[0][i] + '</option>');
          }
        }

        //Answer fields
        for (var i = 0; i < value[1].length; i++) {
          //Add to answer dropdowns
          if ($('#' + index + 'a_title option[value="' + value[1][i] + '"]').length == 0) {
            $('#' + index + 'a_title').append('<option value="' + value[1][i] + '">' + value[1][i] + '</option>');
            $('#' + index + 'a_subtitle').append('<option value="' + value[1][i] + '">' + value[1][i] + '</option>');
            $('#' + index + 'a_context').append('<option value="' + value[1][i] + '">' + value[1][i] + '</option>');
          }
        }

        if (modelSettings[$('#model').val()] && modelSettings[$('#model').val()][index]) {
          console.log('Settings found for model/template (' + $('#model').val() + ' - ' + index + ')');

          $('#' + index + 'q_title').val(modelSettings[$('#model').val()][index]['Question']['title']);
          $('#' + index + 'q_subtitle').val(modelSettings[$('#model').val()][index]['Question']['subTitle']);
          $('#' + index + 'q_context').val(modelSettings[$('#model').val()][index]['Question']['context']);

          $('#' + index + 'a_title').val(modelSettings[$('#model').val()][index]['Answer']['title']);
          $('#' + index + 'a_subtitle').val(modelSettings[$('#model').val()][index]['Answer']['subTitle']);
          $('#' + index + 'a_context').val(modelSettings[$('#model').val()][index]['Answer']['context']);

          if (modelSettings[$('#model').val()]['DisplayMode'] && modelSettings[$('#model').val()]['DisplayMode']['mode'] == 'Custom') {
            $('#radio_custom').prop('checked', true);
          } else {
            $('#radio_auto').prop('checked', true);
          }

        } else {
          console.log('Settings NOT found for model/template (' + $('#model').val() + ' - ' + index + ')');

          //Pre select drop down choices
          $('#' + index + 'q_title').val(value[0][0]);
          if (value[0].length = 1) {
            $('#' + index + 'q_subtitle').val(0);
          } else {
            $('#' + index + 'q_subtitle').val(value[0][1]);
          }
          $('#' + index + 'q_context').val(0);

          $('#' + index + 'a_title').val(value[0][0]);
          $('#' + index + 'a_subtitle').val(value[1][0]);
          if (value[1].length = 1) {
            $('#' + index + 'a_context').val(0);
          } else {
            $('#' + index + 'a_context').val(value[1][1]);
          }

          $('#radio_auto').prop('checked', true);

        }

      });
      console.log(modelSettings);
    });

    $('#templateList li:first').addClass('active');
    $('#templateTabs div:first').addClass('active in');

  });

}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('tryAgain').addEventListener('click', restore_options);
document.getElementById('showNextQuestion').addEventListener('click', showNextQuestion);
$('#model').change(function() {
  chrome.storage.sync.get({
    modelSettings: defaultmodelSettings
  }, function(items) {
    refresh_model(items.modelSettings);
  });
});
