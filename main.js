const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const fs = require("node:fs")

// Will give it limit of 10
_tempsaves = []

if (require('electron-squirrel-startup')) app.quit();

function save(){
    if(_tempsaves.length == 10){
        _tempsaves.shift()
    }
    _tempsaves.push(structuredClone(noteDict))
    try{
        fs.writeFileSync(saveFilePath, JSON.stringify(noteDict))
    } catch (err){

    }
}

let saveFilePath = app.getPath("appData") + "/save.json"
let userSettingsPath = app.getPath("userData") + "/settings.json"

let noteDict = {}
try{
    noteDict = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"));
    save()
    
}catch (err){
    noteDict = {}
    save()
}
let noteNum = 0;
if(!(Object.keys(noteDict).length==0)){
    noteNum = parseInt(Object.keys(noteDict)[Object.keys(noteDict).length-1])
}

let userSettings = {}

try {
    userSettings = JSON.parse(fs.readFileSync(userSettingsPath, "utf-8"));
    saveSettings()
}catch(err){
    userSettings = {
        "style":{
            "bg":"#89f0c6",
            "highlight": "#f089e2",
            "text":"#000000",
            "color":"#FFF1F1"
        },
        "alertTime":3000
    }
    saveSettings()
}

function saveSettings(){
    try{
        fs.writeFileSync(userSettingsPath, JSON.stringify(userSettings))
    } catch (err){

    }
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height:720,
        minWidth: 960,
        // Line 69
        minHeight:540,
        webPreferences: {
            preload: app.getAppPath()+"\\preload.js"
        },
        icon: app.getAppPath() + "/icon.ico"
    })

    win.loadFile("index.html")
    win.setMenu(null)
    win.webContents.setWindowOpenHandler((details)=>{
        shell.openExternal(details.url);
        return {action:"deny"}
    })
}

app.whenReady().then(()=>{
    ipcMain.handle("addNote", addNote)
    ipcMain.handle("settings", getUsersettings)
    ipcMain.handle("getNote", noteInfo)
    ipcMain.handle("getAllNotes", getAllNotes)
    ipcMain.handle("editNote", editNote)
    ipcMain.handle("removeNode", removeNode)
    ipcMain.handle("undo", undo)
    ipcMain.handle("redo", redo)
    ipcMain.handle("updateSettings", updateSettings)
    ipcMain.handle("getFile", openFile)
    ipcMain.handle("getImg", openImage)
    createWindow()
})

ipcMain.on("log", (event, text)=>{
    console.log(text)
})

async function openFile(event){
    let filePath = dialog.showOpenDialog({
        properties:["openFile"],
        filters: {
            name:"All files",
            extensions:["*"]
        }
    })
    return filePath
}

async function openImage(event){
    let imagePath = dialog.showOpenDialog({
        properties:["openFile"],
        filters: {
            name:"Images",
            extensions:["jpg", "png", "gif", "webp"]
        }
    })
    return imagePath
}

async function undo(event){
    for(let i = 1; i<_tempsaves.length; i++){
        if(JSON.stringify(_tempsaves[_tempsaves.length-i]) == JSON.stringify(noteDict)){
            noteDict = _tempsaves[_tempsaves.length-i-1]
            save()
            return true
        }
    }
    return false
}

async function redo(event){
    for(let i = 0; i<_tempsaves.length-1; i++){
        if(_tempsaves[i] == noteDict){
            noteDict = _tempsaves[i+1]
            save()
            return true
        }
    }
    return false
}

async function removeNode(event, id){
    delete noteDict[id]
    let keys = Object.keys(noteDict);
    for(let i=0; i<keys.length; i++){
        if(noteDict[keys[i]]["parent"] == id){
            noteDict[keys[i]]["parent"] = null
        }
    }
    save()
}

async function addNote(event, title, text, pos, parent){
    noteNum = noteNum + 1;
    noteDict[noteNum] = {
        "title":title,
        "text":text,
        "pos":pos,
        "parent":parent
    }
    save()
    return noteNum
}

async function editNote(event, id, note_info){
    noteDict[id] = note_info
    save()
}

async function noteInfo(event, id){
    return noteDict[id]
}

async function getUsersettings(event){
    return userSettings
}

async function updateSettings(event, settings){
    userSettings = settings
    saveSettings()
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

async function getAllNotes(event){
    return noteDict
}