let chart = null;
let rawData = [];
let selectedFiles = new Map(); 
let chartData = {
    male: {
        count: 0,
        sum: 0,
        average: 0,
        min: Infinity,
        max: -Infinity,
        validScores: []
    },
    female: {
        count: 0,
        sum: 0,
        average: 0,
        min: Infinity,
        max: -Infinity,
        validScores: []
    }
};
let isProcessing = false;
let genderDistributionChart = null;
let scoreDistributionChart = null;
let scoreRangeChart = null;
let loadingProgress = 0;

document.addEventListener('DOMContentLoaded', function() {
    setupFileUpload();

    initializeEventListeners();

    initializeDragAndDrop();

    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const message = e.target.getAttribute('data-tooltip');
            showTooltip(message, e.target);
        });
        
        element.addEventListener('mouseleave', () => {
            hideTooltip();
        });
    });

    initializeTouchEvents();

    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            if (chart) createChart();
            if (genderDistributionChart) createGenderDistributionChart();
            if (scoreDistributionChart) createScoreDistributionChart();
            if (scoreRangeChart) createScoreRangeChart();
        }, 100);
    });

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (chart) createChart();
            if (genderDistributionChart) createGenderDistributionChart();
            if (scoreDistributionChart) createScoreDistributionChart();
            if (scoreRangeChart) createScoreRangeChart();
        }, 250);
    });

    showWelcomeScreen();
    
    updateButtonLayout();
    
    console.log('Document fully loaded and initialized');
});

function setupFileUpload() {
    console.log('Setting up file upload functionality');

    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (!fileInput || !uploadBtn) {
        console.error('File input or upload button not found, creating them');

        let uploadPanel = document.querySelector('.upload-panel');
        if (!uploadPanel) {
            console.log('Creating missing upload panel');
            uploadPanel = document.createElement('div');
            uploadPanel.className = 'upload-panel';
            
            const fileInputContainer = document.querySelector('.file-input-container');
            if (fileInputContainer) {
                fileInputContainer.appendChild(uploadPanel);
            } else {
                console.error('No file input container found');
                return;
            }
        }

        let uploadButtonArea = uploadPanel.querySelector('.upload-button-area');
        if (!uploadButtonArea) {
            console.log('Creating missing upload button area');
            uploadButtonArea = document.createElement('div');
            uploadButtonArea.className = 'upload-button-area';
            uploadPanel.appendChild(uploadButtonArea);
        }

        let fileActions = uploadButtonArea.querySelector('.file-actions');
        if (!fileActions) {
            console.log('Creating missing file actions container');
            fileActions = document.createElement('div');
            fileActions.className = 'file-actions';
            uploadButtonArea.appendChild(fileActions);
        }

        if (!document.getElementById('fileList')) {
            console.log('Creating missing file list');
            const fileList = document.createElement('div');
            fileList.id = 'fileList';
            fileList.className = 'file-list';
            uploadButtonArea.insertBefore(fileList, fileActions);
        }

        if (!document.getElementById('clearAllBtn')) {
            console.log('Creating missing clear all button');
            const clearAllBtn = document.createElement('button');
            clearAllBtn.id = 'clearAllBtn';
            clearAllBtn.className = 'clear-all-btn';
            clearAllBtn.style.display = 'none';
            clearAllBtn.dataset.tooltip = 'Remove all uploaded files';
            clearAllBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear All';
            fileActions.appendChild(clearAllBtn);
        }

        if (!uploadBtn) {
            console.log('Creating missing upload button');
            const newUploadBtn = document.createElement('button');
            newUploadBtn.id = 'uploadBtn';
            newUploadBtn.className = 'upload-btn';
            newUploadBtn.dataset.tooltip = 'Upload CSV or Excel files (.csv, .xlsx, .xls)';
            newUploadBtn.innerHTML = '<i class="fas fa-file-upload"></i> Upload File';
            fileActions.appendChild(newUploadBtn);
        }

        if (!fileInput) {
            console.log('Creating missing file input');
            const newFileInput = document.createElement('input');
            newFileInput.type = 'file';
            newFileInput.id = 'fileInput';
            newFileInput.accept = '.csv,.xlsx,.xls';
            newFileInput.multiple = true;
            fileActions.appendChild(newFileInput);
        }
    }

    const currentFileInput = document.getElementById('fileInput');
    const currentUploadBtn = document.getElementById('uploadBtn');
    
    if (currentFileInput && currentUploadBtn) {
        currentFileInput.replaceWith(currentFileInput.cloneNode(true));
        currentUploadBtn.replaceWith(currentUploadBtn.cloneNode(true));

        const newFileInput = document.getElementById('fileInput');
        const newUploadBtn = document.getElementById('uploadBtn');

        newUploadBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log('Upload button clicked once');
            newFileInput.click();
        }, { once: false });

        newFileInput.addEventListener('change', handleFileSelect);
        
        console.log('File upload event listeners attached');
    }

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.replaceWith(clearAllBtn.cloneNode(true));
        document.getElementById('clearAllBtn').addEventListener('click', clearAllFiles);
    }

    createFilePanels();
}

function showWelcomeScreen() {
    const container = document.querySelector('.container');
    const welcomeSection = document.createElement('div');
    welcomeSection.className = 'welcome-section fade-in';
    welcomeSection.innerHTML = `
        <div class="welcome-message">
            <h2>Welcome to Student Score Analysis</h2>
            <p>Upload your data to see comprehensive gender-based score analysis with interactive visualizations.</p>
            <div class="features-grid">
                <div class="feature-card">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Score Comparisons</h3>
                    <p>Compare average scores between gender groups</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-calculator"></i>
                    <h3>Statistical Analysis</h3>
                    <p>View detailed calculations and methodologies</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-lightbulb"></i>
                    <h3>Insightful Findings</h3>
                    <p>Get AI-generated insights from your data</p>
                </div>
            </div>
            <div class="example-charts">
                <h3>Example Visualizations</h3>
                <div class="example-previews">
                    <img src="https://via.placeholder.com/300x180?text=Score+Comparison+Chart" alt="Example chart" class="example-chart">
                    <img src="https://via.placeholder.com/300x180?text=Distribution+Analysis" alt="Example chart" class="example-chart">
                </div>
                <p class="try-message">Upload your CSV or Excel file to get started!</p>
            </div>
        </div>
    `;

    const header = document.querySelector('.header');
    container.insertBefore(welcomeSection, header.nextSibling);

    document.getElementById('fileInput').addEventListener('change', function() {
        welcomeSection.classList.add('fade-out');
        setTimeout(() => {
            welcomeSection.style.display = 'none';
        }, 300);
    });
}

function initializeEventListeners() {

    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', openHelpModal);
    }

    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeHelpModal);
    }

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('helpModal');
        if (event.target === modal) {
            closeHelpModal();
        }
    });

    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }

    const exportChartBtn = document.getElementById('exportChartBtn');
    if (exportChartBtn) {
        exportChartBtn.addEventListener('click', exportChart);
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeData);
    }

    const insightsBtn = document.getElementById('insightsBtn');
    if (insightsBtn) {
        insightsBtn.addEventListener('click', toggleInsights);
    }
    
    const closeInsights = document.getElementById('closeInsights');
    if (closeInsights) {
        closeInsights.addEventListener('click', toggleInsights);
    }

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllFiles);
    }

    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('copy-formula')) {
            copyToClipboard(e.target.dataset.formula);
        }
    });

    const uploadArea = document.querySelector('.file-input-container');
    if (uploadArea) {
        const demoButton = document.createElement('button');
        demoButton.className = 'demo-btn';
        demoButton.innerHTML = '<i class="fas fa-play-circle"></i> Try with Sample Data';
        demoButton.addEventListener('click', loadSampleData);

        const separator = document.createElement('div');
        separator.className = 'separator';
        separator.innerHTML = '<span>or</span>';

        const fileActions = document.querySelector('.file-actions');
        if (fileActions) {
            fileActions.parentNode.insertBefore(separator, fileActions.nextSibling);
            fileActions.parentNode.insertBefore(demoButton, separator.nextSibling);
        }
    }
    
    console.log('Event listeners initialized (excluding file upload handlers)');
}

function initializeDragAndDrop() {
    const dropArea = document.querySelector('.file-drop-area');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('active');
    }
    
    function unhighlight() {
        dropArea.classList.remove('active');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            Array.from(files).forEach(file => {
                addFileToList(file);
            });
        }
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        console.log(`Selected ${files.length} files through file input`);

        selectedFiles.clear();

        Array.from(files).forEach(file => {
            console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
            addFileDirectly(file);
        });

        event.target.value = '';
    } else {
        console.log("No files were selected");
    }
}

function addFileDirectly(file) {
    const validation = validateFile(file);
    
    if (validation.errors.length > 0) {
        validation.errors.forEach(error => showError(error));
        return;
    }

    const fileId = Date.now() + '-' + file.name;
    console.log(`Adding file directly: ${file.name} with ID ${fileId}`);

    selectedFiles.set(fileId, file);

    updateTopFileInfoPanel();
    updateBottomStatusPanel();

    validation.warnings.forEach(warning => {
        showWarning(warning);
    });

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.style.display = 'inline-flex';
    }

    processFilesImmediately();

    updateButtonLayout();
}

function validateFile(file) {
    const errors = [];
    const warnings = [];

    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
        errors.push(`File '${file.name}' is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`);
    }

    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type)) {
        errors.push(`File '${file.name}' has invalid type '${file.type}'. Accepted formats: CSV, XLS, XLSX.`);
    }

    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(extension)) {
        errors.push(`File '${file.name}' has invalid extension '${extension}'. Accepted extensions: .csv, .xls, .xlsx`);
    }
    
    return { errors, warnings };
}

function addFileToList(file) {
    const validation = validateFile(file);
    
    if (validation.errors.length > 0) {
        validation.errors.forEach(error => showError(error));
        return;
    }

    const fileId = Date.now() + '-' + file.name;
    if (!selectedFiles.has(fileId)) {
        selectedFiles.set(fileId, file);

        updateFileDisplays();

        validation.warnings.forEach(warning => {
            showWarning(warning);
        });

        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.style.display = 'inline-flex';
        }

        handleFiles();

        updateButtonLayout();

        console.log('Added file to list:', file.name);
    }
}

function updateFileDisplays() {
    updateTopFileInfoPanel();

    updateBottomStatusPanel();

    updateFileList();
}

function updateTopFileInfoPanel() {
    const fileInfoPanel = document.getElementById('fileInfoPanel');
    const fileInfoContent = document.getElementById('fileInfoContent');
    
    if (!fileInfoPanel || !fileInfoContent) return;
    
    if (selectedFiles.size === 0) {
        fileInfoContent.innerHTML = 'No files uploaded yet';
        fileInfoPanel.classList.remove('has-files');
    } else {
        let filesList = '';
        selectedFiles.forEach((file, fileId) => {
            filesList += `
                <div class="file-info-item">
                    <i class="${getFileIconClass(file.type)}"></i>
                    <span class="file-info-name">${file.name}</span>
                    <span class="file-info-size">(${(file.size / 1024).toFixed(2)} KB)</span>
                    <button class="file-info-remove" onclick="removeFile('${fileId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        
        fileInfoContent.innerHTML = filesList;
        fileInfoPanel.classList.add('has-files');
    }
}

function updateBottomStatusPanel() {
    const fileStatusPanel = document.getElementById('fileStatusPanel');
    const fileStatusMessage = document.getElementById('fileStatusMessage');
    
    if (!fileStatusPanel || !fileStatusMessage) return;
    
    if (selectedFiles.size === 0) {
        fileStatusMessage.innerHTML = 'Ready to upload - no files selected';
        fileStatusPanel.classList.remove('has-files');
    } else {
        const fileCount = selectedFiles.size;
        const fileNames = Array.from(selectedFiles.values())
            .map(file => file.name)
            .join(', ');
        
        fileStatusMessage.innerHTML = `<strong>${fileCount} file${fileCount > 1 ? 's' : ''} selected:</strong> ${fileNames}`;
        fileStatusPanel.classList.add('has-files');
    }
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    fileList.innerHTML = '';

    if (selectedFiles.size > 0) {
        selectedFiles.forEach((file, fileId) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item fade-in';
            fileItem.id = fileId;

            const fileSize = (file.size / 1024).toFixed(2) + ' KB';
            const fileType = file.type || 'Unknown type';

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.setAttribute('data-filename', file.name); 
            fileName.innerHTML = `
                <i class="${getFileIconClass(file.type)}"></i>
                <div class="file-details">
                    <span class="file-title">${file.name}</span>
                    <span class="file-meta">${fileSize} | ${fileType}</span>
                </div>
            `;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.setAttribute('title', 'Remove file');
            removeBtn.onclick = () => removeFile(fileId);
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(removeBtn);
            fileList.appendChild(fileItem);
        });
        
        fileList.classList.add('has-files');
    } else {
        fileList.classList.remove('has-files');
    }
}

function removeFile(fileId) {
    selectedFiles.delete(fileId);

    updateFileDisplays();

    if (selectedFiles.size === 0) {
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.style.display = 'none';
        }
        
        const analyzeBtn = document.querySelector('.analyze-button-container');
        if (analyzeBtn) {
            analyzeBtn.remove();
        }

        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }

        document.getElementById('results').style.display = 'none';
    } else {
        handleFiles();
    }

    updateButtonLayout();
}

function handleFiles() {
    if (selectedFiles.size === 0) {
        showError('Please select at least one file to analyze.');
        return;
    }

    showLoadingIndicator();

    document.getElementById('error-message').textContent = '';

    Promise.all(Array.from(selectedFiles.values()).map(processFile))
        .then(results => {
            const validResults = results.filter(result => result !== null);
            
            if (validResults.length === 0) {
                showError('No valid data found in the uploaded files.');
                return;
            }

            window.parsedRows = validResults.reduce((acc, curr) => acc.concat(curr.rows), []);
            window.genderColIndex = validResults[0].genderColIndex;
            window.scoreColIndex = validResults[0].scoreColIndex;

            showAnalyzeButton();
        })
        .catch(error => {
            showError('Error processing files: ' + error.message);
        })
        .finally(() => {
            hideLoadingIndicator();
        });
}

function processFilesImmediately() {
    if (selectedFiles.size === 0) {
        showError('Please select at least one file to analyze.');
        return;
    }

    showLoadingIndicator();

    document.getElementById('error-message').textContent = '';

    Promise.all(Array.from(selectedFiles.values()).map(processFile))
        .then(results => {
            const validResults = results.filter(result => result !== null);
            
            if (validResults.length === 0) {
                showError('No valid data found in the uploaded files.');
                return;
            }

            window.parsedRows = validResults.reduce((acc, curr) => acc.concat(curr.rows), []);
            window.genderColIndex = validResults[0].genderColIndex;
            window.scoreColIndex = validResults[0].scoreColIndex;

            showAnalyzeButton();
        })
        .catch(error => {
            showError('Error processing files: ' + error.message);
        })
        .finally(() => {
            hideLoadingIndicator();
        });
}

function processFile(file) {
    return new Promise((resolve, reject) => {
        const fileType = file.name.split('.').pop().toLowerCase();

        if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
            reject(new Error(`Unsupported file format: .${fileType}`));
            return;
        }
        
        if (fileType === 'csv') {
            processCSVFile(file)
                .then(resolve)
                .catch(error => {
                    reject(new Error(`Error processing CSV file '${file.name}': ${error.message}`));
                });
        } else if (fileType === 'xlsx' || fileType === 'xls') {
            processExcelFile(file)
                .then(resolve)
                .catch(error => {
                    reject(new Error(`Error processing Excel file '${file.name}': ${error.message}`));
                });
        }
    });
}

function processCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const csvData = e.target.result;
                resolve(parseCSVData(csvData));
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
    });
}

function processExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const csvData = XLSX.utils.sheet_to_csv(worksheet);
                resolve(parseCSVData(csvData));
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Error reading file'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

function combineFileData(results) {
    return results.flat().filter(Boolean);
}

function parseCSVData(csvData) {
    const rows = csvData.split(/\r?\n/).filter(row => row.trim() !== '');
    
    if (rows.length < 2) {
        showError('The file does not contain enough data.');
        hideLoadingIndicator();
        return null;
    }

    const headers = parseCSVRow(rows[0]);

    const genderColIndex = autoDetectGenderColumn(headers);
    const scoreColIndex = autoDetectScoreColumn(headers);
    
    if (genderColIndex === -1 || scoreColIndex === -1) {
        showError('Could not automatically detect gender and score columns. Please ensure your data has columns with names like "gender" and "score" or "grade".');
        hideLoadingIndicator();
        return null;
    }

    return {
        rows: rows.slice(1).map(row => parseCSVRow(row)),
        genderColIndex,
        scoreColIndex
    };
}

function autoDetectGenderColumn(headers) {
    const genderKeywords = ['gender', 'sex', 'male', 'female'];
    
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase();
        for (const keyword of genderKeywords) {
            if (header.includes(keyword)) {
                return i;
            }
        }
    }

    return -1;
}

function autoDetectScoreColumn(headers) {
    const scoreKeywords = ['score', 'mark', 'grade', 'midterm', 'exam', 'test', 'point'];
    
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase();
        for (const keyword of scoreKeywords) {
            if (header.includes(keyword)) {
                return i;
            }
        }
    }

    return -1;
}

function showAnalyzeButton() {
    const existingButtons = document.querySelectorAll('.analyze-button-container');
    existingButtons.forEach(button => button.remove());

    document.getElementById('column-selection').style.display = 'none';

    const analyzeButtonContainer = document.createElement('div');
    analyzeButtonContainer.className = 'analyze-button-container';
    analyzeButtonContainer.innerHTML = `
        <button id="analyzeBtn" class="analyze-btn">
            <i class="fas fa-chart-bar"></i> Analyze Midterm Scores by Gender
        </button>
    `;

    const fileInputContainer = document.querySelector('.file-input-container');
    fileInputContainer.parentNode.insertBefore(analyzeButtonContainer, fileInputContainer.nextSibling);

    document.getElementById('analyzeBtn').addEventListener('click', analyzeData);
}

function parseCSVRow(row) {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const nextChar = row[i + 1];
        
        if (char === '"' && inQuotes && nextChar === '"') {
            currentValue += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    result.push(currentValue.trim());
    
    return result;
}

function analyzeData() {
    if (isProcessing) {
        return;
    }

    const genderColumnIndex = window.genderColIndex;
    const scoreColumnIndex = window.scoreColIndex;

    isProcessing = true;
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.style.opacity = '0.5';
        analyzeBtn.style.cursor = 'not-allowed';
    }

    showLoadingIndicator();
    
    try {
        if (chart) {
            chart.destroy();
            chart = null;
        }
        if (genderDistributionChart) {
            genderDistributionChart.destroy();
            genderDistributionChart = null;
        }
        if (scoreDistributionChart) {
            scoreDistributionChart.destroy();
            scoreDistributionChart = null;
        }
        if (scoreRangeChart) {
            scoreRangeChart.destroy();
            scoreRangeChart = null;
        }

        resetChartData();

        document.getElementById('results').style.display = 'none';

        document.getElementById('insights').innerHTML = '';
        document.getElementById('calculation-details').innerHTML = '';
        document.getElementById('summary').innerHTML = '';

        const rows = window.parsedRows;
        const validationIssues = [];
        let rowsProcessed = 0;
        
        rows.forEach((row, index) => {
            if (row.length <= Math.max(genderColumnIndex, scoreColumnIndex)) {
                validationIssues.push({
                    type: 'error',
                    message: `Row ${index + 2}: Not enough columns.`
                });
                return;
            }
            
            const gender = row[genderColumnIndex].trim().toLowerCase();
            const scoreStr = row[scoreColumnIndex].trim();

            let normalizedGender = '';
            if (gender === 'm' || gender === 'male' || gender === 'boy') {
                normalizedGender = 'male';
            } else if (gender === 'f' || gender === 'female' || gender === 'girl') {
                normalizedGender = 'female';
            } else {
                validationIssues.push({
                    type: 'warning',
                    message: `Row ${index + 2}: Unrecognized gender "${row[genderColumnIndex]}". Row skipped.`
                });
                return;
            }

            const score = parseFloat(scoreStr);
            if (isNaN(score)) {
                validationIssues.push({
                    type: 'warning',
                    message: `Row ${index + 2}: Invalid score "${scoreStr}". Row skipped.`
                });
                return;
            }

            rawData.push({
                gender: normalizedGender,
                score: score
            });

            updateChartData(normalizedGender, score);
            
            rowsProcessed++;
        });

        if (rowsProcessed === 0) {
            showError('No valid data found after processing.');
            return;
        }

        calculateAverages();

        showValidationSummary(validationIssues, rowsProcessed, rows.length);

        createChart();
        showResults();

        generateInsights();

        showCalculationExplanation();
        
    } catch (error) {
        showError('Error analyzing data: ' + error.message);
    } finally {
        isProcessing = false;
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.style.opacity = '1';
            analyzeBtn.style.cursor = 'pointer';
        }
        hideLoadingIndicator();
    }
}

function resetChartData() {
    rawData = [];
    chartData = {
        male: {
            count: 0,
            sum: 0,
            average: 0,
            min: Infinity,
            max: -Infinity,
            validScores: []
        },
        female: {
            count: 0,
            sum: 0,
            average: 0,
            min: Infinity,
            max: -Infinity,
            validScores: []
        }
    };
}

function updateChartData(gender, score) {
    const genderData = chartData[gender];
    
    genderData.count++;
    genderData.sum += score;
    genderData.min = Math.min(genderData.min, score);
    genderData.max = Math.max(genderData.max, score);
    genderData.validScores.push(score);
}

function calculateAverages() {
    if (chartData.male.count > 0) {
        chartData.male.average = chartData.male.sum / chartData.male.count;
    }
    
    if (chartData.female.count > 0) {
        chartData.female.average = chartData.female.sum / chartData.female.count;
    }
}

function showValidationSummary(issues, processedRows, totalRows) {
}

function showResults() {
    document.getElementById('results').style.display = 'block';

    createSummaryCharts();

    const summaryElement = document.getElementById('summary');
    summaryElement.innerHTML = '';
}

function generateInsights() {
    const insightsElement = document.getElementById('insights');
    insightsElement.innerHTML = '';

    if (chartData.male.count === 0 || chartData.female.count === 0) {
        const noComparisonInsight = document.createElement('div');
        noComparisonInsight.className = 'insight-item insight-warning';
        noComparisonInsight.innerHTML = `<strong>Limited Data:</strong> Data for ${chartData.male.count === 0 ? 'male' : 'female'} students is missing. Gender comparison is not possible.`;
        insightsElement.appendChild(noComparisonInsight);
        return;
    }

    const difference = chartData.male.average - chartData.female.average;
    const absoluteDifference = Math.abs(difference);
    const percentageDifference = (absoluteDifference / Math.max(chartData.male.average, chartData.female.average)) * 100;

    const differenceInsight = document.createElement('div');
    let insightClass = 'insight-minor';
    let insightText = '';
    
    if (percentageDifference < 3) {
        insightClass = 'insight-minor';
        insightText = `<strong>Minimal Gender Difference:</strong> The difference between male and female average scores is only ${absoluteDifference.toFixed(2)} points (${percentageDifference.toFixed(2)}%), which is not statistically significant.`;
    } else if (percentageDifference < 10) {
        insightClass = 'insight-moderate';
        insightText = `<strong>Moderate Gender Difference:</strong> ${difference > 0 ? 'Male' : 'Female'} students scored higher by ${absoluteDifference.toFixed(2)} points (${percentageDifference.toFixed(2)}%). This difference may warrant attention.`;
    } else {
        insightClass = 'insight-significant';
        insightText = `<strong>Significant Gender Difference:</strong> ${difference > 0 ? 'Male' : 'Female'} students scored higher by ${absoluteDifference.toFixed(2)} points (${percentageDifference.toFixed(2)}%). This substantial difference requires investigation.`;
    }
    
    differenceInsight.className = `insight-item ${insightClass}`;
    differenceInsight.innerHTML = insightText;
    insightsElement.appendChild(differenceInsight);

    const totalStudents = chartData.male.count + chartData.female.count;
    const sampleSizeInsight = document.createElement('div');
    
    if (totalStudents < 30) {
        sampleSizeInsight.className = 'insight-item insight-warning';
        sampleSizeInsight.innerHTML = `<strong>Small Sample Size:</strong> With only ${totalStudents} students (${chartData.male.count} male, ${chartData.female.count} female), the results may not be statistically reliable.`;
    } else if (Math.min(chartData.male.count, chartData.female.count) < 15) {
        sampleSizeInsight.className = 'insight-item insight-warning';
        sampleSizeInsight.innerHTML = `<strong>Imbalanced Sample:</strong> One gender group has fewer than 15 students, which may affect the reliability of the comparison.`;
    } else {
        sampleSizeInsight.className = 'insight-item insight-minor';
        sampleSizeInsight.innerHTML = `<strong>Adequate Sample Size:</strong> With ${totalStudents} students (${chartData.male.count} male, ${chartData.female.count} female), the sample size is sufficient for basic analysis.`;
    }
    
    insightsElement.appendChild(sampleSizeInsight);

    if (chartData.male.count >= 5 && chartData.female.count >= 5) {
        const maleSD = calculateStandardDeviation(chartData.male.validScores, chartData.male.average);
        const femaleSD = calculateStandardDeviation(chartData.female.validScores, chartData.female.average);
        
        const distributionInsight = document.createElement('div');
        distributionInsight.className = 'insight-item insight-minor';
        distributionInsight.innerHTML = `<strong>Score Distribution:</strong> Male scores have a standard deviation of ${maleSD.toFixed(2)}, while female scores have a standard deviation of ${femaleSD.toFixed(2)}.`;
        
        if (Math.abs(maleSD - femaleSD) > Math.min(maleSD, femaleSD) * 0.5) {
            distributionInsight.innerHTML += ` The significant difference in standard deviations suggests that one gender group has more variable scores than the other.`;
            distributionInsight.className = 'insight-item insight-moderate';
        }
        
        insightsElement.appendChild(distributionInsight);
    }
}

function calculateStandardDeviation(values, mean) {
    if (values.length < 2) return 0;
    
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const sumSquaredDiff = squaredDifferences.reduce((sum, value) => sum + value, 0);
    return Math.sqrt(sumSquaredDiff / (values.length - 1));
}

function showCalculationExplanation() {
    const calculationElement = document.getElementById('calculation-details');
    calculationElement.innerHTML = '';

    calculationElement.style.marginTop = '20px';

    if (chartData.male.count > 0) {
        const formula = `Male Average = ${chartData.male.sum.toFixed(2)} / ${chartData.male.count} = ${chartData.male.average.toFixed(2)}`;
        const maleStep = document.createElement('div');
        maleStep.className = 'calculation-step slide-in-up';
        maleStep.style.marginBottom = '25px'; 
        maleStep.innerHTML = `
            <h4>Male Average Score Calculation</h4>
            <p>Sum of all male scores: ${chartData.male.sum.toFixed(2)}</p>
            <p>Number of male students: ${chartData.male.count}</p>
            <div class="calculation-formula">
                ${formula}
                <button class="copy-formula" data-formula="${formula}" title="Copy formula">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        calculationElement.appendChild(maleStep);
    }

    if (chartData.female.count > 0) {
        const formula = `Female Average = ${chartData.female.sum.toFixed(2)} / ${chartData.female.count} = ${chartData.female.average.toFixed(2)}`;
        const femaleStep = document.createElement('div');
        femaleStep.className = 'calculation-step slide-in-up';
        femaleStep.style.marginBottom = '25px';
        femaleStep.innerHTML = `
            <h4>Female Average Score Calculation</h4>
            <p>Sum of all female scores: ${chartData.female.sum.toFixed(2)}</p>
            <p>Number of female students: ${chartData.female.count}</p>
            <div class="calculation-formula">
                ${formula}
                <button class="copy-formula" data-formula="${formula}" title="Copy formula">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        calculationElement.appendChild(femaleStep);
    }

    if (chartData.male.count > 0 && chartData.female.count > 0) {
        const difference = Math.abs(chartData.male.average - chartData.female.average);
        const percentageDifference = (difference / Math.max(chartData.male.average, chartData.female.average)) * 100;
        const formula = `Percentage Difference = (${difference.toFixed(2)} / ${Math.max(chartData.male.average, chartData.female.average).toFixed(2)}) × 100% = ${percentageDifference.toFixed(2)}%`;
        
        const differenceStep = document.createElement('div');
        differenceStep.className = 'calculation-step slide-in-up';
        differenceStep.innerHTML = `
            <h4>Gender Difference Calculation</h4>
            <p>Male average: ${chartData.male.average.toFixed(2)}</p>
            <p>Female average: ${chartData.female.average.toFixed(2)}</p>
            <div class="calculation-formula">
                ${formula}
                <button class="copy-formula" data-formula="${formula}" title="Copy formula">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        calculationElement.appendChild(differenceStep);
    }
}

function getChartColors() {
    const style = getComputedStyle(document.documentElement);
    return {
        male: style.getPropertyValue('--chart-male').trim(),
        female: style.getPropertyValue('--chart-female').trim(),
        gridColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#e7e7e7'
    };
}

function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function getChartConfig(ctx, type, data, options = {}) {
    const isMobile = window.innerWidth < 768;
    const chartColors = getChartColors();

    const baseConfig = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: isMobile ? 'nearest' : 'index',
            intersect: !isMobile,
        },
        plugins: {
            tooltip: {
                enabled: true,
                titleFont: {
                    size: isMobile ? 14 : 12
                },
                bodyFont: {
                    size: isMobile ? 13 : 11
                },
                padding: isMobile ? 12 : 8,
                displayColors: true,
                callbacks: options.tooltipCallbacks || {}
            },
            legend: {
                position: isMobile ? 'bottom' : 'top',
                labels: {
                    boxWidth: isMobile ? 30 : 15,
                    padding: isMobile ? 20 : 15,
                    color: chartColors.textColor,
                    font: {
                        size: isMobile ? 14 : 12
                    }
                }
            },
            title: {
                display: true,
                text: options.title || '',
                color: chartColors.textColor,
                font: {
                    size: isMobile ? 18 : 16,
                    weight: 'bold'
                },
                padding: {
                    top: isMobile ? 15 : 10,
                    bottom: isMobile ? 20 : 15
                }
            }
        },
        animation: {
            duration: isMobile ? 500 : 1000,
        },
        layout: {
            padding: {
                left: isMobile ? 15 : 20,
                right: isMobile ? 15 : 20,
                top: isMobile ? 15 : 10,
                bottom: isMobile ? 25 : 30
            }
        }
    };

    return {
        type,
        data,
        options: mergeDeep(baseConfig, options)
    };
}

function createChart() {
    const ctx = document.getElementById('midtermChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    const labels = [];
    const maleData = [];
    const femaleData = [];
    
    if (chartData.male.count > 0) {
        labels.push('Male');
        maleData.push(chartData.male.average);
        femaleData.push(null);
    }
    
    if (chartData.female.count > 0) {
        labels.push('Female');
        if (maleData.length === 0) {
            maleData.push(null);
        }
        femaleData.push(chartData.female.average);
    }
    
    const chartColors = getChartColors();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Male Average',
                    data: maleData,
                    backgroundColor: chartColors.male,
                    borderColor: chartColors.male,
                    borderWidth: 1,
                    barThickness: window.innerWidth < 768 ? 60 : 80,
                    minBarLength: 10
                },
                {
                    label: 'Female Average',
                    data: femaleData,
                    backgroundColor: chartColors.female,
                    borderColor: chartColors.female,
                    borderWidth: 1,
                    barThickness: window.innerWidth < 768 ? 60 : 80,
                    minBarLength: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Average Midterm Scores',
                    color: chartColors.textColor,
                    font: {
                        size: window.innerWidth < 768 ? 18 : 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.raw === null || context.raw === 0) {
                                return null;
                            }
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    grid: {
                        color: chartColors.gridColor,
                        drawBorder: false,
                        lineWidth: 0.5
                    },
                    ticks: {
                        color: chartColors.textColor,
                        stepSize: window.innerWidth < 768 ? 20 : 10,
                        padding: 5,
                        font: {
                            size: window.innerWidth < 768 ? 12 : 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: chartColors.textColor,
                        padding: 5,
                        font: {
                            size: window.innerWidth < 768 ? 14 : 12,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

function exportData() {
    if (rawData.length === 0) {
        showError('No data to export.');
        return;
    }

    let csvContent = 'Gender,Score\n';
    
    rawData.forEach(item => {
        csvContent += `${item.gender},${item.score}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'gender_score_data.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportChart() {
    if (!chart) {
        showError('No chart to export.');
        return;
    }

    const link = document.createElement('a');
    link.href = chart.toBase64Image();
    link.download = 'gender_score_chart.png';
    link.click();
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-item fade-in';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorElement.appendChild(errorDiv);

    errorElement.style.display = 'block';

    setTimeout(() => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => {
            errorDiv.remove();
            if (errorElement.children.length === 0) {
                errorElement.style.display = 'none';
            }
        }, 300);
    }, 5000);
}

function showWarning(message) {
    const warningElement = document.createElement('div');
    warningElement.className = 'warning-message';
    warningElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    document.getElementById('error-message').appendChild(warningElement);

    setTimeout(() => {
        warningElement.remove();
    }, 5000);
}

function showLoadingIndicator() {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';
    loadingProgress = 0;
    updateLoadingProgress();
}

function hideLoadingIndicator() {
    document.getElementById('loading').style.display = 'none';
}

function updateLoadingProgress() {
    loadingProgress += Math.random() * 30;
    if (loadingProgress > 100) loadingProgress = 100;
    
    const loadingText = document.querySelector('.loading-container p');
    const progressBar = document.querySelector('.loading-progress-bar');
    
    loadingText.textContent = `Processing data... ${Math.round(loadingProgress)}%`;
    progressBar.style.width = `${loadingProgress}%`;
    
    if (loadingProgress < 100) {
        setTimeout(updateLoadingProgress, 200);
    }
}

function openHelpModal() {
    document.getElementById('helpModal').style.display = 'block';

    if (!window.helpInitialized) {
        initializeHelpTabs();
        initializeFAQ();
        initializeTutorial();
        window.helpInitialized = true;
    }
}

function closeHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

function toggleInsights() {
    const popup = document.getElementById('insights-popup');
    popup.classList.toggle('show');

    if (popup.classList.contains('show')) {
        window.addEventListener('click', function closeOnClickOutside(event) {
            if (event.target === popup) {
                popup.classList.remove('show');
                window.removeEventListener('click', closeOnClickOutside);
            }
        });
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const popup = document.getElementById('insights-popup');
        if (popup.classList.contains('show')) {
            popup.classList.remove('show');
        }
    }
});

function createSummaryCharts() {
    createGenderDistributionChart();

    createScoreDistributionChart();

    createScoreRangeChart();
}

function createGenderDistributionChart() {
    const ctx = document.getElementById('genderDistributionChart').getContext('2d');
    const totalMale = chartData.male.count;
    const totalFemale = chartData.female.count;
    const total = totalMale + totalFemale;
    
    const chartColors = getChartColors();

    if (genderDistributionChart) {
        genderDistributionChart.destroy();
    }
    
    genderDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [totalMale, totalFemale],
                backgroundColor: [chartColors.male, chartColors.female],
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: chartColors.textColor,
                        font: {
                            size: 12
                        },
                        padding: 10
                    }
                },
                title: {
                    display: true,
                    text: 'Gender Distribution',
                    color: chartColors.textColor,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createScoreDistributionChart() {
    const ctx = document.getElementById('scoreDistributionChart').getContext('2d');

    if (scoreDistributionChart) {
        scoreDistributionChart.destroy();
    }

    const ranges = {
        'Below 60': { male: 0, female: 0 },
        '60-69': { male: 0, female: 0 },
        '70-79': { male: 0, female: 0 },
        '80-89': { male: 0, female: 0 },
        '90-100': { male: 0, female: 0 }
    };

    rawData.forEach(data => {
        const score = data.score;
        const gender = data.gender;
        
        if (score < 60) {
            ranges['Below 60'][gender]++;
        } else if (score < 70) {
            ranges['60-69'][gender]++;
        } else if (score < 80) {
            ranges['70-79'][gender]++;
        } else if (score < 90) {
            ranges['80-89'][gender]++;
        } else {
            ranges['90-100'][gender]++;
        }
    });
    
    const chartColors = getChartColors();

    const data = Object.keys(ranges).map(range => 
        ranges[range].male + ranges[range].female
    );
    
    scoreDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(ranges),
            datasets: [{
                data: data,
                backgroundColor: [
                    '#ef4444',  
                    '#f97316',  
                    '#facc15',  
                    '#22c55e',  
                    '#60a5fa'   
                ],
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: chartColors.textColor,
                        font: {
                            size: 12
                        },
                        padding: 10
                    }
                },
                title: {
                    display: true,
                    text: 'Score Distribution',
                    color: chartColors.textColor,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            const range = label;
                            return `${range}: ${value} students (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createScoreRangeChart() {
    const ctx = document.getElementById('scoreRangeChart').getContext('2d');
    const chartColors = getChartColors();

    if (scoreRangeChart) {
        scoreRangeChart.destroy();
    }
    
    scoreRangeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Minimum', 'Average', 'Maximum'],
            datasets: [
                {
                    label: 'Male',
                    data: [
                        chartData.male.min,
                        chartData.male.average,
                        chartData.male.max
                    ],
                    backgroundColor: chartColors.male,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Female',
                    data: [
                        chartData.female.min,
                        chartData.female.average,
                        chartData.female.max
                    ],
                    backgroundColor: chartColors.female,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: chartColors.textColor,
                        font: {
                            size: 12
                        },
                        padding: 10
                    }
                },
                title: {
                    display: true,
                    text: 'Score Range Comparison',
                    color: chartColors.textColor,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 15
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: chartColors.gridColor,
                        lineWidth: 0.5
                    },
                    ticks: {
                        color: chartColors.textColor
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: chartColors.textColor
                    }
                }
            }
        }
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyTooltip();
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function showCopyTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'copy-tooltip fade-in';
    tooltip.textContent = 'Copied to clipboard!';
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
        tooltip.remove();
    }, 2000);
}

function clearAllFiles() {
    selectedFiles.clear();

    updateFileDisplays();

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.style.display = 'none';
    }

    const analyzeBtn = document.querySelector('.analyze-button-container');
    if (analyzeBtn) {
        analyzeBtn.remove();
    }

    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }

    document.getElementById('results').style.display = 'none';

    updateButtonLayout();
}

function initializeHelpTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');

            question.classList.toggle('active');
            answer.classList.toggle('show');

            if (answer.classList.contains('show')) {
                icon.style.transform = 'rotate(90deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
}

function initializeTutorial() {
    const tutorialButtons = document.querySelectorAll('.tutorial-btn');
    
    tutorialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            
            switch (action) {
                case 'upload':
                    closeHelpModal();
                    document.getElementById('uploadBtn').click();
                    break;
                    
                case 'analyze':
                    closeHelpModal();
                    showTutorialExample();
                    break;
                    
                case 'explore':
                    closeHelpModal();
                    showExplorationGuide();
                    break;
            }
        });
    });
}

function showTutorialExample() {
    const sampleData = {
        male: {
            scores: [85, 92, 78, 88, 95],
            average: 87.6
        },
        female: {
            scores: [90, 87, 93, 82, 89],
            average: 88.2
        }
    };

    resetChartData();

    sampleData.male.scores.forEach(score => {
        updateChartData('male', score);
    });
    
    sampleData.female.scores.forEach(score => {
        updateChartData('female', score);
    });

    calculateAverages();

    document.getElementById('results').style.display = 'block';
    createChart();
    createSummaryCharts();
    generateInsights();
    showCalculationExplanation();

    showTooltip('This is a sample visualization. Try uploading your own data!');
}

function showExplorationGuide() {
    const steps = [
        {
            element: '.chart-container',
            tooltip: 'Main chart showing average scores by gender'
        },
        {
            element: '.calculation-container',
            tooltip: 'Detailed calculations and statistical methods'
        },
        {
            element: '.summary-charts',
            tooltip: 'Additional visualizations for deeper analysis'
        },
        {
            element: '.export-options',
            tooltip: 'Export your data and charts'
        }
    ];
    
    let currentStep = 0;
    
    function showNextStep() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            const element = document.querySelector(step.element);

            document.querySelectorAll('.highlight-element').forEach(el => {
                el.classList.remove('highlight-element');
            });

            element.classList.add('highlight-element');

            showTooltip(step.tooltip, element);
            
            currentStep++;
        } else {
            document.querySelectorAll('.highlight-element').forEach(el => {
                el.classList.remove('highlight-element');
            });
            hideTooltip();
        }
    }

    showNextStep();

    document.addEventListener('click', showNextStep, { once: true });
}

function showTooltip(message, targetElement = null) {
    const tooltip = document.createElement('div');
    tooltip.className = 'dynamic-tooltip';
    tooltip.textContent = message;
    
    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
        tooltip.style.transform = 'translateX(-50%)';
    } else {
        tooltip.style.position = 'fixed';
        tooltip.style.bottom = '20px';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
    }
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
        tooltip.remove();
    }, 5000);
}

function hideTooltip() {
    const tooltips = document.querySelectorAll('.dynamic-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

function initializeTouchEvents() {
    const isMobile = 'ontouchstart' in window;
    if (!isMobile) return;

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });

        button.addEventListener('touchend', function(e) {
            this.style.transform = 'none';
        }, { passive: true });
    });

    const scrollableContainers = document.querySelectorAll('.modal-content, .insights-content, .help-tabs');
    scrollableContainers.forEach(container => {
        if (container.scrollWidth > container.clientWidth) {
            const hint = document.createElement('div');
            hint.className = 'mobile-scroll-hint';
            hint.textContent = 'Scroll horizontally to see more';
            container.parentNode.insertBefore(hint, container);
            
            setTimeout(() => hint.classList.add('show'), 500);
            setTimeout(() => hint.classList.remove('show'), 3500);
        }
    });

    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('touchstart', function(e) {
            const message = this.getAttribute('data-tooltip');
            showMobileTooltip(message);
        }, { passive: true });
    });
}

function showMobileTooltip(message) {
    document.querySelectorAll('.touch-tooltip').forEach(t => t.remove());
    
    const tooltip = document.createElement('div');
    tooltip.className = 'touch-tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
        tooltip.remove();
    }, 2000);
}

function loadSampleData() {
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }

    resetChartData();

    [65, 72, 83, 91, 68, 75, 88, 62, 79, 84].forEach(score => {
        updateChartData('male', score);
        rawData.push({ gender: 'male', score: score });
    });

    [70, 77, 82, 88, 66, 71, 85, 90, 78, 69].forEach(score => {
        updateChartData('female', score);
        rawData.push({ gender: 'female', score: score });
    });

    calculateAverages();

    showLoadingIndicator();
    setTimeout(() => {
        hideLoadingIndicator();

        createChart();
        showResults();
        generateInsights();
        showCalculationExplanation();
        createSummaryCharts();
    }, 1500);
}

function updateButtonLayout() {
    const fileList = document.querySelector('.file-list');
    const uploadArea = document.querySelector('.upload-button-area');
    
    if (fileList && uploadArea) {
        const hasFiles = fileList.children.length > 0;
        
        if (hasFiles) {
            uploadArea.classList.add('has-files');
            fileList.classList.add('has-files');
        } else {
            uploadArea.classList.remove('has-files');
            fileList.classList.remove('has-files');
        }
    }
}

function getFileIconClass(fileType) {
    if (!fileType) return 'fas fa-file';
    
    if (fileType.includes('csv')) {
        return 'fas fa-file-csv';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || 
                fileType.includes('xls')) {
        return 'fas fa-file-excel';
    } else if (fileType.includes('text')) {
        return 'fas fa-file-alt';
    } else {
        return 'fas fa-file';
    }
}

function createFilePanels() {
    console.log('Creating file info panels if needed');

    if (!document.getElementById('fileInfoPanel')) {
        console.log('Creating missing top file info panel');
        const fileInfoPanel = document.createElement('div');
        fileInfoPanel.id = 'fileInfoPanel';
        fileInfoPanel.className = 'file-info-panel';
        fileInfoPanel.innerHTML = `
            <div class="file-info-header">
                <i class="fas fa-file-alt"></i> Uploaded Files
            </div>
            <div id="fileInfoContent" class="file-info-content">
                No files uploaded yet
            </div>
        `;

        const fileInputContainer = document.querySelector('.file-input-container');
        if (fileInputContainer) {
            const firstChild = fileInputContainer.firstChild;
            if (firstChild) {
                fileInputContainer.insertBefore(fileInfoPanel, firstChild);
            } else {
                fileInputContainer.appendChild(fileInfoPanel);
            }
            console.log('Top file info panel created and inserted');
        }
    }

    if (!document.getElementById('fileStatusPanel')) {
        console.log('Creating missing bottom file status panel');
        const fileStatusPanel = document.createElement('div');
        fileStatusPanel.id = 'fileStatusPanel';
        fileStatusPanel.className = 'file-status-panel';
        fileStatusPanel.innerHTML = `
            <div class="file-status-indicator">
                <i class="fas fa-circle-info"></i>
                <span id="fileStatusMessage">
                    Ready to upload - no files selected
                </span>
            </div>
        `;

        const fileInputContainer = document.querySelector('.file-input-container');
        if (fileInputContainer) {
            fileInputContainer.appendChild(fileStatusPanel);
            console.log('Bottom file status panel created and inserted');
        }
    }
}