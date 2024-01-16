// Modules to control application life and create native browser window
require('dotenv').config(); 
const path = require('path');
const electron = require("electron"); 
const Routes = require('./routes/native')
const ExceptionHandler = require('./app/Exceptions/handler');
const { app, contextBridge, BrowserWindow, ipcMain } = electron; 

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth:700,
    minHeight:600,
    webPreferences: {  
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false, //Set this to false, To prevent javascript being set on disable mode.
      preload: path.join(__dirname, 'public/js/main-preload.js')
    }, 
    icon: path.join(__dirname, 'public/storage/icons/sp-logo.png')
  }); 

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'resources/auth/login.html'));
  mainWindow.setMenu(null);

  // Open the DevTools.
  if (process.env.DEBUG.toLocaleLowerCase() == 'true') {
    mainWindow.webContents.openDevTools();
  } 

  mainWindow.once("ready-to-show", () => { 
    setTimeout(() => {
      mainWindow.focus(); 
    }, 2000);
  });
}

app.on('error', function(error) {
  const ExceptionHandlerInstance = new ExceptionHandler(app);
  ExceptionHandlerInstance.handle(error);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      app.commandLine.appendSwitch('enable-gpu-rasterization');
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

Routes(BrowserWindow, ipcMain);