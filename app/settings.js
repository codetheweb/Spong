const $ = require("jquery");
const electron = require('electron');
const Config = require('electron-config');
const config = new Config();

$(document).ready(function() {
  // Set inital checkbox states
  $('.setting-input').each(function() {
    $(this).prop('checked', config.get($(this).data('config')));
  });
  
  // Event handlers
  $('.close-model').click(function() {
    electron.remote.getCurrentWindow().close();
  });
  
  $('.setting-input').change(function() {
    config.set($(this).data('config'), this.checked);
    electron.ipcRenderer.sendSync('synchronous-message', 'updateDisplay');
  });
});
