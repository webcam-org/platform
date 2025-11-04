const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopBridge', {
  ping: async () => {
    const response = await ipcRenderer.invoke('health:ping');
    return response;
  },
  listDevices: async () => {
    const devices = await ipcRenderer.invoke('devices:list');
    return devices;
  },
  getSettings: async () => {
    const settings = await ipcRenderer.invoke('settings:get');
    return settings;
  },
  updateSettings: async patch => {
    const settings = await ipcRenderer.invoke('settings:update', patch);
    return settings;
  },
  chooseRecordingDirectory: async () => {
    const settings = await ipcRenderer.invoke('settings:chooseRecordingDirectory');
    return settings;
  }
});
