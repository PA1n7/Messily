const { app, BrowserWindow, ipcMain } = require("electron");

let noteNum = 0;
let noteDict = {};
// BubbleGum
// let userSettings = {
//     "bg":"#89f0c6",
//     "highlight": "#f089e2",
//     "text":"black",
//     "color":"snow"
// }
// Hecker
let userSettings = {
    "bg":"#121212",
    "highlight": "#00FE00",
    "text":"snow",
    "bText":"black"
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
    createWindow()
})

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
    console.log(noteDict)
    return noteNum
}

async function noteInfo(event, id){
    return noteDict[id]
}

async function getUsersettings(event){
    return userSettings
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
    // Line 69
})