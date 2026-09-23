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

const originalAnalysisImage =
    document.getElementById("originalAnalysisImage");

const processedCanvas =
    document.getElementById("processedCanvas");

const analysisSummary =
    document.getElementById("analysisSummary");

const brightnessValue =
    document.getElementById("brightnessValue");

const brightnessText =
    document.getElementById("brightnessText");

const contrastValue =
    document.getElementById("contrastValue");

const contrastText =
    document.getElementById("contrastText");

const saturationValue =
    document.getElementById("saturationValue");

const saturationText =
    document.getElementById("saturationText");

const variationValue =
    document.getElementById("variationValue");

const recommendedMode =
    document.getElementById("recommendedMode");

const recommendationText =
    document.getElementById("recommendationText");

const recommendationList =
    document.getElementById("recommendationList");

const originalHistogram =
    document.getElementById("originalHistogram");

const processedHistogram =
    document.getElementById("processedHistogram");

const manualButton =
    document.getElementById("manualButton");

const applyRecommendation =
    document.getElementById("applyRecommendation");

const keepOriginalButton =
    document.getElementById("keepOriginalButton");

const manualPanel =
    document.getElementById("manualPanel");

const closeManual =
    document.getElementById("closeManual");

const cancelManual =
    document.getElementById("cancelManual");

const applyManual =
    document.getElementById("applyManual");

const manualOriginalImage =
    document.getElementById("manualOriginalImage");

const manualCanvas =
    document.getElementById("manualCanvas");

const manualHistogram =
    document.getElementById("manualHistogram");

const manualBrightness =
    document.getElementById("manualBrightness");

const manualContrast =
    document.getElementById("manualContrast");

const manualSaturation =
    document.getElementById("manualSaturation");

const manualBrightnessValue =
    document.getElementById("manualBrightnessValue");

const manualContrastValue =
    document.getElementById("manualContrastValue");

const manualSaturationValue =
    document.getElementById("manualSaturationValue");

const manualFilter =
    document.getElementById("manualFilter");

const manualStatus =
    document.getElementById("manualStatus");

const undoButton =
    document.getElementById("undoButton");

const resetManual =
    document.getElementById("resetManual");

const resultModal =
    document.getElementById("resultModal");

const closeResult =
    document.getElementById("closeResult");

const resultFileName =
    document.getElementById("resultFileName");

const resultIcon =
    document.getElementById("resultIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultDescription =
    document.getElementById("resultDescription");

const resultProcessing =
    document.getElementById("resultProcessing");

const newAnalysisButton =
    document.getElementById("newAnalysisButton");

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

    if (!file) {
        return;
    }

    loadImage(file);
});

function show(element) {

    if (element) {
        element.classList.remove("hidden");
    }
}

function hide(element) {

    if (element) {
        element.classList.add("hidden");
    }
}

function clamp(value, min, max) {

    if (value < min) {
        return min;
    }

    if (value > max) {
        return max;
    }

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

            previewImage.src = originalURL;

            fileName.textContent =
                file.name;

            fileInfo.textContent =
                `${image.width} × ${image.height} px · ` +
                `${formatBytes(file.size)} · ` +
                `${file.type || "formato desconocido"}`;

            hide(uploadArea);
            show(previewArea);
            hide(processingArea);
            hide(analysisModal);
            hide(resultModal);

            imageInput.value = "";
        };

        image.onerror = function () {

            alert("No fue posible leer esta imagen.");

        };

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function formatBytes(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

analyzeButton.addEventListener("click", function () {

    if (!currentImage) {
        return;
    }

    hide(previewArea);
    show(processingArea);

    setTimeout(function () {

        analyzeImage(currentImage);

    }, 150);
});

function analyzeImage(image) {

    const canvas =
        document.createElement("canvas");

    const ctx =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height
    );

    const imageData =
        ctx.getImageData(
            0,
            0,
            image.width,
            image.height
        );

    currentImageData = imageData;

    originalPixels =
        new Uint8ClampedArray(
            imageData.data
        );

    currentAnalysis =
        calculateImageAnalysis(
            imageData
        );

    originalAnalysisImage.src =
        originalURL;

    manualOriginalImage.src =
        originalURL;

    resetManualState();

    showAnalysis(
        currentAnalysis
    );
}

function calculateImageAnalysis(imageData) {

    const data =
        imageData.data;

    const pixelCount =
        data.length / 4;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let totalGray = 0;
    let totalSaturation = 0;

    let minGray = 255;
    let maxGray = 0;

    const histogram =
        new Array(256).fill(0);

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        totalR += r;
        totalG += g;
        totalB += b;

        const gray =
            0.299 * r +
            0.587 * g +
            0.114 * b;

        totalGray += gray;

        histogram[
            Math.round(gray)
        ]++;

        minGray =
            Math.min(
                minGray,
                gray
            );

        maxGray =
            Math.max(
                maxGray,
                gray
            );

        const hsv =
            rgbToHsv(
                r,
                g,
                b
            );

        totalSaturation +=
            hsv.s;
    }

    const meanR =
        totalR / pixelCount;

    const meanG =
        totalG / pixelCount;

    const meanB =
        totalB / pixelCount;

    const meanGray =
        totalGray / pixelCount;

    const meanSaturation =
        totalSaturation /
        pixelCount;

    let variance = 0;

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const gray =
            0.299 * r +
            0.587 * g +
            0.114 * b;

        const difference =
            gray - meanGray;

        variance +=
            difference *
            difference;
    }

    variance =
        variance / pixelCount;

    const standardDeviation =
        Math.sqrt(variance);

    const dynamicRange =
        maxGray - minGray;

    const colorDifference =
        (
            Math.abs(meanR - meanG) +
            Math.abs(meanG - meanB) +
            Math.abs(meanR - meanB)
        ) / 3;

    let darkPixels = 0;
    let brightPixels = 0;

    for (
        let i = 0;
        i < 256;
        i++
    ) {

        if (i < 30) {
            darkPixels +=
                histogram[i];
        }

        if (i > 225) {
            brightPixels +=
                histogram[i];
        }
    }

    const darkPercentage =
        darkPixels /
        pixelCount *
        100;

    const brightPercentage =
        brightPixels /
        pixelCount *
        100;

    let illuminationStatus;

    if (meanGray < 70) {

        illuminationStatus =
            "oscura";

    } else if (meanGray > 190) {

        illuminationStatus =
            "muy iluminada";

    } else {

        illuminationStatus =
            "adecuada";
    }

    let contrastStatus;

    if (standardDeviation < 35) {

        contrastStatus =
            "bajo";

    } else if (standardDeviation > 75) {

        contrastStatus =
            "alto";

    } else {

        contrastStatus =
            "adecuado";
    }

    let colorStatus;

    if (
        meanSaturation < 0.12 &&
        colorDifference < 12
    ) {

        colorStatus =
            "bajo";

    } else {

        colorStatus =
            "significativo";
    }

    let mode =
        "RGB original";

    let reason =
        "La imagen conserva suficiente información " +
        "de color, iluminación y contraste. " +
        "Se recomienda conservarla sin modificaciones.";

    const operations = [];

    if (
        colorStatus === "bajo" &&
        contrastStatus !== "bajo"
    ) {

        mode =
            "Escala de grises";

        reason =
            "La variación cromática es baja y la " +
            "estructura de intensidad contiene gran " +
            "parte de la información disponible.";

        operations.push(
            "Conversión a escala de grises"
        );
    }

    if (meanGray < 70) {

        operations.push(
            "Corrección ligera de iluminación"
        );

        reason +=
            " La imagen presenta iluminación baja.";
    }

    if (meanGray > 190) {

        operations.push(
            "Reducción ligera de iluminación"
        );

        reason +=
            " La imagen presenta iluminación elevada.";
    }

    if (contrastStatus === "bajo") {

        operations.push(
            "Aumento moderado del contraste"
        );

        reason +=
            " El contraste es bajo.";
    }

    return {
        meanR,
        meanG,
        meanB,
        meanGray,
        meanSaturation,
        standardDeviation,
        dynamicRange,
        colorDifference,
        darkPercentage,
        brightPercentage,
        illuminationStatus,
        contrastStatus,
        colorStatus,
        mode,
        reason,
        operations
    };
}

function rgbToHsv(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;

    const max =
        Math.max(r, g, b);

    const min =
        Math.min(r, g, b);

    const difference =
        max - min;

    let h = 0;

    if (difference !== 0) {

        if (max === r) {

            h =
                60 *
                (
                    ((g - b) /
                        difference) % 6
                );

        } else if (max === g) {

            h =
                60 *
                (
                    ((b - r) /
                        difference) + 2
                );

        } else {

            h =
                60 *
                (
                    ((r - g) /
                        difference) + 4
                );
        }
    }

    if (h < 0) {
        h += 360;
    }

    const s =
        max === 0
            ? 0
            : difference / max;

    return {
        h,
        s,
        v: max
    };
}

function showAnalysis(analysis) {

    hide(processingArea);

    show(analysisModal);

    document.body.classList.add(
        "modal-open"
    );

    brightnessValue.textContent =
        analysis.meanGray.toFixed(1) +
        " / 255";

    brightnessText.textContent =
        analysis.illuminationStatus;

    contrastValue.textContent =
        analysis.standardDeviation.toFixed(1);

    contrastText.textContent =
        analysis.contrastStatus;

    saturationValue.textContent =
        (
            analysis.meanSaturation *
            100
        ).toFixed(1) +
        "%";

    saturationText.textContent =
        analysis.colorStatus;

    variationValue.textContent =
        analysis.dynamicRange.toFixed(1);

    analysisSummary.textContent =
        "El sistema analizó iluminación, contraste, " +
        "saturación y distribución de intensidades " +
        "antes de proponer un procesamiento.";

    recommendedMode.textContent =
        analysis.mode;

    recommendationText.textContent =
        analysis.reason;

    recommendationList.innerHTML = "";

    if (
        analysis.operations.length === 0
    ) {

        const item =
            document.createElement("div");

        item.className =
            "recommendation-item";

        item.textContent =
            "✓ No se requiere modificación.";

        recommendationList.appendChild(
            item
        );

    } else {

        for (
            let i = 0;
            i < analysis.operations.length;
            i++
        ) {

            const item =
                document.createElement("div");

            item.className =
                "recommendation-item";

            item.textContent =
                "• " +
                analysis.operations[i];

            recommendationList.appendChild(
                item
            );
        }
    }

    drawRecommendedImage();

    drawHistogram(
        originalHistogram,
        originalPixels
    );

    drawHistogram(
        processedHistogram,
        processedPixels
    );
}

function getRecommendedState() {

    const state = {
        mode: "rgb",
        brightness: 0,
        contrast: 0,
        saturation: 0,
        filter: "none"
    };

    if (
        currentAnalysis.mode ===
        "Escala de grises"
    ) {

        state.mode =
            "gray";
    }

    if (
        currentAnalysis.meanGray < 70
    ) {

        state.brightness =
            12;
    }

    if (
        currentAnalysis.meanGray > 190
    ) {

        state.brightness =
            -8;
    }

    if (
        currentAnalysis.standardDeviation < 35
    ) {

        state.contrast =
            15;
    }

    return state;
}

function drawRecommendedImage() {

    if (
        !currentImageData ||
        !currentAnalysis
    ) {
        return;
    }

    manualState =
        getRecommendedState();

    renderState(
        manualState,
        processedCanvas
    );

    processedPixels =
        getCanvasPixels(
            processedCanvas
        );
}

function renderState(
    state,
    canvas
) {

    if (!originalPixels) {
        return;
    }

    const width =
        currentImageData.width;

    const height =
        currentImageData.height;

    canvas.width =
        width;

    canvas.height =
        height;

    const output =
        new Uint8ClampedArray(
            originalPixels
        );

    applyMode(
        output,
        state.mode
    );

    applyBrightness(
        output,
        state.brightness
    );

    applyContrast(
        output,
        state.contrast
    );

    applySaturation(
        output,
        state.saturation
    );

    const processed =
        applyFilter(
            output,
            width,
            height,
            state.filter
        );

    const ctx =
        canvas.getContext("2d");

    const result =
        new ImageData(
            processed,
            width,
            height
        );

    ctx.putImageData(
        result,
        0,
        0
    );

    return processed;
}

function applyMode(
    data,
    mode
) {

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (mode === "gray") {

            const gray =
                0.299 * r +
                0.587 * g +
                0.114 * b;

            data[i] =
                gray;

            data[i + 1] =
                gray;

            data[i + 2] =
                gray;
        }

        if (mode === "color") {

            const gray =
                (
                    0.299 * r +
                    0.587 * g +
                    0.114 * b
                ) / 255;

            const mapped =
                intensityMap(
                    gray
                );

            data[i] =
                mapped.r;

            data[i + 1] =
                mapped.g;

            data[i + 2] =
                mapped.b;
        }
    }
}

function intensityMap(value) {

    let r = 0;
    let g = 0;
    let b = 0;

    if (value < .25) {

        r = 0;
        g = value * 4 * 255;
        b = 255;

    } else if (value < .5) {

        r = 0;
        g = 255;
        b =
            (1 -
                (value - .25) * 4) *
            255;

    } else if (value < .75) {

        r =
            (value - .5) *
            4 *
            255;

        g = 255;
        b = 0;

    } else {

        r = 255;

        g =
            (1 -
                (value - .75) * 4) *
            255;

        b = 0;
    }

    return {
        r,
        g,
        b
    };
}

function applyBrightness(
    data,
    value
) {

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        data[i] =
            clamp(
                data[i] + value * 1.5,
                0,
                255
            );

        data[i + 1] =
            clamp(
                data[i + 1] + value * 1.5,
                0,
                255
            );

        data[i + 2] =
            clamp(
                data[i + 2] + value * 1.5,
                0,
                255
            );
    }
}

function applyContrast(
    data,
    value
) {

    const factor =
        (259 *
            (value + 255)) /
        (255 *
            (259 - value));

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        data[i] =
            clamp(
                factor *
                (data[i] - 128) +
                128,
                0,
                255
            );

        data[i + 1] =
            clamp(
                factor *
                (data[i + 1] - 128) +
                128,
                0,
                255
            );

        data[i + 2] =
            clamp(
                factor *
                (data[i + 2] - 128) +
                128,
                0,
                255
            );
    }
}

function applySaturation(
    data,
    value
) {

    const factor =
        1 + value / 100;

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const gray =
            0.299 * r +
            0.587 * g +
            0.114 * b;

        data[i] =
            clamp(
                gray +
                (r - gray) *
                factor,
                0,
                255
            );

        data[i + 1] =
            clamp(
                gray +
                (g - gray) *
                factor,
                0,
                255
            );

        data[i + 2] =
            clamp(
                gray +
                (b - gray) *
                factor,
                0,
                255
            );
    }
}

function applyFilter(
    data,
    width,
    height,
    filter
) {

    if (filter === "none") {
        return data;
    }

    const result =
        new Uint8ClampedArray(
            data
        );

    for (
        let y = 1;
        y < height - 1;
        y++
    ) {

        for (
            let x = 1;
            x < width - 1;
            x++
        ) {

            const center =
                (y * width + x) *
                4;

            let r = 0;
            let g = 0;
            let b = 0;

            if (filter === "blur") {

                for (
                    let ky = -1;
                    ky <= 1;
                    ky++
                ) {

                    for (
                        let kx = -1;
                        kx <= 1;
                        kx++
                    ) {

                        const index =
                            (
                                (y + ky) *
                                width +
                                (x + kx)
                            ) * 4;

                        r +=
                            data[index];

                        g +=
                            data[index + 1];

                        b +=
                            data[index + 2];
                    }
                }

                result[center] =
                    r / 9;

                result[center + 1] =
                    g / 9;

                result[center + 2] =
                    b / 9;
            }

            if (filter === "sharpen") {

                const kernel = [
                    0, -1, 0,
                    -1, 5, -1,
                    0, -1, 0
                ];

                let rr = 0;
                let gg = 0;
                let bb = 0;

                let k = 0;

                for (
                    let ky = -1;
                    ky <= 1;
                    ky++
                ) {

                    for (
                        let kx = -1;
                        kx <= 1;
                        kx++
                    ) {

                        const index =
                            (
                                (y + ky) *
                                width +
                                (x + kx)
                            ) * 4;

                        rr +=
                            data[index] *
                            kernel[k];

                        gg +=
                            data[index + 1] *
                            kernel[k];

                        bb +=
                            data[index + 2] *
                            kernel[k];

                        k++;
                    }
                }

                result[center] =
                    clamp(
                        rr,
                        0,
                        255
                    );

                result[center + 1] =
                    clamp(
                        gg,
                        0,
                        255
                    );

                result[center + 2] =
                    clamp(
                        bb,
                        0,
                        255
                    );
            }
        }
    }

    return result;
}

function getCanvasPixels(canvas) {

    const ctx =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );

    return new Uint8ClampedArray(
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        ).data
    );
}

function drawHistogram(
    canvas,
    pixels
) {

    if (!canvas || !pixels) {
        return;
    }

    const width = 700;
    const height = 220;

    canvas.width =
        width;

    canvas.height =
        height;

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    const histogram =
        new Array(256).fill(0);

    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        const gray =
            Math.round(
                0.299 * pixels[i] +
                0.587 * pixels[i + 1] +
                0.114 * pixels[i + 2]
            );

        histogram[
            clamp(
                gray,
                0,
                255
            )
        ]++;
    }

    let max =
        1;

    for (
        let i = 0;
        i < histogram.length;
        i++
    ) {

        if (
            histogram[i] >
            max
        ) {

            max =
                histogram[i];
        }
    }

    ctx.beginPath();

    ctx.moveTo(
        0,
        height
    );

    for (
        let i = 0;
        i < 256;
        i++
    ) {

        const x =
            i *
            width /
            255;

        const y =
            height -
            (
                histogram[i] /
                max
            ) *
            (
                height - 10
            );

        ctx.lineTo(
            x,
            y
        );
    }

    ctx.lineTo(
        width,
        height
    );

    ctx.closePath();

    ctx.fillStyle =
        "rgba(65,61,86,.28)";

    ctx.fill();

    ctx.beginPath();

    for (
        let i = 0;
        i < 256;
        i++
    ) {

        const x =
            i *
            width /
            255;

        const y =
            height -
            (
                histogram[i] /
                max
            ) *
            (
                height - 10
            );

        if (i === 0) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );
        }
    }

    ctx.strokeStyle =
        "#413d56";

    ctx.lineWidth =
        2;

    ctx.stroke();

    ctx.strokeStyle =
        "#b9b4aa";

    ctx.lineWidth =
        1;

    ctx.beginPath();

    ctx.moveTo(
        0,
        height - 1
    );

    ctx.lineTo(
        width,
        height - 1
    );

    ctx.stroke();

    ctx.fillStyle =
        "#777";

    ctx.font =
        "12px Arial";

    ctx.fillText(
        "0",
        5,
        height - 8
    );

    ctx.fillText(
        "128",
        width / 2 - 10,
        height - 8
    );

    ctx.fillText(
        "255",
        width - 28,
        height - 8
    );
}

function resetManualState() {

    manualState = {
        mode: "rgb",
        brightness: 0,
        contrast: 0,
        saturation: 0,
        filter: "none"
    };

    manualHistory = [];

    updateManualControls();

    if (manualCanvas) {

        renderState(
            manualState,
            manualCanvas
        );

        const pixels =
            getCanvasPixels(
                manualCanvas
            );

        drawHistogram(
            manualHistogram,
            pixels
        );
    }
}

function updateManualControls() {

    manualBrightness.value =
        manualState.brightness;

    manualContrast.value =
        manualState.contrast;

    manualSaturation.value =
        manualState.saturation;

    manualFilter.value =
        manualState.filter;

    manualBrightnessValue.textContent =
        manualState.brightness;

    manualContrastValue.textContent =
        manualState.contrast;

    manualSaturationValue.textContent =
        manualState.saturation;

    document
        .querySelectorAll(".manual-option")
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.dataset.mode ===
                manualState.mode
            );
        });

    updateManualStatus();
}

function updateManualStatus() {

    const parts = [];

    if (
        manualState.mode ===
        "gray"
    ) {

        parts.push(
            "Escala de grises"
        );

    } else if (
        manualState.mode ===
        "color"
    ) {

        parts.push(
            "Mapa de intensidad"
        );

    } else {

        parts.push(
            "RGB"
        );
    }

    if (
        manualState.brightness !== 0
    ) {

        parts.push(
            "brillo " +
            manualState.brightness
        );
    }

    if (
        manualState.contrast !== 0
    ) {

        parts.push(
            "contraste " +
            manualState.contrast
        );
    }

    if (
        manualState.saturation !== 0
    ) {

        parts.push(
            "saturación " +
            manualState.saturation
        );
    }

    if (
        manualState.filter !==
        "none"
    ) {

        parts.push(
            manualState.filter ===
            "blur"
                ? "suavizado"
                : "realce de bordes"
        );
    }

    if (parts.length === 1) {

        manualStatus.textContent =
            "Imagen original sin modificaciones.";

    } else {

        manualStatus.textContent =
            "Procesamiento actual: " +
            parts.join(", ") +
            ".";
    }
}

function saveManualState() {

    manualHistory.push({
        mode:
            manualState.mode,

        brightness:
            manualState.brightness,

        contrast:
            manualState.contrast,

        saturation:
            manualState.saturation,

        filter:
            manualState.filter
    });

    if (
        manualHistory.length >
        20
    ) {

        manualHistory.shift();
    }
}

function updateManualPreview() {

    saveManualState();

    renderState(
        manualState,
        manualCanvas
    );

    const pixels =
        getCanvasPixels(
            manualCanvas
        );

    drawHistogram(
        manualHistogram,
        pixels
    );

    updateManualControls();
}

document
    .querySelectorAll(".manual-option")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                manualState.mode =
                    button.dataset.mode;

                updateManualPreview();
            }
        );
    });

manualBrightness.addEventListener(
    "input",
    function() {

        manualState.brightness =
            Number(
                manualBrightness.value
            );

        renderState(
            manualState,
            manualCanvas
        );

        const pixels =
            getCanvasPixels(
                manualCanvas
            );

        drawHistogram(
            manualHistogram,
            pixels
        );

        updateManualControls();
    }
);

manualContrast.addEventListener(
    "input",
    function() {

        manualState.contrast =
            Number(
                manualContrast.value
            );

        renderState(
            manualState,
            manualCanvas
        );

        const pixels =
            getCanvasPixels(
                manualCanvas
            );

        drawHistogram(
            manualHistogram,
            pixels
        );

        updateManualControls();
    }
);

manualSaturation.addEventListener(
    "input",
    function() {

        manualState.saturation =
            Number(
                manualSaturation.value
            );

        renderState(
            manualState,
            manualCanvas
        );

        const pixels =
            getCanvasPixels(
                manualCanvas
            );

        drawHistogram(
            manualHistogram,
            pixels
        );

        updateManualControls();
    }
);

manualFilter.addEventListener(
    "change",
    function() {

        manualState.filter =
            manualFilter.value;

        updateManualPreview();
    }
);

manualButton.addEventListener(
    "click",
    function() {

        show(manualPanel);

        resetManualState();

        manualCanvas.width =
            currentImageData.width;

        manualCanvas.height =
            currentImageData.height;

        renderState(
            manualState,
            manualCanvas
        );

        const pixels =
            getCanvasPixels(
                manualCanvas
            );

        drawHistogram(
            manualHistogram,
            pixels
        );

        manualPanel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
);

closeManual.addEventListener(
    "click",
    function() {

        hide(manualPanel);

        resetManualState();
    }
);

cancelManual.addEventListener(
    "click",
    function() {

        hide(manualPanel);

        resetManualState();
    }
);

undoButton.addEventListener(
    "click",
    function() {

        if (
            manualHistory.length === 0
        ) {

            return;
        }

        manualHistory.pop();

        const previous =
            manualHistory[
                manualHistory.length - 1
            ];

        if (previous) {

            manualState = {
                mode:
                    previous.mode,

                brightness:
                    previous.brightness,

                contrast:
                    previous.contrast,

                saturation:
                    previous.saturation,

                filter:
                    previous.filter
            };

        } else {

            manualState = {
                mode: "rgb",
                brightness: 0,
                contrast: 0,
                saturation: 0,
                filter: "none"
            };
        }

        renderState(
            manualState,
            manualCanvas
        );

        const pixels =
            getCanvasPixels(
                manualCanvas
            );

        drawHistogram(
            manualHistogram,
            pixels
        );

        updateManualControls();
    }
);

resetManual.addEventListener(
    "click",
    function() {

        resetManualState();

        renderState(
            manualState,
            manualCanvas
        );

        const pixels =
            getCanvasPixels(
                manualCanvas
            );

        drawHistogram(
            manualHistogram,
            pixels
        );
    }
);

applyManual.addEventListener(
    "click",
    function() {

        renderState(
            manualState,
            processedCanvas
        );

        processedPixels =
            getCanvasPixels(
                processedCanvas
            );

        drawHistogram(
            processedHistogram,
            processedPixels
        );

        const modeText =
            getModeText(
                manualState
            );

        recommendedMode.textContent =
            modeText;

        recommendationText.textContent =
            "Se aplicaron los ajustes seleccionados " +
            "manualmente sobre la imagen.";

        hide(manualPanel);

        processedCanvas.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
);

applyRecommendation.addEventListener(
    "click",
    function() {

        manualState =
            getRecommendedState();

        renderState(
            manualState,
            processedCanvas
        );

        processedPixels =
            getCanvasPixels(
                processedCanvas
            );

        drawHistogram(
            processedHistogram,
            processedPixels
        );

        openResult(
            getModeText(
                manualState
            )
        );
    }
);

keepOriginalButton.addEventListener(
    "click",
    function() {

        processedCanvas.width =
            currentImageData.width;

        processedCanvas.height =
            currentImageData.height;

        const ctx =
            processedCanvas.getContext(
                "2d"
            );

        const result =
            new ImageData(
                new Uint8ClampedArray(
                    originalPixels
                ),
                currentImageData.width,
                currentImageData.height
            );

        ctx.putImageData(
            result,
            0,
            0
        );

        processedPixels =
            new Uint8ClampedArray(
                originalPixels
            );

        drawHistogram(
            processedHistogram,
            processedPixels
        );

        openResult(
            "Imagen original"
        );
    }
);

function getModeText(state) {

    let text = "";

    if (
        state.mode ===
        "gray"
    ) {

        text =
            "Escala de grises";

    } else if (
        state.mode ===
        "color"
    ) {

        text =
            "Mapa de intensidad";

    } else {

        text =
            "RGB";
    }

    if (
        state.brightness !== 0
    ) {

        text +=
            " · Brillo " +
            state.brightness;
    }

    if (
        state.contrast !== 0
    ) {

        text +=
            " · Contraste " +
            state.contrast;
    }

    if (
        state.saturation !== 0
    ) {

        text +=
            " · Saturación " +
            state.saturation;
    }

    if (
        state.filter !==
        "none"
    ) {

        text +=
            " · " +
            (
                state.filter ===
                "blur"
                    ? "Suavizado"
                    : "Realce de bordes"
            );
    }

    return text;
}

function openResult(
    processing
) {

    hide(analysisModal);

    hide(manualPanel);

    resultFileName.textContent =
        fileName.textContent;

    resultProcessing.textContent =
        processing;

    resultIcon.textContent =
        "?";

    resultTitle.textContent =
        "Modelo de detección pendiente";

    resultDescription.textContent =
        "El procesamiento de la imagen se completó " +
        "correctamente. La interfaz está preparada " +
        "para recibir el resultado del modelo de " +
        "clasificación de Alzheimer, pero ese modelo " +
        "todavía no está conectado a esta versión.";

    show(resultModal);

    document.body.classList.add(
        "modal-open"
    );
}

closeAnalysis.addEventListener(
    "click",
    function() {

        hide(analysisModal);

        hide(manualPanel);

        document.body.classList.remove(
            "modal-open"
        );
    }
);

closeResult.addEventListener(
    "click",
    function() {

        hide(resultModal);

        document.body.classList.remove(
            "modal-open"
        );
    }
);

document
    .querySelector(".modal-backdrop")
    .addEventListener(
        "click",
        function() {

            hide(analysisModal);

            hide(manualPanel);

            document.body.classList.remove(
                "modal-open"
            );
        }
    );

newAnalysisButton.addEventListener(
    "click",
    function() {

        currentImage = null;
        currentImageData = null;
        currentAnalysis = null;
        originalPixels = null;
        processedPixels = null;

        hide(resultModal);
        hide(analysisModal);
        hide(manualPanel);
        hide(previewArea);
        hide(processingArea);

        show(uploadArea);

        previewImage.removeAttribute(
            "src"
        );

        originalAnalysisImage.removeAttribute(
            "src"
        );

        manualOriginalImage.removeAttribute(
            "src"
        );

        imageInput.value = "";

        document.body.classList.remove(
            "modal-open"
        );

        document
            .getElementById("analizar")
            .scrollIntoView({
                behavior: "smooth"
            });
    }
);

changeButton.addEventListener(
    "click",
    function() {

        imageInput.click();
    }
);

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            hide(manualPanel);
            hide(analysisModal);
            hide(resultModal);

            document.body.classList.remove(
                "modal-open"
            );
        }
    }
);

document.addEventListener(
    "dragover",
    function(event) {

        event.preventDefault();
    }
);

document.addEventListener(
    "drop",
    function(event) {

        event.preventDefault();
    }
);