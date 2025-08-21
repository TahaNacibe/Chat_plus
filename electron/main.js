const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const http = require('http');
const { globalShortcut } = require('electron');

// -------------------- CONFIG --------------------
const BACKEND_PORT = 5000;
const BACKEND_HOST = '127.0.0.1';
const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
const BACKEND_PING = `${BACKEND_URL}/ping`;

const venvPython = path.join(__dirname, '../venv/Scripts/python.exe');
const backendCwd = path.join(__dirname, '../backend');
const userDataPath = app.getPath('userData');

let pythonServer = null;
let win = null;

// -------------------- FUNCTIONS --------------------

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  Menu.setApplicationMenu(null);

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../out/index.html')}`
  );
}

function startBackend() {
  return spawn(venvPython, ['-m', 'uvicorn', 'main:app', '--port', BACKEND_PORT], {
    cwd: backendCwd,
    shell: true,
    env: {
    ...process.env,
    PYTHONIOENCODING: 'utf-8'
  }
  });
}

function checkBackendReady(url = BACKEND_PING, timeout = 500) {
  return new Promise(resolve => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForBackendReady(retries = 30, delay = 500) {
  for (let i = 0; i < retries; i++) {
    const isReady = await checkBackendReady();
    if (isReady) return true;
    await new Promise(res => setTimeout(res, delay));
  }
  return false;
}

// -------------------- APP BOOTSTRAP --------------------

app.whenReady().then(async () => {
  console.log('[FASTAPI] Launching backend...');
  pythonServer = startBackend();

  pythonServer.stdout.on('data', data => {
    console.log(`[FASTAPI] ${data.toString().trim()}`);
  });

  pythonServer.stderr.on('data', data => {
    console.error(`[FASTAPI ERROR] ${data.toString().trim()}`);
  });

  const backendReady = await waitForBackendReady();

  if (!backendReady) {
    console.error('[FASTAPI] Backend failed to start in time. Exiting...');
    if (pythonServer) pythonServer.kill('SIGTERM');
    app.quit();
    return;
  }

  console.log('[FASTAPI] Backend is ready. Launching Electron app...');

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win) win.webContents.toggleDevTools();
  });

  
  createWindow();
});

// -------------------- CLEANUP --------------------

app.on('before-quit', () => {
  if (pythonServer) {
    console.log('[FASTAPI] Terminating backend...');
    pythonServer.kill('SIGTERM');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// -------------------- IPC --------------------

ipcMain.handle('get-user-data-path', () => userDataPath);


ipcMain.on('minimize', () => win?.minimize());
ipcMain.on('maximize', () => {
  if (win?.isMaximized()) win.unmaximize();
  else win?.maximize();
});
ipcMain.on('close', () => win?.close());


ipcMain.handle('select-model-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      { name: 'Model Files', extensions: ['gguf', 'bin', 'safetensors'] }
    ],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) return null;
  return filePaths[0]; // Absolute path
});