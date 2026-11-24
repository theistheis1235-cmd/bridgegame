const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}
function drawConnection(node1, node2, dist=null) {
    ctx.strokeStyle = "#ff0000";
    if(dist != null) {
        ctx.strokeStyle = `rgba(${(Math.abs(dist)/(4))*255}, 0, 0, 1)`;
    }
    
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    ctx.lineTo(node2.x, node2.y);
    ctx.stroke(); 
}

const nodes = [];
const nodesCopy = [];
const firstBroken = {x1:null, y1:null, x2:null, y2:null};

function addNode(x, y, color, anchor=false) {
    const node = {
        x:x,
        y:y,
        color:color,
        vx:0,
        vy:0,
        connected:[],
        distance:[],
        anchor:anchor,
    };
    nodes.push(node);
    saveNodes();
    return node;
}
function connectNodes(node1, node2) {
    let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
    if(!node1.connected.includes(node2) && !node2.connected.includes(node1)) {
        node1.connected.push(node2);
        node1.distance.push(dist);
    }
}
function disconnectNodes(node1, node2) {
    if(node1.connected.includes(node2)) {
        let index = node1.connected.indexOf(node2)
        node1.connected.splice(index, 1);
        node1.distance.splice(index, 1);
        if(!frozen) {
            broken++;
            if(!firstBroken.x1) {
                firstBroken.x1 = node1.x;
                firstBroken.x2 = node2.x;
                firstBroken.y1 = node1.y;
                firstBroken.y2 = node2.y;

            }
        }
    }
    if(node2.connected.includes(node1)) {
        let index = node2.connected.indexOf(node1)
        node2.connected.splice(index, 1);
        node2.distance.splice(index, 1);
        if(!frozen) {
            broken++;
            if(!firstBroken.x1) {
                firstBroken.x1 = node1.x;
                firstBroken.x2 = node2.x;
                firstBroken.y1 = node1.y;
                firstBroken.y2 = node2.y;

            }
        }
    }
}
function deleteNode(node) {
    if(node.anchor || !frozen) {
        return;
    }
    for(const connection of node.connected) {
        disconnectNodes(node, connection);
    }
    for(const node2 of nodes) {
        if(node2.connected.includes(node)) {
            disconnectNodes(node2, node);
        }
    }
    nodes.splice(nodes.indexOf(node), 1);
    saveNodes();
}
function saveNodes() {
    console.log("saved");
    for(const node of nodes) {
        for(const connection of node.connected) {
            disconnectNodes(node, connection);
        }
    }
    for(let i = 0; i<nodes.length; i++) {
        nodesCopy[i] = structuredClone(nodes[i]);
    }
    saveLocal();
    for(const node1 of nodes) {
        for(const node2 of nodes) {
            if(node1!=node2) {
                let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
                if(dist<=55) {
                    connectNodes(node1, node2);
                }
            }
        }
    }
    for(const node of nodesCopy) {
        for(const connection of node.connected) {
            disconnectNodes(node, connection);
        }
    }
    nodesCopy.splice(nodes.length);
    
}
function loadNodes() {
    console.log("loaded");
    for(let i = 0; i<nodesCopy.length; i++) {
        nodes[i] = structuredClone(nodesCopy[i]);
    }
    nodes.splice(nodesCopy.length);
    for(const node of nodes) {
        for(const connection of node.connected) {
            disconnectNodes(node, connection);
        }
    }
    for(const node1 of nodes) {
        for(const node2 of nodes) {
            if(node1!=node2) {
                let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
                if(dist<=55) {
                    connectNodes(node1, node2);
                }
            }
        }
    }
    circle.x = 250;
    circle.y = 100;
    circle.vx = 0;
    circle.vy = 0;
    broken = 0;
}
function saveLocal() {
    
    try {
        localStorage.setItem('nodes', JSON.stringify(nodes));
    }
    catch {
        for(const node1 of nodes) {
            for(const node2 of nodes) {
                if(node1!=node2) {
                    let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
                    if(dist<=55) {
                        connectNodes(node1, node2);
                    }
                }
            }
        }
    }
    for(const node1 of nodes) {
        for(const node2 of nodes) {
            if(node1!=node2) {
                let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
                if(dist<=55) {
                    connectNodes(node1, node2);
                }
            }
        }
    }
}
function loadLocal() {
    const nodesC = JSON.parse(localStorage.getItem('nodes'));
    console.log("loaded");
    for(let i = 0; i<nodesC.length; i++) {
        nodes[i] = structuredClone(nodesC[i]);
    }
    nodes.splice(nodesC.length);
    for(const node of nodes) {
        for(const connection of node.connected) {
            disconnectNodes(node, connection);
        }
    }
    for(const node1 of nodes) {
        for(const node2 of nodes) {
            if(node1!=node2) {
                let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
                if(dist<=55) {
                    connectNodes(node1, node2);
                }
            }
        }
    }
}

for(let x = 0; x<3; x++) {
    for(let y = 0; y<3; y++) {
        if(y==0 && x==0) {
            //addNode(200+x*30-y, 200+y*30+x, "#000000", true);
        }
        else {
            //addNode(200+x*30-y, 200+y*30+x, "#000000", false);
        }
    }
}
let frozen = true;
if(JSON.parse(localStorage.getItem('nodes'))) {
    loadLocal();
}
else {
    addNode(100, 400, "#000000", true);
    addNode(400, 400, "#000000", true);
    addNode(110, 400, "#000000", true);
    addNode(390, 400, "#000000", true);
    addNode(90, 400, "#000000", true);
    addNode(410, 400, "#000000", true);
}
saveNodes();
/*
addNode(240, 450, "#000000", true);
addNode(250, 450, "#000000", true);
addNode(260, 450, "#000000", true);
*/


const circle = {
    x:250,
    y:100,
    vx:0,
    vy:0,
}
let steps = 20;

let circlemass = 1;
let broken = 0;
let first = true;
function tick() {
    if(first) {
        
    }
    first = false;
    ctx.fillStyle = "#afa0ff";
    ctx.fillRect(0, 0, 500, 500);
    drawCircle(mouseX, mouseY, 5, "#ff0000");
    document.getElementById('nodes').textContent = `Nodes:${nodes.length-6}, Broken:${broken}, Mass:${circlemass}`
    for(const node2 of nodes) {
        if(!deleting) {
            let dist = Math.sqrt((mouseX-node2.x)**2 + (mouseY-node2.y)**2);
            if(dist<=55) {
                drawConnection({x:mouseX, y:mouseY}, node2);
            }
        }
        else {
            let dist = Math.sqrt((mouseX-node2.x)**2 + (mouseY-node2.y)**2);
            if(dist<=25) {
                drawCircle(node2.x, node2.y, 8, "#ff0000");
            }
        }
    }
    
    for(let i = 0; i<steps; i++) {    
        drawCircle(circle.x, circle.y, 50, "#000000");
        if(!frozen) {
            circle.x += circle.vx/steps;
            circle.y += circle.vy/steps;
            circle.vy += 0.03/steps;
        }
        for(const node of nodes) {
            drawCircle(node.x, node.y, 5, node.color);
            if(!frozen) 
            {    if(node.y > 500) {
                    //node.y = 500;
                    //node.vy *= -0.99;
                    node.vy -= 0.01/steps;
                    node.vx *= 1-(0.03/steps);
                    node.vy *= 1-(0.03/steps);
                }
                if(node.x > 500) {
                    node.x = 500;
                    node.vx *= -0.99;
                }
                if(node.y < 0) {
                    node.y = 0;
                    node.vy *= -0.99;
                }
                if(node.x < 0) {
                    node.x = 0;
                    node.vx *= -0.99;
                }
                if(!node.anchor) {
                    node.x += node.vx/steps;
                    node.y += node.vy/steps;
                }
                node.vx *= 1-(0.005/steps);
                node.vy *= 1-(0.005/steps);
                node.vy += 0.02/steps;
                let dist = Math.sqrt((node.x-circle.x)**2 + (node.y-circle.y)**2);
                if(dist<50) {
                    let xcomp = (node.x-circle.x)/(Math.abs(node.x-circle.x)+Math.abs(node.y-circle.y));
                    let ycomp = (node.y-circle.y)/(Math.abs(node.x-circle.x)+Math.abs(node.y-circle.y));
                    node.vx += xcomp/(25/circlemass);
                    node.vy += ycomp/(25/circlemass);
                    circle.vx -= xcomp/(10*circlemass);
                    circle.vy -= ycomp/(10*circlemass);
                    circle.vy *= 0.995;
                    circle.vx *= 0.995;
                }
            }
            else {
                node.vx = 0;
                node.vy = 0;
                if(isNaN(node.x) || isNaN(node.y) || typeof(node.x) != 'number' || typeof(node.y) != 'number') {
                    deleteNode(node);
                }
            }
            
        }
        for(const node1 of nodes) {
            for(const node2 of node1.connected) {
                
                let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
                let change = node1.distance[node1.connected.indexOf(node2)]-dist;
                
                drawConnection(node1, node2, change);
                if(!frozen)
                {   let xcomp = (node1.x-node2.x)/(Math.abs(node1.x-node2.x)+Math.abs(node1.y-node2.y));
                    let ycomp = (node1.y-node2.y)/(Math.abs(node1.x-node2.x)+Math.abs(node1.y-node2.y));
                    node1.vx += 2*xcomp*change/(1*steps);
                    node2.vx -= 2*xcomp*change/(1*steps);
                    node1.vy += 2*ycomp*change/(1*steps);
                    node2.vy -= 2*ycomp*change/(1*steps);
                    if(Math.abs(change)>4) {
                        disconnectNodes(node1, node2);
                        node1.vx *= 0.5;
                        node2.vx *= 0.5;
                        node1.vy *= 0.5;
                        node2.vy *= 0.5;
                    }}
                    if(node1.anchor || node2.anchor) {
                        node1.vx *= 1-(0.04/steps);
                        node1.vy *= 1-(0.04/steps);
                        node2.vx *= 1-(0.04/steps);
                        node2.vy *= 1-(0.04/steps);
                    }
            };
            
        }
    }
    if(frozen && firstBroken.x1 != null) {
        drawConnection({x:firstBroken.x1, y:firstBroken.y1}, {x:firstBroken.x2, y:firstBroken.y2});
    }
}

function clearNodes() {
    localStorage.removeItem('nodes');
    nodes.splice(0);
    nodesCopy.splice(0);
    addNode(100, 400, "#000000", true);
    addNode(400, 400, "#000000", true);
    addNode(110, 400, "#000000", true);
    addNode(390, 400, "#000000", true);
    addNode(90, 400, "#000000", true);
    addNode(410, 400, "#000000", true);
    saveNodes();
    location.reload();
}

function saveNumber(number) {
    for(const node of nodes) {
        for(const connection of node.connected) {
            disconnectNodes(node, connection);
        }
    }
    localStorage.setItem(`nodes${number}`, JSON.stringify(nodes));
    for(const node1 of nodes) {
        for(const node2 of nodes) {
            if(node1!=node2) {
                let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
                if(dist<=55) {
                    connectNodes(node1, node2);
                }
            }
        }
    }
    location.reload()
}
function loadNumber(number) {
    if(!JSON.parse(localStorage.getItem(`nodes${number}`))) {
        return;
    }
    const nodesC = JSON.parse(localStorage.getItem(`nodes${number}`));
    console.log("loaded");
    for(let i = 0; i<nodesC.length; i++) {
        nodes[i] = structuredClone(nodesC[i]);
    }
    nodes.splice(nodesC.length);
    for(const node of nodes) {
        for(const connection of node.connected) {
            disconnectNodes(node, connection);
        }
    }
    for(const node1 of nodes) {
        for(const node2 of nodes) {
            if(node1!=node2) {
                let dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2);
                if(dist<=55) {
                    connectNodes(node1, node2);
                }
            }
        }
    }
    saveNodes();
    location.reload();
}
document.onkeydown = (event) => {
    if(event.key == "a") {
        for(const node of nodes) {
            node.vx -= 0.1;
        }
        circle.vx -= 0.05;
    }
    if(event.key == "d") {
        for(const node of nodes) {
            node.vx += 0.1;
        }
        circle.vx += 0.05;
    }
    if(event.key == "w") {
        for(const node of nodes) {
            node.vy -= 0.1;
        }
        circle.vy -= 0.05;
    }
    if(event.key == "s") {
        for(const node of nodes) {
            node.vy += 0.1;
        }
        circle.vy += 0.05;
    }
    if(event.key == 'c') {
        circle.x = 250;
        circle.y = 50;
        circle.vx = 0;
        circle.vy = 0;
    }
    if(event.key == " ") {
        event.preventDefault();
        if(frozen) {
            saveNodes();
            firstBroken.x1 = null;
            frozen = !frozen;
        }
        else {
            frozen = !frozen;
            loadNodes();
        }
        
    }
    if(event.key == "0") {
        deleting = !deleting;
    }
    if(event.key == 'p') {
        
        //saveNodes();
        
    }
    if(event.key == 'l') {
        //loadNodes();
        
    
    }
    if(event.key == 'ArrowLeft' && circlemass >1) {
        circlemass -= 1;
    }
    if(event.key == 'ArrowRight') {
        circlemass += 1;
    }
}
const nodescopy = [];
let deleting = false;
let mouseX = 0;
let mouseY = 0;
document.onmousemove = (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX-rect.left;
    mouseY = event.clientY-rect.top;
    
}
document.onmousedown = (event) => {
    if(!frozen) return;
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX-rect.left;
    let y = event.clientY-rect.top;
    if(x>500 || y>500 || x<0 || y<0) return;
    if(!deleting) {
        const node1 = addNode(x, y, "#000000");
    
        for(const node2 of nodes) {
            if(deleting || node1!=node2) {
                let dist = Math.sqrt((x-node2.x)**2 + (y-node2.y)**2);
                if(dist == 0) {
                    deleteNode(node1);
                    return;
                }
                if(dist<=55) {
                    if(!deleting) {
                        connectNodes(node1, node2);
                    }
                    else {
                        deleteNode(node2);
                    }
                }
            }
        }
    }
    else {
        for(const node2 of nodes) {
            if(deleting || node1!=node2) {
                let dist = Math.sqrt((x-node2.x)**2 + (y-node2.y)**2);
                if(dist<=25) {
                    if(!deleting) {
                        connectNodes(node1, node2);
                    }
                    else {
                        deleteNode(node2);
                    }
                }
            }
        }
    }
}

setInterval(tick, 15);
