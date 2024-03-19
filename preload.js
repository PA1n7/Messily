const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld("tomain", {
    log: (text) => ipcRenderer.send("log", text),
    addNote: (title, text, pos, parent) => ipcRenderer.invoke("addNote", title, text, pos, parent),
    getNote: (id) => ipcRenderer.invoke("getNote", id),
    settings: () => ipcRenderer.invoke("settings"),
    getAllNotes: () => ipcRenderer.invoke("getAllNotes"),
    editNote: (id, info)=> ipcRenderer.invoke("editNote", id, info),
    removeNode: (id) => ipcRenderer.invoke("removeNode", id),
    undo: ()=> ipcRenderer.invoke("undo"),
    redo: ()=> ipcRenderer.invoke("redo"),
    updateSettingValue: (settings)=>ipcRenderer.invoke("updateSettings", settings),
    getFile: ()=>ipcRenderer.invoke("getFile"),
    getImg: ()=>ipcRenderer.invoke("getImg"),
})