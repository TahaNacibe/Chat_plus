const { contextBridge, ipcRenderer } = require('electron');

//? get the app main directory 
contextBridge.exposeInMainWorld('electronAPI', {
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    selectModelFile: () => ipcRenderer.invoke('select-model-file'),
    minimize: () => ipcRenderer.send('minimize'),
    maximize: () => ipcRenderer.send('maximize'),
    close: () => ipcRenderer.send('close'),
});

