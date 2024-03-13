var currentNode = null;

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
    for(const [key, value] of Object.entries(userSettings)){
        document.documentElement.style.setProperty('--'+key, value);
    }
}

loadSettings()

document.getElementById("resizer").style.left = "79%"

document.getElementById("resizer").onmousedown = (ev)=>{
    let offset = document.getElementById("resizer").style.left.replace("%", "") - (ev.clientX/window.innerWidth)*100
    console.log(offset)
    document.onmousemove = (ev) => {
        let mainPerc = Math.floor((ev.clientX*10000)/window.innerWidth)/100-1
        if (mainPerc < 20){
            mainPerc = 20
        }
        if (mainPerc > 80){
            mainPerc = 80
        }
        mainPerc = mainPerc + offset
        document.getElementById("mainWin").style.width = mainPerc + "%"
        document.getElementById("sidebar").style.width = 96-mainPerc + "%"
        document.getElementById("resizer").style.left = mainPerc + 1 + "%"
    }
}

document.onmouseup = ()=>{
    document.onmousemove = null
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
    clearSideBar()
}

hourSet()

setInterval(hourSet, 5000);

document.getElementById("newButt").onclick = createNewNoteWindow;

let zIndexCounter = 1000
// Line 69

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
    console.log(resizeWindow)
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

function alert(title, text){
    let win = document.getElementById("alert")
    win.style.zIndex = zIndexCounter*10
    win.getElementsByTagName("h3")[0].innerText = title
    win.getElementsByTagName("p")[0].innerText = text
    win.style.top = "-100%"
    win.style.top = "1%"
    setTimeout(()=>{
        win.style.top = "-100%"
    }, 3000)
}

async function loadInfo(id){
    let noteInfo = await window.tomain.getNote(id)
    let nodes = document.getElementsByClassName("node")
    clearSideBar()
    for(let i = 0; i<nodes.length; i++){
        if (nodes[i].id == id){
            nodes[i].style.border = "5px solid "+document.documentElement.style.getPropertyValue("--highlight")
            nodes[i].getElementsByTagName("div")[0].style.backgroundColor = "transparent"
        }else{
            nodes[i].style.border = ""
            nodes[i].getElementsByTagName("div")[0].style.backgroundColor = document.documentElement.style.getPropertyValue("--highlight")
        }
    }
    let title = document.createElement("h3")
    let text = document.createElement("p")
    title.innerText = noteInfo["title"]
    text.innerText = noteInfo["text"]
    document.getElementById("sidebar").appendChild(title)
    document.getElementById("sidebar").appendChild(text)
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
    node.classList.add("node")
    let pos = [Math.floor(Math.random()*90), Math.floor(Math.random()*90)]
    let parentWin = document.getElementById("mainWin")
    pos = [Math.floor((pos[0]/100)*parentWin.offsetWidth), Math.floor((pos[1]/100)*parentWin.offsetHeight)]
    console.log(pos)
    node.style.transform = "translate(" + pos[0] + "px" + ", " + pos[1] + "px)";
    let innerNode = document.createElement("div")
    node.appendChild(innerNode)
    noteId = await window.tomain.addNote(title, text, pos, currentNode)
    node.id = noteId
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
    node.onclick = (ev)=>{
        loadInfo(node.id)
        if (currentNode != null){
            let pos = parseTransform(document.getElementById(currentNode))
            document.getElementById(currentNode).style.transform = `translate(${pos[0]+5}px,${pos[1]+5}px)`
        }
        currentNode = node.id
        ev.stopPropagation()
    }
    node.ondblclick = ()=>{
        console.log("trying to open in separate window " + node.id)
    }
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
    updateParents()
}

async function updateParents(){
    let nodes = document.getElementsByClassName("node")
    for (let i = 0; i<nodes.length; i++){
        let nodeInfo = await window.tomain.getNote(nodes[i].id)
        if (nodeInfo["parent"] == null){
            continue
        }
        let connect = document.getElementById("connect"+nodeInfo["parent"]+"-"+nodes[i].id)
        if(connect == undefined){
            connect = document.createElement("div")
        }
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
        connect.id = "connect"+nodeInfo["parent"]+"-"+nodes[i].id
        document.getElementById("mainWin").appendChild(connect);
        console.log("Appended line")
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
