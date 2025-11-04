const path = require('node:path');
const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage } = require('electron');

const cameraManager = require('./main/camera-manager');
const settingsStore = require('./main/settings-store');

let cachedSettings = { ...settingsStore.defaultSettings };
let mainWindow;
let tray;
let isQuitting = false;

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Creates the main application window and loads the renderer bundle.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 728,
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('minimize', event => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', event => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow.hide();
  });

  return mainWindow;
}

function getTrayIcon() {
  const trayPath = path.join(__dirname, '..', 'assets', 'tray.ico');
  const image = nativeImage.createFromPath(trayPath);
  if (!image.isEmpty()) {
    return image.resize({ width: 24, height: 24 });
  }
  return trayPath;
}

function showMainWindow() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

function createTray() {
  if (tray) {
    return tray;
  }

  tray = new Tray(getTrayIcon());
  tray.setToolTip('webcam.org Desktop');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open webcam.org Desktop',
      click: showMainWindow
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', showMainWindow);
  return tray;
}

function applyAutoLaunchSetting(enable) {
  if (!app.isReady() || process.platform !== 'win32') {
    return;
  }

  app.setLoginItemSettings({
    openAtLogin: Boolean(enable),
    path: process.execPath,
    args: []
  });
}

app.setAppUserModelId('org.webcam.desktop');

app.whenReady().then(() => {
  cachedSettings = settingsStore.loadSettings();
  applyAutoLaunchSetting(cachedSettings.autoLaunch);
  createMainWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('health:ping', () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: process.platform
  };
});

ipcMain.handle('devices:list', () => {
  return cameraManager.listCameras();
});

ipcMain.handle('settings:get', () => {
  return cachedSettings;
});

ipcMain.handle('settings:update', (event, patch) => {
  if (!app.isReady()) {
    cachedSettings = { ...cachedSettings, ...(patch ?? {}) };
    return cachedSettings;
  }

  cachedSettings = settingsStore.updateSettings(patch ?? {});
  applyAutoLaunchSetting(cachedSettings.autoLaunch);
  return cachedSettings;
});

ipcMain.handle('settings:chooseRecordingDirectory', async () => {
  if (!app.isReady()) {
    return cachedSettings;
  }

  try {
    const window = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(window ?? undefined, {
      title: 'Select Recording Directory',
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled || !result.filePaths?.length) {
      return cachedSettings;
    }

    const [directory] = result.filePaths;
    cachedSettings = settingsStore.updateSettings({ recordingDirectory: directory });
    return cachedSettings;
  } catch (error) {
    return cachedSettings;
  }
});
