const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
// Function to create the main window
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

// Create the main window when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Activate the main window when the app is activated, except on macOS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('save-audio', async (event, buffer) => {
  try {
      const filename = 'audio.wav'; // Specify the desired filename and extension
      const filePath = path.join(__dirname, filename); // Get the full path within the working directory

      // Write the buffer data to a file
      fs.writeFile(filePath, Buffer.from(buffer), (err) => {
          if (err) {
              console.error('Error writing file:', err);
              event.reply('save-audio-response', { success: false, error: err.message });
          } else {
              console.log('File saved successfully:', filePath);
              event.reply('save-audio-response', { success: true, filename: filePath });
          }
      });
      runPythonFunction('transcribe', (err, result) => {
        if (err) {
            console.error('Error running Python function:', err);
        } else {
            console.log('Result from Python:', result);
        }
    });
  } catch (error) {
      console.error('Error:', error);
      event.reply('save-audio-response', { success: false, error: error.message });
  }
});



function runPythonFunction(functionName, callback) {
  exec(`python check.py ${functionName}`, (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          callback(error, null);
          return;
      }
      if (stderr) {
          console.error(`stderr: ${stderr}`);
          callback(stderr, null);
          return;
      }
      callback(null, stdout.trim());
  });
}
