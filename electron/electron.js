const {app, BrowserWindow, ipcMain, protocol} = require('electron')
const path = require('path')
const url = require('url')

const isProduction = true;
const name = isProduction? 'DigiByte Gaming Wallet' : 'DigiByte Gaming Wallet (Development)'
app.setName(name)
const userDataDir = isProduction? 'DigiByte Gaming Wallet' : 'DigiByte Gaming Wallet-dev'
app.setPath('userData', path.join(app.getPath('appData'), userDataDir))

const registerProtocolHandlers = function(app){
  app.setAsDefaultProtocolClient('digibyte')
  app.setAsDefaultProtocolClient('digiid')
}

// Keep a global reference of the `mainWindow` object (so it's not closed
// automatically when it's garbage collected).
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 700,
    minWidth: 320, // iPhone 5
    height: 580,
    minHeight: 568, // iPhone 5
    titleBarStyle: 'hidden-inset', // macOS
    backgroundColor: '#1E3186'
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/public/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  //if(!isProduction){
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    //require('devtron').install()
  //}

  registerProtocolHandlers(app);

  setTimeout(function(){
    if(process.argv[1]){
      mainWindow.webContents.send('launchedWithArg', {arg: process.argv[1]});
    }
  }, 5000);


  mainWindow.on('closed', () => {
    mainWindow = null
  });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})