const fs = require('fs');
const electron = require('electron')
const ipc = electron.ipcRenderer
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
`
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
}

function build(path) {
    let units = []
    document.body.innerText = "";
    document.write(buildHtml)
    document.write('Units:')
    //event listeners
    //add unit
    document.getElementById('add').addEventListener('click', () => {
        const unitLen = document.getElementById('unitLen')
        const name  = document.getElementById('unit')
        const len = Number(unitLen.value)
        if (isNaN(len)) {
            ipc.send('error-box-nan')
        }
        if (unitLen.value == "" || name.value == "") {
            ipc.send("error-box-fill-all")
        }
        else {
            document.write("<br><strong>Unit Name:</strong> " + name.value + "  <strong>Unit Length: </strong>" + len)
            units.push({"unitName" : name.value, "unitLength" : len})
            console.log(units)
            document.getElementById('unit').value = ""
            document.getElementById('unitLen').value = ""
        }
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
        else {
            const file = {
                "name" : name,
                "length" : length,
                "units" : units
            }
            try {
            fs.writeFileSync(path, JSON.stringify(file))
            document.body.innerHTML = openHml;
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
    console.log(arg)
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