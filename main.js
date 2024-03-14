const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs")

let saveFilePath = "examplesave.json"
let noteDict = {}
try{
    noteDict = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"));
}catch (err){
    noteDict = {}
}
let noteNum = 0;
if(!(Object.keys(noteDict).length==0)){
    noteNum = parseInt(Object.keys(noteDict)[Object.keys(noteDict).length-1])
}

console.log(noteNum)

// BubbleGum
// let userSettings = {
//     "bg":"#89f0c6",
//     "highlight": "#f089e2",
//     "text":"black",
//     "color":"snow"
// }
// Hecker
let userSettings = {
    "style":{
        "bg":"#121212",
        "highlight": "#00FE00",
        "text":"snow",
        "bText":"black"
    },
    "alertTime":1000
}

function save(){
    try{
        fs.writeFileSync(saveFilePath, JSON.stringify(noteDict))
    } catch (err){

    }
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height:720,
        minWidth: 960,
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
    createWindow()
})

// Line 69
ipcMain.on("log", (event, text)=>{
    console.log(text)
})

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