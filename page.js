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

async function loadSettings(){
    let userSettings = await window.tomain.settings()
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
            alert("Can't do that", "Release shift to move nodes.")
            return
        }
        alert("Moving Nodes", "Click on a node to move it.")
        // Line 69
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
    
}

let currentQueue = 0;

function alert(title, text){
    let win = document.getElementById("alert")
    setTimeout(()=>{
        win.style.zIndex = zIndexCounter*10
        win.getElementsByTagName("h3")[0].innerText = title
        win.getElementsByTagName("p")[0].innerText = text
        win.style.right = "-100%"
        win.style.right = "1%"
        setTimeout(()=>{
            win.style.right = "-100%"
            currentQueue = currentQueue - alertTimeRun
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
    title.innerText = noteInfo["title"]
    text.innerText = noteInfo["text"]
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
        loadInfo(node.id)
        if (currentNode != null){
            if (parentChange){
                let _tempcurrCopy = parseInt(currentNode).toString()
                let noteInfo = await window.tomain.getNote(currentNode)
                noteInfo["parent"] = node.id
                await window.tomain.editNote(_tempcurrCopy, noteInfo)
                updateAllNodes()
                return
            }
            let pos = parseTransform(document.getElementById(currentNode))
            document.getElementById(currentNode).style.transform = `translate(${pos[0]+5}px,${pos[1]+5}px)`
        }
        currentNode = node.id
        if(!moveNodes) document.getElementById("delButt").classList.remove("disabled")
        ev.stopPropagation()
    }
    node.ondblclick = ()=>{
        console.log("trying to open in separate window " + node.id)
    }
}

async function uploadNote(){
    let title = currentActiveWin.getElementsByTagName("input")[0].value
    let text = currentActiveWin.getElementsByTagName("textarea")[0].value
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
    // LINE 420
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