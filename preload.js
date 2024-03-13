const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld("tomain", {
    log: (text) => ipcRenderer.send("log", text),
    addNote: (title, text, pos, parent) => ipcRenderer.invoke("addNote", title, text, pos, parent),
    getNote: (id) => ipcRenderer.invoke("getNote", id),
    settings: () => ipcRenderer.invoke("settings")
})