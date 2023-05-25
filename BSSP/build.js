const builder = require('electron-builder');
const Platform = builder.Platform;

builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
        appId: "com.electron.beatify",
        productName: "Beatify",
        nsis: {
            allowToChangeInstallationDirectory: true,
            oneClick: false,
            installerIcon: "./src/icon.ico"
        },
        icon: "./src/icon.ico",
        portable: {
            artifactName: "Beatify.exe"
        }
    }
}).then(() => {
    console.log("Build complete");
}).catch((error) => {
    console.log(error);
});