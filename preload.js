const {ipcRenderer, contextBridge} = require("electron");

contextBridge.exposeInMainWorld("cmd", {
    run: async command => await ipcRenderer.invoke("input", command),
    cacheString: () => ipcRenderer.invoke("cacheString"),
    controlC: () => ipcRenderer.invoke("controlC")
});