// electron/main.js
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let djangoProcess;

// Función para obtener la ruta del backend
function getBackendPath() {
    if (app.isPackaged) {
        // En producción, el backend está en resources
        return path.join(process.resourcesPath, 'backend');
    } else {
        // En desarrollo
        return path.join(__dirname, '../backend');
    }
}

// Función para obtener la ruta del frontend
function getFrontendPath() {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'frontend', 'build');
    } else {
        return path.join(__dirname, '../frontend/build');
    }
}

// Iniciar servidor Django
function startDjango() {
    const backendPath = getBackendPath();
    
    console.log('Backend path:', backendPath);
    
    // Verificar si la base de datos existe
    const dbPath = path.join(backendPath, 'db.sqlite3');
    if (!fs.existsSync(dbPath)) {
        console.log('Base de datos no encontrada, se creará una nueva');
    }
    
    djangoProcess = spawn('python', ['manage.py', 'runserver', '8000'], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true
    });
    
    djangoProcess.stdout.on('data', (data) => {
        console.log(`Django: ${data}`);
        if (data.includes('Starting development server')) {
            console.log('Servidor Django iniciado correctamente');
        }
    });
    
    djangoProcess.stderr.on('data', (data) => {
        console.error(`Django Error: ${data}`);
    });
    
    djangoProcess.on('close', (code) => {
        console.log(`Django process exited with code ${code}`);
    });
}

// Crear ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'HAPPYPAW - Sistema Veterinario'
    });
    
    // Cargar la app React
    const frontendPath = getFrontendPath();
    const indexPath = path.join(frontendPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
    } else {
        mainWindow.loadURL('http://localhost:8000');
    }
    
    // Ocultar menú
    mainWindow.setMenuBarVisibility(false);
    
    // Abrir enlaces externos en el navegador
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Inicializar la aplicación
app.whenReady().then(() => {
    startDjango();
    
    // Esperar a que Django inicie
    setTimeout(() => {
        createWindow();
    }, 3000);
});

app.on('window-all-closed', () => {
    if (djangoProcess) {
        djangoProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});