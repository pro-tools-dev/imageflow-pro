const { ipcRenderer } = require('electron');

// DOM Elements
const dragArea = document.getElementById('dragArea');
const browseBtn = document.getElementById('browseBtn');
const fileList = document.getElementById('fileList');
const filesContainer = document.getElementById('filesContainer');
const outputDir = document.getElementById('outputDir');
const selectOutputBtn = document.getElementById('selectOutputBtn');
const processBtn = document.getElementById('processBtn');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const currentFile = document.getElementById('currentFile');
const results = document.getElementById('results');

// Processing options
const formatRadios = document.querySelectorAll('input[name="format"]');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const losslessCheckbox = document.getElementById('lossless');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const resizeModeSelect = document.getElementById('resizeMode');
const maintainAspectCheckbox = document.getElementById('maintainAspect');
const suffixInput = document.getElementById('suffix');

// State
let selectedFiles = [];
let outputDirectory = '';
let isProcessing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set default output directory to Desktop
  const desktopPath = require('os').homedir() + '/Desktop/ImageFlow_Output';
  outputDir.value = desktopPath;
  outputDirectory = desktopPath;
  
  // Create directory if it doesn't exist
  require('fs').promises.mkdir(desktopPath, { recursive: true }).catch(() => {});
});

// Event Listeners
dragArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dragArea.classList.add('active');
});

dragArea.addEventListener('dragleave', () => {
  dragArea.classList.remove('active');
});

dragArea.addEventListener('drop', async (e) => {
  e.preventDefault();
  dragArea.classList.remove('active');
  
  const files = Array.from(e.dataTransfer.files).filter(file => 
    file.type.startsWith('image/') || 
    ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )
  );
  
  if (files.length > 0) {
    addFiles(files);
  }
});

browseBtn.addEventListener('click', async () => {
  const filePaths = await ipcRenderer.invoke('select-files');
  if (filePaths.length > 0) {
    const files = filePaths.map(path => ({
      name: require('path').basename(path),
      path: path,
      size: 0 // We'll get size later if needed
    }));
    addFiles(files);
  }
});

selectOutputBtn.addEventListener('click', async () => {
  const dir = await ipcRenderer.invoke('select-output-dir');
  if (dir) {
    outputDir.value = dir;
    outputDirectory = dir;
  }
});

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = `${qualitySlider.value}%`;
});

processBtn.addEventListener('click', async () => {
  if (selectedFiles.length === 0 || isProcessing) return;
  
  isProcessing = true;
  processBtn.disabled = true;
  processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
  
  // Show progress section
  progressSection.classList.remove('hidden');
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';
  currentFile.textContent = 'Starting processing...';
  results.innerHTML = '';
  
  // Get processing options
  const options = {
    outputDir: outputDirectory,
    suffix: suffixInput.value || 'processed'
  };
  
  // Format conversion
  const selectedFormat = Array.from(formatRadios).find(radio => radio.checked).value;
  if (selectedFormat !== 'original') {
    options.format = selectedFormat;
  }
  
  // Quality/Compression
  if (qualitySlider.value !== '80') {
    options.quality = parseInt(qualitySlider.value);
  }
  
  if (losslessCheckbox.checked) {
    options.lossless = true;
  }
  
  // Resize
  const width = widthInput.value ? parseInt(widthInput.value) : null;
  const height = heightInput.value ? parseInt(heightInput.value) : null;
  
  if (width || height) {
    options.resize = {
      width: width || null,
      height: height || null,
      fit: resizeModeSelect.value,
      withoutEnlargement: maintainAspectCheckbox.checked
    };
  }
  
  // Process files
  const filePaths = selectedFiles.map(file => file.path);
  
  try {
    const result = await ipcRenderer.invoke('process-multiple', filePaths, options);
    
    if (result.success) {
      // Update progress to 100%
      progressBar.style.width = '100%';
      progressPercent.textContent = '100%';
      currentFile.textContent = 'Processing complete!';
      
      // Show results
      result.results.forEach((item, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg';
        resultItem.innerHTML = `
          <div class="flex items-center space-x-3">
            <i class="fas fa-check-circle text-green-500"></i>
            <div>
              <div class="font-medium">${require('path').basename(item.input)}</div>
              <div class="text-sm text-gray-500">Saved to: ${require('path').basename(item.output)}</div>
            </div>
          </div>
          <button class="text-blue-500 hover:text-blue-700" onclick="openFile('${item.output.replace(/'/g, "\\'")}')">
            <i class="fas fa-folder-open"></i> Open
          </button>
        `;
        results.appendChild(resultItem);
      });
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'mt-4 p-4 bg-green-100 border border-green-300 rounded-lg';
      successMsg.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
          <div>
            <h4 class="font-medium text-green-800">Successfully processed ${result.results.length} images!</h4>
            <p class="text-green-700 text-sm mt-1">
              All images have been processed and saved to: ${outputDirectory}
            </p>
          </div>
        </div>
      `;
      results.appendChild(successMsg);
      
      // Donation reminder
      if (result.results.length >= 5) {
        const donationReminder = document.createElement('div');
        donationReminder.className = 'mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg';
        donationReminder.innerHTML = `
          <div class="flex items-center">
            <i class="fas fa-coffee text-yellow-500 text-xl mr-3"></i>
            <div>
              <h4 class="font-medium text-yellow-800">Enjoying ImageFlow Pro?</h4>
              <p class="text-yellow-700 text-sm mt-1">
                This tool is developed by a student developer. If you find it useful, please consider supporting my work!
              </p>
              <a href="https://buymeacoffee.com/jieyangjunq" 
                 target="_blank"
                 class="inline-block mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <i class="fas fa-coffee mr-1"></i> Support Development
              </a>
            </div>
          </div>
        `;
        results.appendChild(donationReminder);
      }
      
    } else {
      // Show error
      currentFile.textContent = `Error: ${result.error}`;
      currentFile.className = 'text-red-600 font-medium';
    }
    
  } catch (error) {
    currentFile.textContent = `Error: ${error.message}`;
    currentFile.className = 'text-red-600 font-medium';
  } finally {
    isProcessing = false;
    processBtn.disabled = false;
    processBtn.innerHTML = '<i class="fas fa-play"></i><span>Process Images</span>';
  }
});

// Helper Functions
function addFiles(files) {
  files.forEach(file => {
    // Check if file already exists
    const existingIndex = selectedFiles.findIndex(f => f.path === file.path);
    if (existingIndex === -1) {
      selectedFiles.push({
        name: file.name || require('path').basename(file.path),
        path: file.path || file,
        size: file.size || 0
      });
    }
  });
  
  updateFileList();
  updateProcessButton();
}

function updateFileList() {
  filesContainer.innerHTML = '';
  
  if (selectedFiles.length === 0) {
    filesContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No files selected</p>';
    return;
  }
  
  selectedFiles.forEach((file, index) => {
    const fileElement = document.createElement('div');
    fileElement.className = 'flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50';
    fileElement.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="fas fa-image text-blue-500"></i>
        <div>
          <div class="font-medium truncate max-w-xs">${file.name}</div>
          <div class="text-sm text-gray-500">${formatFileSize(file.size)}</div>
        </div>
      </div>
      <button class="text-red-500 hover:text-red-700" onclick="removeFile(${index})">
        <i class="fas fa-times"></i>
      </button>
    `;
    filesContainer.appendChild(fileElement);
  });
  
  fileList.querySelector('h3').textContent = `Selected Files (${selectedFiles.length})`;
}

function updateProcessButton() {
  processBtn.disabled = selectedFiles.length === 0 || isProcessing;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Global functions for inline event handlers
window.removeFile = function(index) {
  selectedFiles.splice(index, 1);
  updateFileList();
  updateProcessButton();
};

window.openFile = function(filePath) {
  require('electron').shell.openPath(filePath).catch(() => {
    // Fallback to showing in folder
    require('electron').shell.showItemInFolder(filePath);
  });
};

// Settings button
document.getElementById('settingsBtn').addEventListener('click', () => {
  alert('Settings will be available in the next version!');
});

// Update process button state initially
updateProcessButton();