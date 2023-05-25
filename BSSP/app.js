const { app, BrowserWindow, screen, dialog, ipcMain } = require('electron');
const fs = require('fs');
const sxcu = require('sxcu.api');

try {
    app.whenReady().then(async () => {
        const client = new (require('easy-presence').EasyPresence)("1097604211895718040");
        let currentRPCInfo = {};

        client.on("connected", () => {
            console.log("Connected to Discord");
        });

        const options = { openGraphProperties: { siteName: 'Test Image', discordHideUrl: false } };

        ipcMain.on('rpc', (event, msg) => {
            const data = JSON.parse(msg);

            const image = data.largeImage;

            sxcu.files
                .uploadFile(image, options)
                .then((res) => {
                    client.setActivity({
                        details: data.details,
                        type: 2,
                        state: data.state,
                        assets: {
                            large_image: res.thumbnail,
                            large_text: data.largeText,
                        },
                        timestamps: {
                            start: new Date(),
                            end: new Date(new Date().getTime() + (data.audioDuration * 1000))
                        }
                    });

                    currentRPCInfo = {
                        details: data.details,
                        state: data.state,
                        largeImage: res.thumbnail,
                        largeText: data.largeText,
                        audioDuration: data.audioDuration
                    };

                    setTimeout(() => {
                        fetch(res.deletionUrl);
                    }, data.audioDuration * 1000)
                })
                .catch((err) => {
                    console.log(err);
                });
        });

        ipcMain.on('pause', (event, msg) => {
            const data = JSON.parse(msg);

            if (data.paused) {
                client.setActivity({
                    details: "Paused",
                    assets: {
                        large_image: "bloq_art"
                    },
                    timestamps: {
                        start: new Date()
                    }
                });
            }

            else {
                client.setActivity({
                    details: currentRPCInfo.details,
                    state: currentRPCInfo.state,
                    assets: {
                        large_image: currentRPCInfo.largeImage,
                        large_text: currentRPCInfo.largeText,
                    },
                    timestamps: {
                        start: new Date(),
                        end: new Date(new Date().getTime() + ((currentRPCInfo.audioDuration - data.passed) * 1000))
                    }
                });
            };
        });

        ipcMain.on('changeTime', (event, msg) => {
            const data = JSON.parse(msg);

            client.setActivity({
                details: currentRPCInfo.details,
                state: currentRPCInfo.state,
                assets: {
                    large_image: currentRPCInfo.largeImage,
                    large_text: currentRPCInfo.largeText,
                },
                timestamps: {
                    start: new Date(),
                    end: new Date(new Date().getTime() + ((currentRPCInfo.audioDuration - data.passed) * 1000))
                }
            });
        });

        try {
            if (!fs.existsSync('./local_data')) fs.mkdirSync('./local_data');
            let path;
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width, height } = primaryDisplay.workAreaSize;

            let win;

            const createWindow = async () => {
                win = new BrowserWindow({
                    width,
                    height,
                    webPreferences: {
                        nodeIntegration: true,
                        preload: __dirname + '/preload.js',
                    },
                    autoHideMenuBar: true
                });

                await win.loadFile('./src/html/index.html');
            };

            createWindow();

            const songs = [];

            if (!fs.existsSync('./local_data/path')) {
                if (fs.existsSync('C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber\\Beat Saber_Data\\CustomLevels')) {
                    path = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber\\Beat Saber_Data\\CustomLevels';
                    fs.writeFileSync('./local_data/path', path);
                }

                else if (fs.existsSync('D:\\SteamLibrary\\steamapps\\common\\Beat Saber\\Beat Saber_Data\\CustomLevels')) {
                    path = 'C:\\Program Files\\Steam\\steamapps\\common\\Beat Saber\\Beat Saber_Data\\CustomLevels';
                    fs.writeFileSync('./local_data/path', path);
                }

                else if (fs.existsSync('C:\\Program Files (x86)\\Oculus\\Software\\Software\\hyperbolic-magnetism-beat-saber\\Beat Saber_Data\\CustomLevels')) {
                    path = 'C:\\Program Files (x86)\\Oculus\\Software\\Software\\hyperbolic-magnetism-beat-saber\\Beat Saber_Data\\CustomLevels';
                    fs.writeFileSync('./local_data/path', path);
                }
            }


            if (fs.existsSync('./local_data') && fs.existsSync('./local_data/path')) {
                path = String(fs.readFileSync('./local_data/path', 'utf-8'));

                const maps = fs.readdirSync(path, "utf-8");

                new Promise((resolve, reject) => {
                    maps.forEach(async (map) => {
                        const files = fs.readdirSync(`${path}/${map}`, "utf-8");

                        let newName = map;
                        if (map.includes("#") || map.includes("%")) return;

                        files.forEach((file) => {
                            if (file === "Info.dat") {
                                const data = JSON.parse(fs.readFileSync(`${path}/${map}/${file}`, 'utf8'));

                                songs.push({
                                    name: data._songName,
                                    artist: data._songAuthorName,
                                    song: data._songFilename,
                                    image: `${path}/${newName}/${data._coverImageFilename}`,
                                    song: `${path}/${newName}/${data._songFilename}`
                                });
                            }
                        });
                    });

                    resolve();
                })
                    .then(() => {
                        const chunks = [];
                        const chunkSize = 200;
                        for (let i = 0; i < songs.length; i += chunkSize) {
                            chunks.push(songs.slice(i, i + chunkSize));
                        }

                        win.webContents.once('did-finish-load', () => {
                            chunks.forEach((chunk) => {
                                win.webContents.send('songs', JSON.stringify({
                                    type: 'songs',
                                    data: chunk,
                                    max: songs.length
                                }));
                            });
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }

            else {

                dialog.showMessageBoxSync({
                    title: 'Custom Songs Folder',
                    message: 'Please select your custom songs folder.',
                    buttons: ['OK'],
                });

                const pathDia = dialog.showOpenDialogSync({
                    title: 'Select Custom Songs Folder',
                    properties: ['openFile', 'openDirectory'],
                });

                path = pathDia[0];
                const maps = fs.readdirSync(path, "utf-8");

                new Promise((resolve, reject) => {
                    maps.forEach((map) => {
                        const files = fs.readdirSync(`${path}/${map}`, "utf-8");

                        let newName = map;
                        if (map.includes("#") || map.includes("%")) {
                            newName = map.replace(/#/g, "").replace(/%/g, "");
                            fs.renameSync(`${path}/${map}`, `${path}/${newName}`);
                        }

                        files.forEach((file) => {
                            if (file === "Info.dat") {
                                const data = JSON.parse(fs.readFileSync(`${path}/${map}/${file}`, 'utf8'));

                                songs.push({
                                    name: data._songName,
                                    artist: data._songAuthorName,
                                    song: data._songFilename,
                                    image: `${path}/${newName}/${data._coverImageFilename}`,
                                    song: `${path}/${newName}/${data._songFilename}`
                                });
                            }
                        });
                    });

                    resolve();
                })
                    .then(() => {
                        const chunks = [];
                        const chunkSize = 200;
                        for (let i = 0; i < songs.length; i += chunkSize) {
                            chunks.push(songs.slice(i, i + chunkSize));
                        }

                        win.webContents.once('did-finish-load', () => {
                            chunks.forEach((chunk) => {
                                win.webContents.send('songs', JSON.stringify({
                                    type: 'songs',
                                    data: chunk,
                                    max: songs.length
                                }));
                            });
                        });

                        fs.writeFileSync('./local_data/path', pathDia[0]);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    createWindow();
                }
            });
        } catch (e) {
            throw e;
        }
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

} catch (e) {
    dialog.showMessageBoxSync({
        title: 'Error',
        message: "Internal Error.",
        buttons: ['OK']
    });
}