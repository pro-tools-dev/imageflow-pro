const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const os = require('os');
const LicenseManager = require('./license-manager');

let mainWindow;
const licenseManager = new LicenseManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // 開發者工具（開發時開啟）
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC處理圖片處理請求
ipcMain.handle('process-image', async (event, filePath, options) => {
  try {
    // 檢查限制
    const limits = await licenseManager.checkLimits();
    if (limits.limited) {
      return { success: false, error: limits.reason, limited: true };
    }
    
    const outputPath = await processImage(filePath, options);
    
    // 更新統計
    await licenseManager.incrementProcessed(1);
    
    return { success: true, outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('process-multiple', async (event, filePaths, options) => {
  try {
    // 檢查限制
    const limits = await licenseManager.checkLimits();
    if (limits.limited) {
      return { success: false, error: limits.reason, limited: true };
    }
    
    // 檢查文件數量是否超過限制
    const stats = await licenseManager.getStats();
    const remaining = limits.remaining || 100;
    
    if (filePaths.length > remaining) {
      return { 
        success: false, 
        error: `You can only process ${remaining} more files in the free version. Please reduce batch size or consider donating.`,
        limited: true 
      };
    }
    
    const results = [];
    for (const filePath of filePaths) {
      const outputPath = await processImage(filePath, options);
      results.push({ input: filePath, output: outputPath, success: true });
    }
    
    // 更新統計
    await licenseManager.incrementProcessed(filePaths.length);
    
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }
    ]
  });
  return result.filePaths;
});

ipcMain.handle('select-output-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

// 許可證相關IPC
ipcMain.handle('check-license', async () => {
  const license = await licenseManager.getLicense();
  const limits = await licenseManager.checkLimits();
  const stats = await licenseManager.getStats();
  const reminder = await licenseManager.showDonationReminder();
  
  return {
    hasLicense: !!(license && license.valid),
    limits,
    stats,
    reminder
  };
});

ipcMain.handle('activate-license', async (event, key) => {
  return await licenseManager.activateLicense(key);
});

ipcMain.handle('get-stats', async () => {
  return await licenseManager.getStats();
});

async function processImage(inputPath, options) {
  const ext = path.extname(inputPath).toLowerCase();
  const baseName = path.basename(inputPath, ext);
  const outputDir = options.outputDir || path.dirname(inputPath);
  
  let outputFileName = `${baseName}_processed`;
  if (options.suffix) {
    outputFileName = `${baseName}_${options.suffix}`;
  }
  
  let outputPath = path.join(outputDir, outputFileName + ext);
  
  // 如果存在同名文件，添加數字後綴
  let counter = 1;
  while (await fileExists(outputPath)) {
    outputPath = path.join(outputDir, `${outputFileName}_${counter}${ext}`);
    counter++;
  }
  
  let image = sharp(inputPath);
  
  // 應用處理選項
  if (options.resize && options.resize.width && options.resize.height) {
    image = image.resize(options.resize.width, options.resize.height, {
      fit: options.resize.fit || 'contain',
      withoutEnlargement: options.resize.withoutEnlargement || true
    });
  }
  
  if (options.quality && (ext === '.jpg' || ext === '.jpeg')) {
    image = image.jpeg({ quality: options.quality });
  } else if (options.quality && ext === '.webp') {
    image = image.webp({ quality: options.quality });
  }
  
  if (options.format && options.format !== ext.replace('.', '')) {
    const format = options.format.toLowerCase();
    outputPath = path.join(outputDir, outputFileName + '.' + format);
    
    switch (format) {
      case 'jpg':
      case 'jpeg':
        image = image.jpeg({ quality: options.quality || 80 });
        break;
      case 'png':
        image = image.png({ compressionLevel: options.compression || 6 });
        break;
      case 'webp':
        image = image.webp({ quality: options.quality || 80 });
        break;
    }
  }
  
  await image.toFile(outputPath);
  return outputPath;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}