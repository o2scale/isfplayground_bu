const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("macAPI", {
    getMacAddress: () => ipcRenderer.invoke("get-mac-address"),
    getOnlineStatus: () => ipcRenderer.invoke('get-online-status')
});

// contextBridge.exposeInMainWorld('electronAPI', {
//     getMacAddress: () => ipcRenderer.invoke("get-mac-address"),
//     getOnlineStatus: () => ipcRenderer.invoke('get-online-status')
// });