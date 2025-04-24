const { app, BrowserWindow, ipcMain, net } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const macaddress = require("macaddress");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");



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
    console.log("starting the node app server ");
    const serverPath = getResourcePath("backend", "server.js");
    let nodePath;

    if (process.platform === "win32") {
      nodePath = path.join(nodePaths.bin, "node.exe");
    } else if (process.platform === "darwin") {
      // Check if Node.js is installed on macOS
      console.log("Checking for Node.js on macOS...");
      try {
        // First try to use the bundled node
        if (false) {
          // if (fs.existsSync(path.join(nodePaths.originalBin, 'node'))) {
          console.log("Using bundled Node.js");
          if (!fs.existsSync(nodePaths.bin)) {
            fs.mkdirSync(nodePaths.bin, { recursive: true });
          }
          if (!fs.existsSync(path.join(nodePaths.bin, "node"))) {
            fs.copyFileSync(
              path.join(nodePaths.originalBin, "node"),
              path.join(nodePaths.bin, "node")
            );
            fs.chmodSync(path.join(nodePaths.bin, "node"), 0o755);
          }
        } else {
          // If bundled node doesn't exist, try to find system node
          const whichNode = spawn("which", ["node"]);
          let systemNodePath = "";

          whichNode.stdout.on("data", (data) => {
            systemNodePath += data.toString().trim();
          });

          await new Promise((resolve) => whichNode.on("close", resolve));

          if (systemNodePath) {
            console.log(`Found system Node.js at: ${systemNodePath}`);
            // Create symlink to system node
            nodePaths.bin = path.dirname(systemNodePath);
          } else {
            console.error(
              "Node.js not found on system. Falling back to 'node' command"
            );
          }
        }
      } catch (err) {
        console.error(`Error finding Node.js: ${err.message}`);
      }
      nodePath = path.join(nodePaths.bin, "node");
    } else {
      // Fallback to system node for other platforms
      nodePath = "node";
    }

    console.log("📦 nodePath:", nodePath);

    // Only check if the file exists when using our bundled node
    if (nodePath !== "node") {
      console.log("📄 exists?", fs.existsSync(nodePath));
      console.log("📄 is file?", fs.statSync(nodePath).isFile());
    }

    console.log("⏩ Checking if server.js exists at:", serverPath);
    if (!fs.existsSync(serverPath)) {
      console.error("❌ Cannot find backend server at:", serverPath);
      return reject(new Error("Backend server.js not found"));
    }

    // Use platform-specific nodePath
    backendProcess = spawn(nodePath, [serverPath], {
      cwd: path.dirname(serverPath),
      stdio: "inherit",
      windowsHide: true
    });

    backendProcess.on("error", (err) => {
      console.error("Failed to start backend server:", err);
      reject(err);
    });

    setTimeout(() => {
      console.log("Backend server started");
      resolve();
    }, 2000);
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

  mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
  // mainWindow.loadURL("http://localhost:3000");
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
    await copyMongoBinariesIfNeeded();
    await copyNodeBinaryIfNeeded();
    await startMongoDB();
    await restoreMongoIfEmpty();
    await startBackendServer();
    setInterval(checkOnlineStatus, 5000);
    createWindow();
  } catch (err) {
    console.error("App initialization failed:", err);
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




app.on("ready", () => {
  // your usual app launching logic
  autoUpdater.checkForUpdatesAndNotify(); // Will check for updates when online
});