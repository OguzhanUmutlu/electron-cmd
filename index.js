const {app, BrowserWindow, ipcMain, globalShortcut} = require("electron");
const path = require("path");
const child_process = require("child_process");

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.setMenu(null);
    await win.loadFile('index.html');
    win.on("close", () => app.quit());
    let cacheString = "";
    let currentCmd = null;
    ipcMain.handle("input", (ev, input) => {
        if(!currentCmd)
        return new Promise(res => {
            let r = () => {
                currentCmd = null;
                res();
            };
            const e = currentCmd = child_process.exec(input, (err, stdout, stderr) => {
                cacheString += stdout;
                cacheString += stderr;
                cacheString += err ? err.toString() : "";
                cacheString = "\n";
            });
            e.on("message", (...a) => console.log("message", a));
            e.on("close", code => {
                cacheString += "Closed the process with the code " + code + "\n";
                r();
            });
            e.on("exit", code => {
                cacheString += "Exited the process with the code " + code + "\n";
                r();
            });
            e.on("disconnect", r);
        });
    });
    ipcMain.handle("cacheString", () => {
        let t = cacheString;
        cacheString = "";
        return t;
    });
    ipcMain.handle("controlC", () => {
        if(currentCmd) currentCmd.kill();
    });
    globalShortcut.register("CommandOrControl+R", () => win.webContents.reload());
    globalShortcut.register("CommandOrControl+D", () => win.webContents.toggleDevTools());
});