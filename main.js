const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs")

// Will give it limit of 10
_tempsaves = []

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

let saveFilePath = "examplesave.json"
let noteDict = {}
try{
    noteDict = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"));
    save()
    
}catch (err){
    noteDict = {}
}
let noteNum = 0;
if(!(Object.keys(noteDict).length==0)){
    noteNum = parseInt(Object.keys(noteDict)[Object.keys(noteDict).length-1])
}

// BubbleGum
// let userSettings = {
//     "style":{
//         "bg":"#89f0c6",
//         "highlight": "#f089e2",
//         "text":"black",
//         "color":"snow"
//     },
//     "alertTime":3000
// }
// Hecker
// let userSettings = {
//     "style":{
//         "bg":"#121212",
//         "highlight": "#00FE00",
//         "text":"snow",
//         "bText":"black"
//     },
//     "alertTime":3000
// }
// sky
let userSettings = {
    "style":{
        "bg":"#020751",
        "highlight": "#bea9de",
        "text":"snow",
        "bText":"black"
    },
    "alertTime":3000
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
        }
    })

    win.loadFile("index.html")
    win.setMenu(null)
    win.webContents.openDevTools()
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
    createWindow()
})

ipcMain.on("log", (event, text)=>{
    console.log(text)
})

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

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

async function getAllNotes(event){
    return noteDict
}