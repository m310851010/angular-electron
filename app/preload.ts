const { ipcRenderer } = require('electron');
window.openWindow = options => ipcRenderer.sendSync('mdc.openWindow', options);

