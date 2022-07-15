const fs = require('fs');
const electron = require('electron')
const ipc = electron.ipcRenderer
const d3 = require('./d3.min.js');
const { strict } = require('assert');
const { EventEmitter } = require('stream');
const res = electron.screen
const openHml = `
<!doctype html>
<html>
	<head>
		
		<meta charset="utf-8">
		<link rel="stylesheet" href="index.css" />
		</head>
		<body>
			
			<div class="wrap">
				<h1>Teach App</h1>
				<img src="icon.png" />
			</div>
			<br>
			<h2>Choose an option:</h2>
			<button class="open" id="open">Open a Course</button>
			<button class="open" id="make">Make a Course</button>			
			<p><span id="red">A</span><span id="orange">B</span><span id="yellow">C</span><span id="green">1</span><span id="blue">2</span><span id="purple">3</span></p>
			<pre>&copy; Copyright 2021 Thomas-Humphrey Development. All rights reserved.</pre>
	</div>
	<script>
		require('./render.js')
	</script>
	</body>
</html>
`
const buildHtml = `
<link rel="stylesheet" href="index.css" />
Name of Course: <input id="name" required/><br>
Number of Weeks: <input id="length" required/><br>
Add a Unit: &emsp;&emsp;&emsp; Name of unit  <input id="unit" required>Length of Unit: <input id="unitLen" required><button id="add" type="submit">Add Unit</button><br>
<button id="submit">Make this Course!</button><br>
<div>Number of weeks left: <span id="weeks-left"></span></div>
`

function calculateInterval(a, l) {
    if (l == 0) {
        return 0
    }
    let final = 0
    for (let i = 0; i < l; i++) {
        final += a[i]
    }
    return final
}
function getScale (v, s) {
    let largest = v.reduce((a,b) => {
        return Math.max(a,b)
    })
    let c = (s/largest)/v.length/0.75
    return c
}
function vis (arg) {
    const bar_width = 70
    const padding = 0
    const w = 2000
    const h = 1000
    //clear DOM
    document.body.innerHTML = "";
    document.write('<link rel="stylesheet" href="index.css" />')

    //convert data
    const raw = fs.readFileSync(arg, null)
    const data  = JSON.parse(raw)
    let labels = []
    let dataset = []
    let units = data.units
    for (let i = 0; i < units.length; i++) {
        let name = units[i].unitName
        console.log(name)
        labels.push(name)
        let len = units[i].unitLength
        console.log(len)
        dataset.push(len)
    }
    document.write('<h2>Course: ' + String(data.name) + '</h2>')
    const m = getScale(dataset, w)
    //d3
    let svg = d3.select('body')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            //console.log(i)
            return (calculateInterval(dataset, i))*m
        })
        .attr('y', function(d, i){
            return i *(bar_width + padding)
        })
        .attr('height', bar_width)
        .attr('width', function (d) {
            return d*m
        })
        .attr("fill", "#d02420")
    svg.selectAll("text")
    .data(labels)
    .enter()
    .append("text")
    .attr('x', (d, i) => {
        return ((calculateInterval(dataset, i))*m)+10
    })
    .attr('fill', "#FFFFDD")
    .attr('font-family', 'sans-serif') 
    .attr('font-size', '14px')
    .attr("y", (d, i) => {
        return i * (bar_width) + 15
    })
    .text((d, i) => {
        return d + "\t" + dataset[String(i)]
    })
    document.write('<button id="reload">Go Back to Home</button>')
    document.getElementById('reload').addEventListener('click', () => {
        ipc.send('reload')
    })
}
function events () {
    document.getElementById('open').addEventListener('click', () => {
        console.log('click')
        ipc.send('open')
    })
    ipc.on('openFilePath', (event, arg) => {
        console.log(arg)
    })
    //save event listener and IPC for filepath
    document.getElementById('make').addEventListener("click", () => {
        ipc.send('openSave')
    })
    ipc.on('savePath', (event, arg) => {
        console.log(typeof(arg))
        build((arg.filePath))
        console.log("build done")
    })
    ipc.on('build-file-from-bar', (event, arg) => {
        console.log(event, arg)
    })
    document.getElementById('change').addEventListener('click', () => {
        ipc.send("showchangelog");
        console.log('1')
    })
}
events()
function build(path) {
    let weeks_used = 0
    let units = []
    document.body.innerText = "";
    document.write(buildHtml)
    document.write('Units:')
    //event listeners
    //add unit
    document.getElementById('add').addEventListener('click', () => {
        const length = document.getElementById('length').value
        let unitLen = document.getElementById('unitLen')
        const name  = document.getElementById('unit')
        unitLen = Number(unitLen.value)
        const len = unitLen
        
        //document.getElementById('weeks-left').innerHTML = document.getElementById('length').value - weeks_used
        if (unitLen.value == "" || name.value == "") {
            ipc.send("error-box-fill-all")
        }
        if (isNaN(len)) {
            ipc.send('error-box-nan')
            document.getElementById('unitLen').value = ""
        }
        if (!(unitLen.value == "" || name.value == "") && !(isNaN(len))) {
            if (length - weeks_used - unitLen > -1) {
                document.write("<br><strong>Unit Name:</strong> " + name.value + "  <strong>Unit Length: </strong>" + len)
                console.log((document.getElementById('length') - weeks_used) - unitLen.value)
                weeks_used += unitLen;
                units.push({"unitName" : name.value, "unitLength" : len})
                console.log(units)
                document.getElementById('unit').value = ""
                document.getElementById('unitLen').value = ""
        }}
    })
    document.getElementById('length').addEventListener('input', () => {
        document.getElementById('weeks-left').innerHTML = document.getElementById('length').value - weeks_used
    })
    
    //submit
    document.getElementById('submit').addEventListener('click', () => {
        const name = document.getElementById('name').value
        const length = document.getElementById('length').value
        if(isNaN(length)) {
            ipc.send('error-box-nan-course')
        }
        if (name == "" || length == "") {
            ipc.send("error-box-fill-all-all")
        }
        if ((!(isNaN(length))) && (name != "" && length != "")) {
            const file = {
                "name" : name,
                "length" : length,
                "units" : units
            }
            try {
            fs.writeFileSync(path, JSON.stringify(file))
            document.body.innerHTML = openHml;
            ipc.send('file-made')
            events()
            return;
            }
            catch (error) {
                document.body.innerHTML = openHml;
                ipc.send('error', error)
                events()
                return;
                console.log("build still running")
            }
    }
    })
}

//open event listener and  IPC for the filepath
document.getElementById('open').addEventListener('click', () => {
    console.log('click')
    ipc.send('open')
})
ipc.on('openFilePath', (event, arg) => {
    console.log(arg.filePaths[0])
    if (!(arg.canceled)) {
        vis(arg.filePaths[0])
    }
})
//save event listener and IPC for filepath
document.getElementById('make').addEventListener("click", () => {
    ipc.send('openSave')
})
ipc.on('savePath', (event, arg) => {
    console.log(typeof(arg))
    if (arg.canceled === false) {
        build((arg.filePath))
        console.log("build done")
    }
})