"use strict";

const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const previewArea = document.getElementById("previewArea");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const fileInfo = document.getElementById("fileInfo");
const analyzeButton = document.getElementById("analyzeButton");
const changeButton = document.getElementById("changeButton");
const processingArea = document.getElementById("processingArea");

const analysisModal = document.getElementById("analysisModal");
const closeAnalysis = document.getElementById("closeAnalysis");
const originalAnalysisImage = document.getElementById("originalAnalysisImage");
const processedCanvas = document.getElementById("processedCanvas");
const analysisSummary = document.getElementById("analysisSummary");

const brightnessValue = document.getElementById("brightnessValue");
const brightnessText = document.getElementById("brightnessText");
const contrastValue = document.getElementById("contrastValue");
const contrastText = document.getElementById("contrastText");
const saturationValue = document.getElementById("saturationValue");
const saturationText = document.getElementById("saturationText");
const variationValue = document.getElementById("variationValue");

const recommendedMode = document.getElementById("recommendedMode");
const recommendationText = document.getElementById("recommendationText");
const recommendationList = document.getElementById("recommendationList");

const originalHistogram = document.getElementById("originalHistogram");
const processedHistogram = document.getElementById("processedHistogram");

const manualButton = document.getElementById("manualButton");
const applyRecommendation = document.getElementById("applyRecommendation");
const keepOriginalButton = document.getElementById("keepOriginalButton");

const manualPanel = document.getElementById("manualPanel");
const closeManual = document.getElementById("closeManual");
const cancelManual = document.getElementById("cancelManual");
const applyManual = document.getElementById("applyManual");

const manualOriginalImage = document.getElementById("manualOriginalImage");
const manualCanvas = document.getElementById("manualCanvas");
const manualHistogram = document.getElementById("manualHistogram");

const manualBrightness = document.getElementById("manualBrightness");
const manualContrast = document.getElementById("manualContrast");
const manualSaturation = document.getElementById("manualSaturation");
const manualBrightnessValue = document.getElementById("manualBrightnessValue");
const manualContrastValue = document.getElementById("manualContrastValue");
const manualSaturationValue = document.getElementById("manualSaturationValue");
const manualFilter = document.getElementById("manualFilter");
const manualStatus = document.getElementById("manualStatus");

const undoButton = document.getElementById("undoButton");
const resetManual = document.getElementById("resetManual");

const resultModal = document.getElementById("resultModal");
const closeResult = document.getElementById("closeResult");
const resultFileName = document.getElementById("resultFileName");
const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");
const resultProcessing = document.getElementById("resultProcessing");
const newAnalysisButton = document.getElementById("newAnalysisButton");

let currentImage = null;
let currentImageData = null;
let currentAnalysis = null;
let originalURL = null;

let manualState = {
    mode: "rgb",
    brightness: 0,
    contrast: 0,
    saturation: 0,
    filter: "none"
};

let manualHistory = [];
let originalPixels = null;
let processedPixels = null;

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) return;
    loadImage(file);
});

function show(element) {
    if (element) element.classList.remove("hidden");
}

function hide(element) {
    if (element) element.classList.add("hidden");
}

function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function loadImage(file) {
    if (!file.type.startsWith("image/")) {
        alert("El archivo seleccionado no parece ser una imagen.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
        const image = new Image();
        image.onload = function () {
            currentImage = image;
            originalURL = event.target.result;
            
            if (previewImage) previewImage.src = originalURL;
            
            if (fileName) fileName.textContent = file.name;
            if (fileInfo) fileInfo.textContent = `${image.width} × ${image.height} px · ${formatBytes(file.size)} · ${file.type || "formato desconocido"}`;
            
            hide(uploadArea);
            show(previewArea);
            hide(processingArea);
            hide(analysisModal);
            hide(resultModal);
            if (imageInput) imageInput.value = "";
        };
        image.onerror = function () {
            alert("No fue posible leer esta imagen.");
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

analyzeButton.addEventListener("click", function () {
    if (!currentImage) return;
    
    hide(previewArea);
    show(processingArea);
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setTimeout(function () {
                try {
                    analyzeImage(currentImage);
                } catch (error) {
                    alert("Error durante el análisis: " + error.message);
                    hide(processingArea);
                    show(previewArea);
                }
            }, 100);
        });
    });
});

function analyzeImage(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    
    const MAX_SIZE = 400;
    let width = image.width;
    let height = image.height;

    if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    currentImageData = imageData;
    originalPixels = new Uint8ClampedArray(imageData.data);
    currentAnalysis = calculateImageAnalysis(imageData);

    if (originalAnalysisImage) originalAnalysisImage.src = originalURL;
    if (manualOriginalImage) manualOriginalImage.src = originalURL;

    resetManualState();
    showAnalysis(currentAnalysis);
}

function calculateImageAnalysis(imageData) {
    const data = imageData.data;
    const pixelCount = data.length / 4;

    let totalR = 0, totalG = 0, totalB = 0, totalGray = 0, totalSaturation = 0;
    let minGray = 255, maxGray = 0;
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        totalR += r; totalG += g; totalB += b;
        
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        totalGray += gray;
        histogram[Math.round(gray)]++;

        if (gray < minGray) minGray = gray;
        if (gray > maxGray) maxGray = gray;

        const normR = r / 255, normG = g / 255, normB = b / 255;
        const cMax = Math.max(normR, normG, normB);
        const cMin = Math.min(normR, normG, normB);
        const delta = cMax - cMin;
        totalSaturation += cMax === 0 ? 0 : delta / cMax;
    }

    const meanR = totalR / pixelCount;
    const meanG = totalG / pixelCount;
    const meanB = totalB / pixelCount;
    const meanGray = totalGray / pixelCount;
    const meanSaturation = totalSaturation / pixelCount;

    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const difference = gray - meanGray;
        variance += difference * difference;
    }
    variance = variance / pixelCount;

    const standardDeviation = Math.sqrt(variance);
    const dynamicRange = maxGray - minGray;
    const colorDifference = (Math.abs(meanR - meanG) + Math.abs(meanG - meanB) + Math.abs(meanR - meanB)) / 3;

    let darkPixels = 0, brightPixels = 0;
    for (let i = 0; i < 256; i++) {
        if (i < 30) darkPixels += histogram[i];
        if (i > 225) brightPixels += histogram[i];
    }

    const darkPercentage = darkPixels / pixelCount * 100;
    const brightPercentage = brightPixels / pixelCount * 100;

    let illuminationStatus = meanGray < 70 ? "oscura" : meanGray > 190 ? "muy iluminada" : "adecuada";
    let contrastStatus = standardDeviation < 35 ? "bajo" : standardDeviation > 75 ? "alto" : "adecuado";
    let colorStatus = (meanSaturation < 0.12 && colorDifference < 12) ? "bajo" : "significativo";

    let mode = "RGB original";
    let reason = "La imagen conserva suficiente información de color, iluminación y contraste. Se recomienda conservarla sin modificaciones.";
    const operations = [];

    if (colorStatus === "bajo" && contrastStatus !== "bajo") {
        mode = "Escala de grises";
        reason = "La variación cromática es baja y la estructura de intensidad contiene gran parte de la información disponible.";
        operations.push("Conversión a escala de grises");
    }

    if (meanGray < 70) {
        operations.push("Corrección ligera de iluminación");
        reason += " La imagen presenta iluminación baja.";
    }

    if (meanGray > 190) {
        operations.push("Reducción ligera de iluminación");
        reason += " La imagen presenta iluminación elevada.";
    }

    if (contrastStatus === "bajo") {
        operations.push("Aumento moderado del contraste");
        reason += " El contraste es bajo.";
    }

    return {
        meanR, meanG, meanB, meanGray, meanSaturation, standardDeviation, dynamicRange, colorDifference, darkPercentage, brightPercentage, illuminationStatus, contrastStatus, colorStatus, mode, reason, operations
    };
}

function showAnalysis(analysis) {
    hide(processingArea);
    show(analysisModal);
    document.body.classList.add("modal-open");

    if (brightnessValue) brightnessValue.textContent = analysis.meanGray.toFixed(1) + " / 255";
    if (brightnessText) brightnessText.textContent = analysis.illuminationStatus;
    if (contrastValue) contrastValue.textContent = analysis.standardDeviation.toFixed(1);
    if (contrastText) contrastText.textContent = analysis.contrastStatus;
    if (saturationValue) saturationValue.textContent = (analysis.meanSaturation * 100).toFixed(1) + "%";
    if (saturationText) saturationText.textContent = analysis.colorStatus;
    if (variationValue) variationValue.textContent = analysis.dynamicRange.toFixed(1);

    if (analysisSummary) analysisSummary.textContent = "El sistema analizó iluminación, contraste, saturación y distribución de intensidades antes de proponer un procesamiento.";
    if (recommendedMode) recommendedMode.textContent = analysis.mode;
    if (recommendationText) recommendationText.textContent = analysis.reason;
    if (recommendationList) recommendationList.innerHTML = "";

    if (recommendationList) {
        if (analysis.operations.length === 0) {
            const item = document.createElement("div");
            item.className = "recommendation-item";
            item.textContent = "✓ No se requiere modificación.";
            recommendationList.appendChild(item);
        } else {
            for (let i = 0; i < analysis.operations.length; i++) {
                const item = document.createElement("div");
                item.className = "recommendation-item";
                item.textContent = "• " + analysis.operations[i];
                recommendationList.appendChild(item);
            }
        }
    }

    drawRecommendedImage();
    drawHistogram(originalHistogram, originalPixels);
    drawHistogram(processedHistogram, processedPixels);
}

function getRecommendedState() {
    const state = { mode: "rgb", brightness: 0, contrast: 0, saturation: 0, filter: "none" };
    if (currentAnalysis.mode === "Escala de grises") state.mode = "gray";
    if (currentAnalysis.meanGray < 70) state.brightness = 12;
    if (currentAnalysis.meanGray > 190) state.brightness = -8;
    if (currentAnalysis.standardDeviation < 35) state.contrast = 15;
    return state;
}

function drawRecommendedImage() {
    if (!currentImageData || !currentAnalysis) return;
    manualState = getRecommendedState();
    if (processedCanvas) {
        renderState(manualState, processedCanvas);
        processedPixels = getCanvasPixels(processedCanvas);
    }
}

function renderState(state, canvas) {
    if (!originalPixels || !canvas) return;
    const width = currentImageData.width;
    const height = currentImageData.height;
    
    canvas.width = width;
    canvas.height = height;

    const output = new Uint8ClampedArray(originalPixels);
    applyMode(output, state.mode);
    applyBrightness(output, state.brightness);
    applyContrast(output, state.contrast);
    applySaturation(output, state.saturation);

    const processed = applyFilter(output, width, height, state.filter);
    const ctx = canvas.getContext("2d");
    
    const result = ctx.createImageData(width, height);
    result.data.set(processed);
    ctx.putImageData(result, 0, 0);
    
    return processed;
}

function applyMode(data, mode) {
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i + 1], b = data[i + 2];
        if (mode === "gray") {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = gray; data[i + 1] = gray; data[i + 2] = gray;
        } else if (mode === "color") {
            const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            let mr = 0, mg = 0, mb = 0;
            if (gray < .25) { mr = 0; mg = gray * 4 * 255; mb = 255; }
            else if (gray < .5) { mr = 0; mg = 255; mb = (1 - (gray - .25) * 4) * 255; }
            else if (gray < .75) { mr = (gray - .5) * 4 * 255; mg = 255; mb = 0; }
            else { mr = 255; mg = (1 - (gray - .75) * 4) * 255; mb = 0; }
            data[i] = mr; data[i + 1] = mg; data[i + 2] = mb;
        }
    }
}

function applyBrightness(data, value) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] + value * 1.5, 0, 255);
        data[i + 1] = clamp(data[i + 1] + value * 1.5, 0, 255);
        data[i + 2] = clamp(data[i + 2] + value * 1.5, 0, 255);
    }
}

function applyContrast(data, value) {
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(factor * (data[i] - 128) + 128, 0, 255);
        data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128, 0, 255);
        data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128, 0, 255);
    }
}

function applySaturation(data, value) {
    const factor = 1 + value / 100;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = clamp(gray + (r - gray) * factor, 0, 255);
        data[i + 1] = clamp(gray + (g - gray) * factor, 0, 255);
        data[i + 2] = clamp(gray + (b - gray) * factor, 0, 255);
    }
}

function applyFilter(data, width, height, filter) {
    if (filter === "none") return data;
    const result = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const center = (y * width + x) * 4;
            let r = 0, g = 0, b = 0;
            if (filter === "blur") {
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const index = ((y + ky) * width + (x + kx)) * 4;
                        r += data[index]; g += data[index + 1]; b += data[index + 2];
                    }
                }
                result[center] = r / 9; result[center + 1] = g / 9; result[center + 2] = b / 9;
            } else if (filter === "sharpen") {
                const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
                let rr = 0, gg = 0, bb = 0, k = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const index = ((y + ky) * width + (x + kx)) * 4;
                        rr += data[index] * kernel[k]; gg += data[index + 1] * kernel[k]; bb += data[index + 2] * kernel[k]; k++;
                    }
                }
                result[center] = clamp(rr, 0, 255); result[center + 1] = clamp(gg, 0, 255); result[center + 2] = clamp(bb, 0, 255);
            }
        }
    }
    return result;
}

function getCanvasPixels(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    return new Uint8ClampedArray(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
}

function drawHistogram(canvas, pixels) {
    if (!canvas || !pixels) return;
    const width = 700, height = 220;
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    const histogram = new Array(256).fill(0);
    for (let i = 0; i < pixels.length; i += 4) {
        const gray = Math.round(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
        histogram[clamp(gray, 0, 255)]++;
    }

    let max = 1;
    for (let i = 0; i < histogram.length; i++) {
        if (histogram[i] > max) max = histogram[i];
    }

    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i < 256; i++) {
        const x = i * width / 255;
        const y = height - (histogram[i] / max) * (height - 10);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = "rgba(65,61,86,.28)";
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
        const x = i * width / 255;
        const y = height - (histogram[i] / max) * (height - 10);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#413d56";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = "#b9b4aa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.stroke();

    ctx.fillStyle = "#777";
    ctx.font = "12px Arial";
    ctx.fillText("0", 5, height - 8);
    ctx.fillText("128", width / 2 - 10, height - 8);
    ctx.fillText("255", width - 28, height - 8);
}

function resetManualState() {
    manualState = { mode: "rgb", brightness: 0, contrast: 0, saturation: 0, filter: "none" };
    manualHistory = [];
    updateManualControls();
    if (manualCanvas) {
        renderState(manualState, manualCanvas);
        const pixels = getCanvasPixels(manualCanvas);
        drawHistogram(manualHistogram, pixels);
    }
}

function updateManualControls() {
    if (manualBrightness) manualBrightness.value = manualState.brightness;
    if (manualContrast) manualContrast.value = manualState.contrast;
    if (manualSaturation) manualSaturation.value = manualState.saturation;
    if (manualFilter) manualFilter.value = manualState.filter;
    
    if (manualBrightnessValue) manualBrightnessValue.textContent = manualState.brightness;
    if (manualContrastValue) manualContrastValue.textContent = manualState.contrast;
    if (manualSaturationValue) manualSaturationValue.textContent = manualState.saturation;

    document.querySelectorAll(".manual-option").forEach(function(button) {
        button.classList.toggle("active", button.dataset.mode === manualState.mode);
    });
    updateManualStatus();
}

function updateManualStatus() {
    if (!manualStatus) return;
    
    const parts = [];
    if (manualState.mode === "gray") parts.push("Escala de grises");
    else if (manualState.mode === "color") parts.push("Mapa de intensidad");
    else parts.push("RGB");

    if (manualState.brightness !== 0) parts.push("brillo " + manualState.brightness);
    if (manualState.contrast !== 0) parts.push("contraste " + manualState.contrast);
    if (manualState.saturation !== 0) parts.push("saturación " + manualState.saturation);
    if (manualState.filter !== "none") parts.push(manualState.filter === "blur" ? "suavizado" : "realce de bordes");

    if (parts.length === 1) manualStatus.textContent = "Imagen original sin modificaciones.";
    else manualStatus.textContent = "Procesamiento actual: " + parts.join(", ") + ".";
}

function saveManualState() {
    manualHistory.push({
        mode: manualState.mode,
        brightness: manualState.brightness,
        contrast: manualState.contrast,
        saturation: manualState.saturation,
        filter: manualState.filter
    });
    if (manualHistory.length > 20) manualHistory.shift();
}

function updateManualPreview() {
    saveManualState();
    if (manualCanvas) {
        renderState(manualState, manualCanvas);
        const pixels = getCanvasPixels(manualCanvas);
        drawHistogram(manualHistogram, pixels);
    }
    updateManualControls();
}

document.querySelectorAll(".manual-option").forEach(function(button) {
    button.addEventListener("click", function() {
        manualState.mode = button.dataset.mode;
        updateManualPreview();
    });
});

if (manualBrightness) {
    manualBrightness.addEventListener("input", function() {
        manualState.brightness = Number(manualBrightness.value);
        if (manualCanvas) {
            renderState(manualState, manualCanvas);
            drawHistogram(manualHistogram, getCanvasPixels(manualCanvas));
        }
        updateManualControls();
    });
}

if (manualContrast) {
    manualContrast.addEventListener("input", function() {
        manualState.contrast = Number(manualContrast.value);
        if (manualCanvas) {
            renderState(manualState, manualCanvas);
            drawHistogram(manualHistogram, getCanvasPixels(manualCanvas));
        }
        updateManualControls();
    });
}

if (manualSaturation) {
    manualSaturation.addEventListener("input", function() {
        manualState.saturation = Number(manualSaturation.value);
        if (manualCanvas) {
            renderState(manualState, manualCanvas);
            drawHistogram(manualHistogram, getCanvasPixels(manualCanvas));
        }
        updateManualControls();
    });
}

if (manualFilter) {
    manualFilter.addEventListener("change", function() {
        manualState.filter = manualFilter.value;
        updateManualPreview();
    });
}

if (manualButton) {
    manualButton.addEventListener("click", function() {
        show(manualPanel);
        resetManualState();
        if (manualCanvas && currentImageData) {
            manualCanvas.width = currentImageData.width;
            manualCanvas.height = currentImageData.height;
            renderState(manualState, manualCanvas);
            drawHistogram(manualHistogram, getCanvasPixels(manualCanvas));
        }
        if (manualPanel) manualPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

if (closeManual) {
    closeManual.addEventListener("click", function() {
        hide(manualPanel);
        resetManualState();
    });
}

if (cancelManual) {
    cancelManual.addEventListener("click", function() {
        hide(manualPanel);
        resetManualState();
    });
}

if (undoButton) {
    undoButton.addEventListener("click", function() {
        if (manualHistory.length === 0) return;
        manualHistory.pop();
        const previous = manualHistory[manualHistory.length - 1];

        if (previous) {
            manualState = { mode: previous.mode, brightness: previous.brightness, contrast: previous.contrast, saturation: previous.saturation, filter: previous.filter };
        } else {
            manualState = { mode: "rgb", brightness: 0, contrast: 0, saturation: 0, filter: "none" };
        }
        if (manualCanvas) {
            renderState(manualState, manualCanvas);
            drawHistogram(manualHistogram, getCanvasPixels(manualCanvas));
        }
        updateManualControls();
    });
}

if (resetManual) {
    resetManual.addEventListener("click", function() {
        resetManualState();
        if (manualCanvas) {
            renderState(manualState, manualCanvas);
            drawHistogram(manualHistogram, getCanvasPixels(manualCanvas));
        }
    });
}

if (applyManual) {
    applyManual.addEventListener("click", function() {
        if (processedCanvas) {
            renderState(manualState, processedCanvas);
            processedPixels = getCanvasPixels(processedCanvas);
            drawHistogram(processedHistogram, processedPixels);
        }
        if (recommendedMode) recommendedMode.textContent = getModeText(manualState);
        if (recommendationText) recommendationText.textContent = "Se aplicaron los ajustes seleccionados manualmente sobre la imagen.";
        hide(manualPanel);
        if (processedCanvas) processedCanvas.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

if (applyRecommendation) {
    applyRecommendation.addEventListener("click", function() {
        manualState = getRecommendedState();
        if (processedCanvas) {
            renderState(manualState, processedCanvas);
            processedPixels = getCanvasPixels(processedCanvas);
            drawHistogram(processedHistogram, processedPixels);
        }
        openResult(getModeText(manualState));
    });
}

if (keepOriginalButton) {
    keepOriginalButton.addEventListener("click", function() {
        if (processedCanvas && currentImageData && originalPixels) {
            processedCanvas.width = currentImageData.width;
            processedCanvas.height = currentImageData.height;
            const ctx = processedCanvas.getContext("2d");
            
            const result = ctx.createImageData(currentImageData.width, currentImageData.height);
            result.data.set(new Uint8ClampedArray(originalPixels));
            
            ctx.putImageData(result, 0, 0);
            processedPixels = new Uint8ClampedArray(originalPixels);
            drawHistogram(processedHistogram, processedPixels);
        }
        openResult("Imagen original");
    });
}

function getModeText(state) {
    let text = "";
    if (state.mode === "gray") text = "Escala de grises";
    else if (state.mode === "color") text = "Mapa de intensidad";
    else text = "RGB";

    if (state.brightness !== 0) text += " · Brillo " + state.brightness;
    if (state.contrast !== 0) text += " · Contraste " + state.contrast;
    if (state.saturation !== 0) text += " · Saturación " + state.saturation;
    if (state.filter !== "none") text += " · " + (state.filter === "blur" ? "Suavizado" : "Realce de bordes");
    
    return text;
}

function openResult(processing) {
    hide(analysisModal);
    hide(manualPanel);
    if (resultFileName && fileName) resultFileName.textContent = fileName.textContent;
    if (resultProcessing) resultProcessing.textContent = processing;
    if (resultIcon) resultIcon.textContent = "👁️"; 
    if (resultTitle) resultTitle.textContent = "Resultados del Análisis";
    if (resultDescription) resultDescription.innerHTML = "El procesamiento se ha completado.<br><br><strong>Ojo detectado:</strong> Ambos ojos evaluados<br><strong>Nivel de anomalías:</strong> Pendiente conexión con backend Python.<br><strong>Posible asociación clínica:</strong> Evaluando características estructurales.";
    show(resultModal);
    document.body.classList.add("modal-open");
}

if (closeAnalysis) {
    closeAnalysis.addEventListener("click", function() {
        hide(analysisModal); hide(manualPanel); document.body.classList.remove("modal-open");
    });
}

if (closeResult) {
    closeResult.addEventListener("click", function() {
        hide(resultModal); document.body.classList.remove("modal-open");
    });
}

const backdrop = document.querySelector(".modal-backdrop");
if (backdrop) {
    backdrop.addEventListener("click", function() {
        hide(analysisModal); hide(manualPanel); document.body.classList.remove("modal-open");
    });
}

if (newAnalysisButton) {
    newAnalysisButton.addEventListener("click", function() {
        currentImage = null; currentImageData = null; currentAnalysis = null; originalPixels = null; processedPixels = null;
        hide(resultModal); hide(analysisModal); hide(manualPanel); hide(previewArea); hide(processingArea); show(uploadArea);
        
        if (previewImage) previewImage.removeAttribute("src"); 
        if (originalAnalysisImage) originalAnalysisImage.removeAttribute("src"); 
        if (manualOriginalImage) manualOriginalImage.removeAttribute("src");
        
        if (imageInput) imageInput.value = ""; 
        document.body.classList.remove("modal-open");
        
        const section = document.getElementById("analizar");
        if (section) section.scrollIntoView({ behavior: "smooth" });
    });
}

if (changeButton) {
    changeButton.addEventListener("click", function() {
        if (imageInput) imageInput.click();
    });
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") { hide(manualPanel); hide(analysisModal); hide(resultModal); document.body.classList.remove("modal-open"); }
});
document.addEventListener("dragover", function(event) { event.preventDefault(); });
document.addEventListener("drop", function(event) { event.preventDefault(); });

const printPdfButton = document.getElementById('printPdfButton');
if (printPdfButton) {
    printPdfButton.addEventListener('click', function() { window.print(); });
}

document.querySelectorAll('.navbar nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const target = this.getAttribute('href');
            document.body.classList.add('is-changing-tab');
            document.querySelectorAll('.navbar nav a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            setTimeout(() => {
                window.location.hash = target;
                setTimeout(() => {
                    document.body.classList.remove('is-changing-tab');
                }, 100);
            }, 400); 
        }
    });
});

document.addEventListener('click', function(event) {
    const eyeIcon = document.createElement('div');
    eyeIcon.classList.add('click-eye');
    eyeIcon.style.left = `${event.pageX}px`;
    eyeIcon.style.top = `${event.pageY}px`;
    document.body.appendChild(eyeIcon);
    setTimeout(() => {
        if (eyeIcon.parentNode) {
            eyeIcon.parentNode.removeChild(eyeIcon);
        }
    }, 600);
});
