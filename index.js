'use strict';
const path = require('path');
const {app, BrowserWindow, Menu, dialog} = require('electron');
const electron = require('electron')
const ipc = electron.ipcMain
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
const contextMenu = require('electron-context-menu');
const menu = require('./menu.js');

unhandled();
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.company.AppName');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		},
		title: app.name,
		show: false,
		width: 1200,
		height: 800
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});
	await win.loadFile(path.join(__dirname, 'index.html'));
	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});
ipc.on('open', (event, arg) => {
	const options = {
		// See place holder 1 in above image
		title : "Open a Course", 
		
		// See place holder 2 in above image
		defaultPath : "C://Users",
		
		// See place holder 3 in above image
		buttonLabel : "Open",
		
		// See place holder 4 in above image
		filters :[
		 {name: 'Teach App Course File', extensions: ['crse']}
		],
		properties: ['openFile']
	   }
	   
	   dialog.showOpenDialog(null, options).then((arg) => {
		   event.sender.send('openFilePath', arg)
	   })
})
ipc.on('error', (event, arg) => {
	console.log(arg)
	dialog.showErrorBox("An error has occured", toString(arg))
})
ipc.on('file-made', (event, arg) => {
	const options = {
		type: 'info',
		icon : './icon.png',
		buttons: ['Ok'],
		defaultId: 2,
		message: 'Your course was made successfully!',
	  };
	
	  dialog.showMessageBox(null, options, (response, checkboxChecked) => {
		console.log(response);
		console.log(checkboxChecked);
	  });
})
ipc.on('openSave', (event, arg) => {
	const options = {
		// See place holder 1 in above image
		title : "Make a new course", 
		
		// See place holder 2 in above image
		defaultPath : "C:\\Users",
		
		// See place holder 3 in above image
		buttonLabel : "Save",
		
		// See place holder 4 in above image
		filters :[
		 {name: 'Teach App Course File', extensions: ['crse']}
		],
		properties: ['openFile']
	   }
	dialog.showSaveDialog(null, options).then((arg) => {
		event.sender.send('savePath', arg)
	})
})
ipc.on('error-box-nan', (event, arg) => {
	dialog.showErrorBox("Error.", "Please use a valid number for the \"Length of unit\" field.")
})
ipc.on('error-box-fill-all', (event, arg) => {
	dialog.showErrorBox("Error.", "Please fill out all fields in ths \"Add new Unit\" section.")
})
ipc.on('error-box-nan-course', (event, arg) => {
	dialog.showErrorBox("Error.", "Please use a valid number for the \"Length in weeks\" field.")
})
ipc.on('error-box-fill-all-all', (event, arg) => {
	dialog.showErrorBox("Error.", "Please fill out all fields.")
})
ipc.on('build-done', (event, arg) => {
	let options;
	dialog.showMessageBox(null, options)
})
app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();
})();
