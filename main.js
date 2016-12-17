'use strict';
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const Config = require('electron-config');
const config = new Config();

// Debug
require('electron-debug')({showDevTools: true});

let mainWindow;

// Set config for the first time
if (config.get('showArtwork') == undefined) {
  config.set('showArtwork', true);
  config.set('showArtist', true);
  config.set('reactiveBackground', false);
  config.set('reactiveForeground', true);
}

function createWindow() {
  app.setName('Spong');
  
  const menuTemplate = [{
    label: 'Spong',
    submenu: [
        {
          label: 'Settings',
          accelerator: 'Cmd+,',
          click: () => {
            let settings = new BrowserWindow({parent: mainWindow, titleBarStyle: 'hidden-inset', backgroundColor: '#141619', frame: false});
            settings.loadURL(url.format({
              pathname: path.join(__dirname, 'app/settings.html'),
              protocol: 'file:',
              slashes: true
            }));
          }
        }, {
            type: 'separator'
        }, {
          label: 'Quit',
          accelerator: 'Cmd+Q',
          role: 'quit'
        }
    ]
  }];
  
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({width: width, height: height, minHeight: 600, minWidth: 800, titleBarStyle: 'hidden-inset', backgroundColor: '#141619'});
  
  mainWindow.setAspectRatio(width / height);
  
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Handler to update display when settings are changed
electron.ipcMain.on('synchronous-message', (event, arg) => {
  if (arg == 'updateDisplay') {
    mainWindow.webContents.executeJavaScript('updateDisplay();');
  }
  event.returnValue = 'updated';
});
