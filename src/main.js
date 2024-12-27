const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'), // 必要に応じて有効化
    },
  });

  // ローカルの静的ファイルをロード
  mainWindow.loadFile(path.join(__dirname, 'out/index.html'));

  // デバッグツール（開発時のみ有効）
  // mainWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
