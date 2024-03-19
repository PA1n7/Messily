var currentNode = null;
let parentChange = false;
let moveNodes = false
let alertTimeRun = 3000

hourSet = () => {
    let date = new Date()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    hours = hours.toString().length > 1 ? hours : "0" + hours.toString()
    minutes = minutes.toString().length > 1 ? minutes : "0" + minutes.toString()
    document.getElementById("clock").innerText = hours + ":" + minutes;
}

let settingsDict;

async function loadSettings(){
    let userSettings = await window.tomain.settings()
    settingsDict = userSettings
    for(const [key, value] of Object.entries(userSettings["style"])){
        document.documentElement.style.setProperty('--'+key, value);
    }
    alertTimeRun = userSettings["alertTime"]
}

loadSettings()
updateAllNodes()

document.getElementById("delButt").onclick = async ()=>{
    if(currentNode == null) return
    await window.tomain.removeNode(currentNode)
    let pos = parseTransform(document.getElementById(currentNode))
    document.getElementById(currentNode).style.transform = `translate(${pos[0]+5}px,${pos[1]+5}px)`
    currentNode = null
    updateAllNodes()
    clearSideBar()
}

document.onkeydown = async (ev)=>{
    if(ev.ctrlKey && ev.shiftKey && ev.key == "Z"){
        let response = await window.tomain.redo()
        if(!response){
            alert("Can't", "Nothing to redo!")
        }
        updateAllNodes()
        return
    }
    if(ev.ctrlKey && ev.key == "z"){
        let response = await window.tomain.undo()
        if(!response){
            alert("Can't", "Nothing to undo!")
        }
        updateAllNodes()
        return
    }
    if(document.getElementsByClassName("window").length > 0)return
    if(ev.key == "Shift"){
        if(parentChange) return
        if(moveNodes){
            alert("Can't do that", "Release ctrl to enter parent mode.")
            return
        }
        alert("Parent Mode", "Click on a node to set parent.")
        parentChange = true
    }
    if(ev.key == "Control"){
        if(moveNodes) return
        if(parentChange){
            // Line 69
            alert("Can't do that", "Release shift to move nodes.")
            return
        }
        alert("Moving Nodes", "Click on a node to move it.")
        moveNodes = true
    }
}

document.onkeyup = (ev)=>{
    if(currentActiveWin != null){
        if(ev.key == "Escape"){
            document.body.removeChild(currentActiveWin)
            currentActiveWin = null
            return
        }
    }
    if(document.getElementsByClassName("window").length > 0)return
    if(ev.key == "Shift"){
        alert("Exited Parent Mode", "Press shift again to enter parent mode again.")
        parentChange = false
        if(ev.ctrlKey){
            alert("Moving Nodes", "Click on a node to move it.")
            moveNodes = true
        }
    }
    if(ev.key == "Control"){
        alert("Nodes Locked", "Press ctrl again to move nodes again.")
        moveNodes = false
        if(ev.shiftKey){
            alert("Parent Mode", "Click on a node to set parent.")
            parentChange = true
        }
    }
}

defaultMouseUp = ()=>{
    document.onmousemove = null
}

resetMouseUp = ()=>{
    defaultMouseUp()
    updateAllNodes()
}

document.onmouseup = defaultMouseUp

document.getElementById("resizer").style.left = "79%"

document.getElementById("resizer").onmousedown = (ev)=>{
    let offset = document.getElementById("resizer").style.left.replace("%", "") - (ev.clientX/window.innerWidth)*100
    let changeX = 0
    document.onmousemove = (ev) => {
        let mainPerc = Math.floor((ev.clientX*10000)/window.innerWidth)/100-1
        if (mainPerc < 20 || mainPerc > 80){
            mainPerc = mainPerc<20 ? 20 : 80
        }
        mainPerc = mainPerc + offset
        changeX = mainPerc-changeX
        if(changeX != 0){
            document.getElementById("mainWin").style.width = mainPerc + "%"
            document.getElementById("sidebar").style.width = 96-mainPerc + "%"
            document.getElementById("resizer").style.left = mainPerc + 1 + "%"
            updateAllNodes()
        }
        changeX = mainPerc
        document.onmouseup = ()=>{
            document.onmousemove = null
        }
    }
}

function clearSideBar(){
    let sidebar = document.getElementById("sidebar")
    sidebar.innerHTML = ""
}

document.getElementById("mainWin").onclick = ()=>{
    let nodes = document.getElementsByClassName("node")
    for(let i = 0; i<nodes.length; i++){
        nodes[i].style.border = ""
        nodes[i].getElementsByTagName("div")[0].style.backgroundColor = document.documentElement.style.getPropertyValue("--highlight")
    }
    let pos = parseTransform(document.getElementById(currentNode))
    document.getElementById(currentNode).style.transform = `translate(${pos[0]+5}px,${pos[1]+5}px)`
    currentNode = null;
    document.getElementById("delButt").classList.add("disabled")
    clearSideBar()
}

hourSet()

setInterval(hourSet, 5000);

document.getElementById("newButt").onclick = createNewNoteWindow;

let zIndexCounter = 1000

let windowsCreated = 0

let currentActiveWin;

function createNewNoteWindow(){
    let win = document.createElement("div");
    currentActiveWin = win;
    windowsCreated = windowsCreated + 1
    if (windowsCreated >= 10){
        windowsCreated = 0
    }
    win.style.zIndex = zIndexCounter
    zIndexCounter = zIndexCounter + 1
    win.style.top = 50*(windowsCreated**(1/2)) + "px"
    win.style.left = 35*(windowsCreated**(1/2)) + "px"
    win.classList.add("window");
    let navTop = document.createElement("div");
    navTop.classList.add("navTop")
    let p = document.createElement("p")
    win.onclick = ()=>{
        win.style.zIndex = zIndexCounter;
        zIndexCounter = zIndexCounter+ 1;
        currentActiveWin = win;
    }
    p.onmousedown = ()=>{
        document.body.removeChild(win)
    }
    navTop.onmousedown = (e) => {
        offSetY = win.style.top.replace("px", "") - e.clientY;
        offSetX = win.style.left.replace("px", "") - e.clientX;
        console.log(offSetX)
        document.onmousemove = (e)=>{
            win.style.top = e.clientY + offSetY + "px";
            win.style.left = e.clientX + offSetX + "px";
        };
    }
    p.innerText = "x"
    p.classList.add("close");
    navTop.appendChild(p);
    win.appendChild(navTop);
    let innercont = document.createElement("div")
    innercont.classList.add("innerContent")
    innercont.innerHTML = document.getElementById("newNote").innerHTML
    win.appendChild(innercont)
    document.body.appendChild(win);
    let saveButtons = document.getElementsByClassName("saveButt");
    for(let i = 0; i<saveButtons.length; i++){
        saveButtons[i].onclick = () => {
            currentActiveWin = saveButtons[i].parentElement.parentElement.parentElement.parentElement
            uploadNote()
        }
    }
    let resizeWindow = document.getElementsByClassName("resizeWindow");
    for(let i = 0; i<resizeWindow.length; i++){
        resizeWindow[i].onmousedown = (e) => {
            let start = [e.clientX, e.clientY]
            let window = resizeWindow[i].parentElement.parentElement.parentElement
            let windowSize = [window.offsetWidth, window.offsetHeight]
            document.onmousemove = (e)=>{
                if (!((windowSize[0] + (e.clientX-start[0])) < document.body.offsetWidth/4)){
                    window.style.width = (windowSize[0] + (e.clientX-start[0])) + "px"
                }
                if (!((windowSize[1] + (e.clientY-start[1])) < document.body.offsetHeight/2)){
                    window.style.height = (windowSize[1] + (e.clientY-start[1])) + "px"
                }
            }
        }
    }
    let embedLink = currentActiveWin.getElementsByClassName("embed")[0]
    embedLink.style.marginLeft = "5px"
    embedLink.onclick = ()=>{
        let url = document.createElement("input")
        url.type = "url"
        url.id = "url/filepath"
        let text = document.createElement("input")
        text.type= "text"
        text.id = "text"
        askWindow([url, text], ()=>{
            if(url.value == "")return
            if(text.value == "")text.value = "url"
            let textarea = currentActiveWin.getElementsByClassName("contentText")[0]
            textarea.innerHTML = textarea.innerHTML + `\n<a href='${url.value}' target='_blank'>${text.value}</a>`
        })
    }
    let embedFile = currentActiveWin.getElementsByClassName("file")[0]
    embedFile.style.marginLeft = "5px"
    embedFile.onclick =async ()=>{
        let filePath = await window.tomain.getFile()
        if(filePath.filePaths[0] == undefined) return
        let text = document.createElement("input")
        text.type = "text"
        text.id = "text"
        askWindow([text], ()=>{
            if(text.value == "")text.value = filePath.filePaths[0]
            let textarea = currentActiveWin.getElementsByClassName("contentText")[0]
            textarea.innerHTML = textarea.innerHTML + `\n<a href='${filePath.filePaths[0]}' target='_blank'>${text.value}</a>`
        })
    }
    let embedImage = currentActiveWin.getElementsByClassName("image")[0]
    embedImage.style.marginLeft = "5px"
    embedImage.onclick =async ()=>{
        let filePath = await window.tomain.getImg()
        if(filePath.filePaths[0] == undefined) return
        let text = document.createElement("input")
        text.type = "text"
        text.id = "alt text"
        askWindow([text], ()=>{
            if(text.value == "")text.value = filePath.filePaths[0]
            let textarea = currentActiveWin.getElementsByClassName("contentText")[0]
            textarea.innerHTML = textarea.innerHTML + `\n<img src="${filePath.filePaths[0]}" alt="${text.value}" width="100%">`
        })
    }
    
}

function askWindow(inputs, action){
    let window = document.createElement("div")
    window.id = "askWindow"
    window.style.zIndex = zIndexCounter*100
    window.style.width = "50%";
    window.style.height = "50%";
    window.style.position = "absolute"
    window.style.top = "25%"
    window.style.left = "25%"
    window.style.backgroundColor = "var(--highlight)"
    window.style.borderRadius = "15px"
    window.style.border = "solid 1px var(--bText)"
    window.style.padding = "10px"
    for(let i = 0; i<inputs.length; i++){
        let title = document.createElement("h1")
        title.innerText = inputs[i].id
        window.appendChild(title)
        window.appendChild(inputs[i])
    }
    let br = document.createElement("br")
    let submitButton = document.createElement("a")
    submitButton.innerText = "Submit"
    submitButton.onclick = ()=>{
        document.body.removeChild(window)
        action()
    }
    window.appendChild(br.cloneNode(true))
    window.appendChild(br.cloneNode(true))
    window.appendChild(submitButton)
    document.body.appendChild(window)
}

let currentQueue = 0;

function alert(title, text){
    let _copyAlert = parseInt(alertTimeRun.toString())
    let win = document.getElementById("alert")
    setTimeout(()=>{
        win.style.zIndex = zIndexCounter*10
        win.getElementsByTagName("h3")[0].innerText = title
        win.getElementsByTagName("p")[0].innerText = text
        win.style.right = "-100%"
        win.style.right = "1%"
        setTimeout(()=>{
            win.style.right = "-100%"
            currentQueue = currentQueue - _copyAlert
        }, alertTimeRun)
    }, currentQueue + 100)
    currentQueue = currentQueue + alertTimeRun
}

async function loadInfo(id){
    let noteInfo = await window.tomain.getNote(id)
    let nodes = document.getElementsByClassName("node")
    clearSideBar()
    for(let i = 0; i<nodes.length; i++){
        if (nodes[i].id == id){
            nodes[i].style.border = "5px solid "+document.documentElement.style.getPropertyValue("--highlight")
            nodes[i].getElementsByTagName("div")[0].style.backgroundColor = document.documentElement.style.getPropertyValue("--bg")
            continue
        }
        if(nodes[i].id == noteInfo["parent"]){
            nodes[i].style.border = "2px solid "+document.documentElement.style.getPropertyValue("--highlight")
            nodes[i].getElementsByTagName("div")[0].style.backgroundColor = document.documentElement.style.getPropertyValue("--bg")
            continue
        }
        nodes[i].style.border = ""
        nodes[i].getElementsByTagName("div")[0].style.backgroundColor = document.documentElement.style.getPropertyValue("--highlight")
    }
    let title = document.createElement("h3")
    let text = document.createElement("p")
    title.innerHTML = noteInfo["title"]
    text.innerHTML = noteInfo["text"]
    document.getElementById("sidebar").appendChild(title)
    document.getElementById("sidebar").appendChild(text)
}

function prepareNode(node, perc_pos){
    node.classList.add("node")
    let parentWin = document.getElementById("mainWin")
    let nodePos = [Math.floor((perc_pos[0]/100)*parentWin.offsetWidth), Math.floor((perc_pos[1]/100)*parentWin.offsetHeight)]
    node.style.transform = "translate(" + nodePos[0] + "px" + ", " + nodePos[1] + "px)";
    let innerNode = document.createElement("div")
    node.appendChild(innerNode)
    node.onmouseover = ()=>{
        if(currentNode == node.id) return
        let pos = parseTransform(node)
        node.style.transform = `translate(${pos[0]-5}px,${pos[1]-5}px)`
    }
    node.onmouseout = ()=>{
        if(currentNode == node.id)return
        let pos = parseTransform(node)
        node.style.transform = `translate(${pos[0]+5}px,${pos[1]+5}px)`
    }
    node.onmousedown = (ev)=>{
        if(!moveNodes) return
        let transform = parseTransform(node)
        transform = [ev.clientX-transform[0], ev.clientY-transform[1]]
        let boundariesX = [0];
        boundariesX.push(document.getElementById("mainWin").offsetWidth*0.97);
        let boundariesY = [0];
        boundariesY.push(document.getElementById("mainWin").offsetHeight-((boundariesX[1]*3)/97));
        document.onmousemove = (ev)=>{
            let newX = ev.clientX-transform[0]
            let newY = ev.clientY-transform[1]
            if(newX>boundariesX[1] || newX<boundariesX[0]){
                newX = newX>boundariesX[1] ? boundariesX[1] : boundariesX[0];
            }
            if(newY>boundariesY[1] || newY<boundariesY[0]){
                newY = newY>boundariesY[1] ? boundariesY[1] : boundariesY[0];
            }
            node.style.transform = `translate(${newX}px,${newY}px)`
        }
        document.onmouseup = async ()=>{
            let nodeInfo = await window.tomain.getNote(node.id)
            let newlocation = parseTransform(node)
            newlocation = [
                Math.floor((newlocation[0]/document.getElementById("mainWin").offsetWidth)*10000)/100,
                Math.floor((newlocation[1]/document.getElementById("mainWin").offsetHeight)*10000)/100
            ]
            nodeInfo["pos"] = newlocation
            await window.tomain.editNote(node.id, nodeInfo)
            document.onmouseup = null
            updateAllNodes()
            return
        }
    }
    node.onclick = async (ev)=>{
        ev.stopPropagation()
        if(currentNode == node.id) return
        loadInfo(node.id)
        if (currentNode != null){
            if (parentChange){
                let _tempcurrCopy = parseInt(currentNode).toString()
                let noteInfo = await window.tomain.getNote(currentNode)
                noteInfo["parent"] = node.id
                await window.tomain.editNote(_tempcurrCopy, noteInfo)
                updateAllNodes()
                // LINE 420
                return
            }
            let pos = parseTransform(document.getElementById(currentNode))
            document.getElementById(currentNode).style.transform = `translate(${pos[0]+5}px,${pos[1]+5}px)`
        }
        currentNode = node.id
        if(!moveNodes) document.getElementById("delButt").classList.remove("disabled")
        prevnode = currentNode
    }
    node.ondblclick = ()=>{
        openEdit(node.id)
    }
}

async function uploadNote(){
    let title = currentActiveWin.getElementsByTagName("input")[0].value
    let text = currentActiveWin.getElementsByClassName("contentText")[0].innerHTML
    if(title == ""){
        alert("No title", "You need to set a title to save the note!")
        currentActiveWin.getElementsByTagName("input")[0].focus()
        return
    }
    let node = document.createElement("div")
    let pos = [Math.floor(Math.random()*90), Math.floor(Math.random()*90)]
    prepareNode(node, pos)
    noteId = await window.tomain.addNote(title, text, pos, currentNode)
    node.id = noteId
    document.getElementById('mainWin').appendChild(node)
    document.body.removeChild(currentActiveWin)
    currentActiveWin = null
    if(currentNode != null){
        let nodes = document.getElementsByClassName("node")
        for(let i = 0; i<nodes.length; i++){
            nodes[i].style.border = ""
            nodes[i].getElementsByTagName("div")[0].style.backgroundColor = document.documentElement.style.getPropertyValue("--highlight")
        }
        let pos = parseTransform(document.getElementById(currentNode))
        document.getElementById(currentNode).style.transform = `translate(${pos[0]+5}px,${pos[1]+5}px)`
        currentNode = null;
        clearSideBar()
    }
    currentNode = null
    updateAllNodes()
}

async function updateParents(){
    let nodes = document.getElementsByClassName("node")
    let allNodes = await window.tomain.getAllNotes()
    for (let i = 0; i<nodes.length; i++){
        let nodeInfo = allNodes[nodes[i].id]
        if (nodeInfo["parent"] == null){
            continue
        }
        connect = document.createElement("div")
        connect.id = "connect"+nodeInfo["parent"]+"-"+nodes[i].id
        connect.classList.add("connector")
        let childNode = nodes[i]
        let parentNode = document.getElementById(nodeInfo["parent"])
        let pos1 = parseTransform(childNode)
        let pos2 = parseTransform(parentNode)
        let transform = (document.getElementById("mainWin").offsetWidth*0.015)
        pos1 = [pos1[0]+transform, pos1[1]+transform]
        pos2 = [pos2[0]+transform, pos2[1]+transform]
        let width = (Math.sqrt((pos1[0]-pos2[0])**2 + (pos1[1]-pos2[1])**2));
        let radius = width/2;
        let x = ((pos1[0]+pos2[0])/2)-radius
        let y = (pos1[1]+pos2[1])/2
        connect.style.position = "absolute";
        connect.style.width = width + "px";
        connect.style.height = "2px";
        connect.style.backgroundColor = document.documentElement.style.getPropertyValue("--highlight");
        let m = (pos1[0]<pos2[0]) ? (pos2[1] - pos1[1])/(pos2[0] - pos1[0]) : (pos1[1] - pos2[1])/(pos1[0] - pos2[0])
        connect.style.transform = `translate(${x}px,${y}px)` + " rotate(" + (Math.atan(m)*(180/Math.PI)) + "deg)"
        document.getElementById("mainWin").appendChild(connect);
    }
}

function parseTransform(element){
    let basicString = element.style.transform
    basicString = basicString.replace("translate", "").replace("(", "").replace(")", "").split(",")
    for (let i = 0; i<basicString.length; i++){
        basicString[i] = parseInt(basicString[i].replace("px", ""))
    }
    return basicString
}

async function updateAllNodes(){
    document.getElementById("mainWin").innerHTML = ""
    let allNotes = await window.tomain.getAllNotes()
    let activeNodes = Object.keys(allNotes)
    for (let i=0; i<activeNodes.length; i++){
        node = document.createElement("div")
        node.id = activeNodes[i]
        prepareNode(node, allNotes[activeNodes[i]]["pos"])
        document.getElementById("mainWin").appendChild(node)
    }
    updateParents()
}

async function openEdit(id){
    let noteInfo = await window.tomain.getNote(id)
    createNewNoteWindow()
    let saveButton = currentActiveWin.getElementsByClassName("saveButt")[0]
    let title = currentActiveWin.getElementsByTagName("input")[0]
    let content = currentActiveWin.getElementsByClassName("contentText")[0]
    title.value = noteInfo["title"]
    content.innerHTML = noteInfo["text"]
    saveButton.onclick = async()=>{
        document.body.removeChild(currentActiveWin)
        noteInfo["title"] = title.value
        noteInfo["text"] = content.innerHTML
        window.tomain.editNote(id, noteInfo)
        currentActiveWin = null
        loadInfo(id)
    }
}

document.getElementById("settings").onclick = async ()=>{
    createNewNoteWindow()
    let innerContent = currentActiveWin.getElementsByClassName("innerContent")[0]
    let buttons = currentActiveWin.getElementsByClassName("bottomButtons")[0].getElementsByTagName("nav")[0]
    let title = currentActiveWin.getElementsByTagName("input")[0]
    let content = currentActiveWin.getElementsByClassName("contentText")[0]
    innerContent.getElementsByClassName("bottomButtons")[0].removeChild(buttons);
    innerContent.removeChild(title);
    innerContent.removeChild(content);
    preloadedSettings = {
        "BubbleGum":{
            "style":{
                "bg":"#89f0c6",
                "highlight": "#f089e2",
                "text":"#000000",
                "bText":"#FFFAFA"
            },
            "alertTime":3000
        },
        "Hecker":{
            "style":{
                "bg":"#121212",
                "highlight": "#00FE00",
                "text":"#FFFAFA",
                "bText":"#000000"
            },
            "alertTime":3000
        },
        "sky":{
            "style":{
                "bg":"#020751",
                "highlight": "#bea9de",
                "text":"#FFFAFA",
                "bText":"#000000"
            },
            "alertTime":3000
        },
        "light":{
            "style":{
                "bg":"#FFFAFA",
                "highlight":"#CCC5C5",
                "text":"#000000",
                "bText":"#000000"
            },
            "alertTime":3000
        },
        "dark":{
            "style":{
                "bg":"#121212",
                "highlight":"#282A3A",
                "text":"#FFFAFA",
                "bText":"#FFFAFA"
            },
            "alertTime":3000
        }
    }
    let settingsWin = document.getElementById("settingsWin")
    let palettes = Object.keys(preloadedSettings)
    for(let i = 0; i< palettes.length; i++){
        let paletteName = document.createElement("h1")
        paletteName.style.marginLeft = "15px"
        paletteName.innerText = palettes[i]
        let palette = settingsWin.getElementsByClassName("colorPalette")[0]
        palette = palette.cloneNode(true)
        let baseline = palette.getElementsByClassName("square")[0]
        let bgsquare = baseline.cloneNode(true)
        let highsquare = baseline.cloneNode(true)
        bgsquare.style.backgroundColor = preloadedSettings[palettes[i]]["style"]["bg"]
        bgsquare.style.color = preloadedSettings[palettes[i]]["style"]["text"]
        highsquare.style.backgroundColor = preloadedSettings[palettes[i]]["style"]["highlight"]
        highsquare.style.color = preloadedSettings[palettes[i]]["style"]["bText"]
        bgsquare.innerText="test"
        highsquare.innerText = "test"
        palette.removeChild(baseline)
        palette.appendChild(bgsquare)
        palette.appendChild(highsquare)
        palette.onclick = async ()=>{
            await window.tomain.updateSettingValue(preloadedSettings[palettes[i]])
            document.getElementById("bgIdentifier").style.backgroundColor = "var(--bg)"
            document.getElementById("highIdentifier").style.backgroundColor = "var(--highlight)"
            document.getElementById("bgSelectorFont").value = preloadedSettings[palettes[i]]["style"]["text"]
            document.getElementById("highSelectorFont").value = preloadedSettings[palettes[i]]["style"]["bText"]
            document.getElementById("bgSelector").value = preloadedSettings[palettes[i]]["style"]["bg"]
            document.getElementById("highSelector").value = preloadedSettings[palettes[i]]["style"]["highlight"]
            document.getElementById("alertSelector").value = preloadedSettings[palettes[i]]["alertTime"]
            document.getElementById("alertNum").value = preloadedSettings[palettes[i]]["alertTime"]
            loadSettings()
            updateAllNodes()
        }
        innerContent.appendChild(paletteName)
        innerContent.appendChild(palette)
    }
    let sectiontitle = document.createElement("h1")
    sectiontitle.innerText = "Custom Settings"
    innerContent.appendChild(sectiontitle)
    let alertBar = document.createElement("input")
    alertBar.id = "alertSelector"
    alertBar.type = "range"
    alertBar.min = "1"
    alertBar.max = "10000"
    alertBar.value = alertTimeRun
    let prev = document.createElement("p")
    prev.style.fontWeight = "bold"
    prev.style.display = "contents"
    prev.id = "alertNum"
    prev.innerText = alertBar.value
    alertBar.onmousedown = ()=>{
        document.onmousemove = ()=>{
            prev.innerText = alertBar.value
            document.onmouseup = ()=>{
                document.onmousemove = null
            }
        }
    }
    alertBar.onchange = async ()=>{
        prev.innerText = alertBar.value
        settingsDict["alertTime"] = parseInt(alertBar.value)
        await window.tomain.updateSettingValue(settingsDict)
        loadSettings()
        alert("New Alert Time", "This is how long alerts will be shown for")
    }
    alertBar.style.marginLeft = "15px"
    let alertBarTitle = document.createElement("h1")
    alertBarTitle.style.marginLeft = "15px"
    alertBarTitle.innerText = "Alert Time"
    alertBar.style.height = "5%"
    alertBar.style.width = "75%"
    innerContent.appendChild(alertBarTitle)
    innerContent.appendChild(alertBar)
    innerContent.appendChild(prev)
    {
        let bgTitle = document.createElement("h1")
        bgTitle.innerText = "Background"
        bgTitle.style.marginLeft = "15px"
        let square = document.createElement("div")
        square.id = "bgIdentifier"
        square.style.width = "15%"
        square.style.aspectRatio = "1/1"
        square.style.backgroundColor = "var(--bg)"
        square.style.color = "var(--text)"
        square.innerText = "test"
        square.style.marginLeft = "15px"
        square.style.border = "1px solid var(--bg)"
        let fontColor = document.createElement("input")
        fontColor.type = "color"
        fontColor.value = settingsDict["style"]["text"]
        fontColor.id = "bgSelectorFont"
        fontColor.style.marginLeft = "15px"
        let squareColor = document.createElement("input")
        squareColor.type = "color"
        squareColor.value = settingsDict["style"]["bg"]
        squareColor.id = "bgSelector"
        squareColor.style.marginLeft = "15px"
        squareColor.onchange = async ()=>{
            settingsDict["style"]["bg"] = squareColor.value
            window.tomain.updateSettingValue(settingsDict)
            loadSettings()
            updateAllNodes()
        }
        fontColor.onchange = async ()=>{
            document.onmousemove = null
            settingsDict["style"]["text"] = fontColor.value
            window.tomain.updateSettingValue(settingsDict)
            loadSettings()
        }
        innerContent.appendChild(bgTitle)
        innerContent.appendChild(square)
        innerContent.appendChild(squareColor)
        innerContent.appendChild(fontColor)
    }
    {
        let highTitle = document.createElement("h1")
        highTitle.innerText = "Highlight"
        let square = document.createElement("div")
        square.id = "highIdentifier"
        highTitle.style.marginLeft = "15px"
        square.style.width = "15%"
        square.style.aspectRatio = "1/1"
        square.style.backgroundColor = "var(--highlight)"
        square.style.color = "var(--bText)"
        square.innerText = "test"
        square.style.marginLeft = "15px"
        square.style.border = "1px solid var(--bg)"
        let fontColor = document.createElement("input")
        fontColor.type = "color"
        fontColor.value = settingsDict["style"]["bText"]
        fontColor.id = "highSelectorFont"
        fontColor.style.marginLeft = "15px"
        let squareColor = document.createElement("input")
        squareColor.type = "color"
        squareColor.value = settingsDict["style"]["highlight"]
        squareColor.id = "highSelector"
        squareColor.style.marginLeft = "15px"
        squareColor.onchange = async ()=>{
            settingsDict["style"]["highlight"] = squareColor.value
            window.tomain.updateSettingValue(settingsDict)
            loadSettings()
            updateAllNodes()
        }
        fontColor.onchange = async ()=>{
            document.onmousemove = null
            settingsDict["style"]["bText"] = fontColor.value
            window.tomain.updateSettingValue(settingsDict)
            loadSettings()
        }
        innerContent.appendChild(highTitle)
        innerContent.appendChild(square)
        innerContent.appendChild(squareColor)
        innerContent.appendChild(fontColor)
    }
    let spacer = document.createElement("div")
    spacer.style.height="7%"
    spacer.style.width="100%"
    console.log(spacer)
    innerContent.appendChild(spacer)
}