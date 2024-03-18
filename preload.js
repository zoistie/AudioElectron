const { contextBridge, ipcRenderer } = require('electron');

// Expose a function to the renderer process for sending audio data to main process
contextBridge.exposeInMainWorld('sendAudioToMain', {
  send: (blob) => {
    ipcRenderer.send('save-audio', blob);
  }
});

