const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("macAPI", {
    getMacAddress: () => ipcRenderer.invoke("get-mac-address")
});
