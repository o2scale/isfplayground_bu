const { app, BrowserWindow, ipcMain, net, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const macaddress = require("macaddress");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'debug';
log.info('App starting...');
log.info(`🛠️  Current app version: ${app.getVersion()}`);
console.log("Electron log file location:", log.transports.file.getFile().path);

let mainWindow;
let mongoProcess;
let backendProcess;
let wasOffline = false;
let onlineStatus = true;

function checkOnlineStatus() {
  // console.log('this is working..., ------------------------>')
  const request = net.request(
    "https://playground.initiativesewafoundation.com/server/health"
  );

  request.on("response", (response) => {
    const isOnline = response.statusCode === 200;
    // console.log(isOnline, ">>>>>>>>>>>>>>>>", response);
    onlineStatus = isOnline;

    if (isOnline && wasOffline) {
      console.log("📶 Back online — syncing offline requests...");
      syncOfflineRequests();
    }

    wasOffline = !isOnline ? true : false;
  });

  request.on("error", (err) => {
    onlineStatus = false;
    wasOffline = true;
    console.log("❌ Still offline");
    // console.error("Error occurred in net.request:", err); 
  });

  request.end();
}

ipcMain.handle("get-online-status", () => onlineStatus);

function syncOfflineRequests() {
  const request = net.request({
    method: "POST",
    protocol: "http:",
    hostname: "localhost",
    port: 5001,
    path: "/api/offline-requests/sync",
  });

  request.setHeader("Content-Type", "application/json");
  request.on("response", (response) => {
    response.on("data", (chunk) => {
      console.log("✅ Sync response:", chunk.toString());
    });
  });

  request.end();
}

const isDev = !app.isPackaged;
const userDataPath = app.getPath("userData");

// Utility: resolves resource paths properly based on environment
const getResourcePath = (...segments) => {
  return path.join(isDev ? __dirname : process.resourcesPath, ...segments);
};

// Logs setup
const logsDir = getLogsDirectory();
const logFile = path.join(logsDir, "app.log");
fs.appendFileSync(logFile, `[${new Date().toISOString()}] App started\n`);

function getLogsDirectory() {
  const logsPath = path.join(userDataPath, "logs");
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, { recursive: true });
  }
  return logsPath;
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyNodeBinaryIfNeeded() {
  return new Promise((resolve, reject) => {
    ensureDirectoryExists(nodePaths.bin);

    let srcFile, destFile;
    if (process.platform === "darwin") {
      srcFile = path.join(nodePaths.originalBin, "node");
      destFile = path.join(nodePaths.bin, "node");
      // change the below code to working for mac os
      // if (!fs.existsSync(destFile)) {
      //     console.log(`Copying node binary to ${destFile}`);
      //     fs.copyFileSync(srcFile, destFile);
      //     fs.chmodSync(destFile, 0o755);
      // }
    } else {
      srcFile = path.join(nodePaths.originalBin, "node.exe");
      destFile = path.join(nodePaths.bin, "node.exe");
      if (!fs.existsSync(destFile)) {
        console.log(`Copying node binary to ${destFile}`);
        fs.copyFileSync(srcFile, destFile);
        fs.chmodSync(destFile, 0o755);
      }
    }

    resolve();
  });
}

const mongoPaths = {
  bin: path.join(userDataPath, "mongodb", "bin"),
  dbpath: path.join(userDataPath, "mongodb", "data"),
  initDumpPath: getResourcePath("backend", "db", "dump", "isfplayground"),
  originalBin: getResourcePath("resources", "mongodb", "bin"),
};

// const nodePaths = {
//   bin:
//     process.platform === "darwin"
//       ? path.join(userDataPath, "nodejs")
//       : "C:\\nodejs",
//   originalBin: getResourcePath("resources", "nodejs"),
// };

const nodePaths = {
  bin: path.join(userDataPath, "nodejs"),
  originalBin: getResourcePath("resources", "nodejs"),
};


function copyMongoBinariesIfNeeded() {
  return new Promise((resolve, reject) => {
    ensureDirectoryExists(mongoPaths.bin);

    fs.readdir(mongoPaths.originalBin, (err, files) => {
      if (err) return reject(err);

      for (const file of files) {
        const src = path.join(mongoPaths.originalBin, file);
        const dest = path.join(mongoPaths.bin, file);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(src, dest);
          fs.chmodSync(dest, 0o755);
        }
      }
      resolve();
    });
  });
}

function startMongoDB() {
  return new Promise((resolve, reject) => {
    ensureDirectoryExists(mongoPaths.dbpath);

    const mongodPath = path.join(mongoPaths.bin, "mongod");

    mongoProcess = spawn(mongodPath, ["--dbpath", mongoPaths.dbpath], {
      stdio: "inherit",
      windowsHide: true
    });

    mongoProcess.on("error", (err) => {
      console.error("Failed to start mongod:", err);
      reject(err);
    });

    setTimeout(() => {
      console.log("MongoDB server started");
      resolve();
    }, 3000);
  });
}

function restoreMongoIfEmpty() {
  return new Promise((resolve, reject) => {
    const mongoRestorePath = path.join(mongoPaths.bin, "mongorestore");

    if (!fs.existsSync(mongoPaths.initDumpPath)) {
      console.warn(
        "MongoDB dump directory not found:",
        mongoPaths.initDumpPath
      );
      return resolve();
    }

    console.log("Restoring MongoDB from dump...");

    const restoreProcess = spawn(mongoRestorePath, [
      "--drop",
      "--db",
      "isfplayground",
      mongoPaths.initDumpPath,
    ]);

    let stderrData = "";

    restoreProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    restoreProcess.on("close", (code) => {
      if (code === 0) {
        console.log("MongoDB dump restored successfully");
        resolve();
      } else {
        console.error("Failed to restore MongoDB dump. Exit code:", code);
        console.error("Error output:", stderrData);
        resolve(); // Continue even on failure
      }
    });

    restoreProcess.on("error", (err) => {
      console.error("Error executing mongorestore:", err);
      resolve();
    });
  });
}

function startBackendServer() {
  return new Promise(async (resolve, reject) => {
    console.log("🚀 Starting the Node app server");
    log.info("🚀 Starting the Node app server");
    const serverPath = getResourcePath("backend", "server.js");
    let nodePath = "";

    try {
      if (process.platform === "win32") {
        nodePath = path.join(nodePaths.bin, "node.exe");
      } else if (process.platform === "darwin") {
        const bundledNode = path.join(nodePaths.originalBin, "node");
        const destNode = path.join(nodePaths.bin, "node");

        if (fs.existsSync(bundledNode)) {
          console.log("📦 Using bundled Node.js for macOS");
          log.info("📦 Using bundled Node.js for macOS");

          if (!fs.existsSync(destNode)) {
            fs.mkdirSync(nodePaths.bin, { recursive: true });
            fs.copyFileSync(bundledNode, destNode);
            fs.chmodSync(destNode, 0o755);
          }

          nodePath = destNode;
        } else {
          console.log("🔍 Checking for system Node.js using 'which'...");
          log.info("🔍 Checking for system Node.js using 'which'...");

          nodePath = await new Promise((res) => {
            const whichNode = spawn("which", ["node"]);
            let result = "";

            whichNode.stdout.on("data", (data) => {
              result += data.toString();
            });

            whichNode.on("close", () => {
              const trimmed = result.trim();
              if (fs.existsSync(trimmed)) {
                res(trimmed);
              } else {
                res(""); // fallback if not found
              }
            });
          });

          if (!nodePath) {
            console.error("❌ Node.js not found in system PATH.");
            log.error("❌ Node.js not found in system PATH.");
            return reject(new Error("Node.js not found"));
          }

          console.log("✅ Found system Node.js at:", nodePath);
          log.info("✅ Found system Node.js at:", nodePath);
        }
      } else {
        // Other platforms
        nodePath = await new Promise((res) => {
          const whichNode = spawn("which", ["node"]);
          let result = "";

          whichNode.stdout.on("data", (data) => {
            result += data.toString();
          });

          whichNode.on("close", () => {
            const trimmed = result.trim();
            if (fs.existsSync(trimmed)) {
              res(trimmed);
            } else {
              res(""); // fallback
            }
          });
        });

        if (!nodePath) {
          console.error("❌ Node.js not found in PATH");
          log.error("❌ Node.js not found in PATH");
          return reject(new Error("Node.js not found"));
        }
      }

      if (!fs.existsSync(nodePath)) {
        console.error("❌ Final nodePath does not exist:", nodePath);
        log.error("❌ Final nodePath does not exist:", nodePath);
        return reject(new Error("Node binary does not exist"));
      }

      console.log("📦 nodePath:", nodePath);
      log.info("📦 nodePath:", nodePath);
      console.log("⏩ Checking if server.js exists at:", serverPath);
      log.info("⏩ Checking if server.js exists at:", serverPath);
      if (!fs.existsSync(serverPath)) {
        log.error("❌ Backend server.js not found at:", serverPath);
        return reject(new Error("Backend server.js not found"));
      }

      backendProcess = spawn(nodePath, [serverPath], {
        cwd: path.dirname(serverPath),
        stdio: "inherit",
        windowsHide: true,
      });

      backendProcess.on("error", (err) => {
        console.error("❌ Failed to start backend server:", err);
        log.error("❌ Failed to start backend server:", err);
        reject(err);
      });

      setTimeout(() => {
        console.log("✅ Backend server started");
        log.info("✅ Backend server started");
        resolve();
      }, 2000);

    } catch (err) {
      console.error("❌ Error starting backend:", err);
      log.error("❌ Error starting backend:", err);
      reject(err);
    }
  });
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
  mainWindow.loadURL("https://www.google.com");
}

// MAC address API
ipcMain.handle("get-mac-address", async () => {
  const os = require("os");
  const nets = os.networkInterfaces();
  let result = null;

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal && net.mac !== "00:00:00:00:00:00") {
        result = net.mac;
        break;
      }
    }
    if (result) break;
  }

  return result || "MAC not found";
});

// App lifecycle
app.whenReady().then(async () => {
  try {
    log.info("✅ App ready. Starting initialization...");

    log.info("⏳ Step 1: Copying Mongo binaries...");
    await copyMongoBinariesIfNeeded();
    log.info("✅ Mongo binaries copied.");

    log.info("⏳ Step 2: Copying Node binary...");
    // await copyNodeBinaryIfNeeded();
    log.info("✅ Node binary copied.");

    log.info("⏳ Step 3: Starting MongoDB...");
    await startMongoDB();
    log.info("✅ MongoDB started.");

    log.info("⏳ Step 4: Restoring MongoDB if empty...");
    await restoreMongoIfEmpty();
    log.info("✅ MongoDB restore step done.");

    log.info("⏳ Step 5: Starting backend server...");
    // await startBackendServer();
    log.info("✅ Backend server started.");

    log.info("⏳ Step 6: Setting online status check...");
    setInterval(checkOnlineStatus, 5000);

    log.info("⏳ Step 7: Creating main window...");
    await createWindow();
    log.info("✅ Main window created.");

    log.info("⏳ Step 8: Checking for updates...");
    autoUpdater.checkForUpdatesAndNotify();

  } catch (err) {
    log.error("❌ App initialization failed:", err);
    app.quit();
  }
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();

  if (mongoProcess) mongoProcess.kill();
  if (backendProcess) backendProcess.kill();
});

app.on("before-quit", () => {
  if (mongoProcess) mongoProcess.kill();
  if (backendProcess) backendProcess.kill();
});




// app.on("ready", () => {
//   // your usual app launching logic

// });
// --- Auto Updater Event Handlers ---
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
  // Optional: send status to renderer process
  // mainWindow.webContents.send('update-status', 'Checking for update...');
});


autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater. ' + err);
  // Optional: send status to renderer process
  // mainWindow.webContents.send('update-status', `Update error: ${err.message}`);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.', info);
  // Optional: send status to renderer process
  // mainWindow.webContents.send('update-status', 'You are running the latest version.');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available.', info);
  // Optional: send status to renderer process
  // mainWindow.webContents.send('update-status', `Update available: ${info.version}`);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
  // Send progress to renderer window
  // mainWindow.webContents.send('update-progress', progressObj.percent);
});


let updateDownloadedHandled = false; // Flag to prevent multiple dialogs

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded.', info);
  if (updateDownloadedHandled) {
    log.warn('Update downloaded event received again, ignoring.');
    return;
  }
  updateDownloadedHandled = true;

  // The update is ready. Prompt the user to restart.
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: `A new version (${info.version}) has been downloaded. Restart the application to apply the updates.`,
    buttons: ['Restart Now', 'Later'],
    defaultId: 0, // Default to Restart Now
    cancelId: 1 // If user closes dialog, it acts like "Later"
  }).then(({ response }) => {
    if (response === 0) {
      log.info('User chose to restart. Quitting and installing...');
      // Ensure processes are killed cleanly *before* quitAndInstall
      if (mongoProcess) mongoProcess.kill();
      if (backendProcess) backendProcess.kill();
      setImmediate(() => {
        autoUpdater.quitAndInstall();
      });
    } else {
      log.info('User chose "Later". Update will be installed on next quit.');
      // No action needed here, the update will be installed automatically
      // when the app quits normally because Squirrel (macOS/Windows) handles it.
    }
  }).catch(err => {
    log.error('Error showing update downloaded dialog:', err);
  }).finally(() => {
    // Reset flag if needed, though usually app restarts or quits after this
    // updateDownloadedHandled = false;
  });
});


// If user chooses "Later" and just closes the app manually
app.on("before-quit", () => {
  log.info("Application before-quit event");
  if (mongoProcess) {
    log.info("Killing MongoDB process...");
    mongoProcess.kill();
  }
  if (backendProcess) {
    log.info("Killing backend process...");
    backendProcess.kill();
  }
  // No need to call quitAndInstall here anymore, handle it in update-downloaded
});

autoUpdater.on('before-quit-for-update', () => {
  log.info("⚡ App is quitting to install the update.");
});


process.on("uncaughtException", (err) => {
  log.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  log.error("❌ Unhandled Rejection:", reason);
});
