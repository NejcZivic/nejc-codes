const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    songs: (msg) => ipcRenderer.on('songs', msg),
    rpc: (msg) => ipcRenderer.send('rpc', msg),
    pause: (msg) => ipcRenderer.send('pause', msg),
    changeTime: (msg) => ipcRenderer.send('changeTime', msg),
})