const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const previewArea = document.getElementById("previewArea");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const fileInfo = document.getElementById("fileInfo");
const analyzeButton = document.getElementById("analyzeButton");
const changeButton = document.getElementById("changeButton");
const resultArea = document.getElementById("resultArea");
const newAnalysisButton = document.getElementById("newAnalysisButton");


imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        previewImage.src = event.target.result;

        fileName.textContent = file.name;

        fileInfo.textContent =
            "Tipo: " + file.type +
            " · Tamaño: " +
            Math.round(file.size / 1024) +
            " KB";

        uploadArea.classList.add("hidden");

        resultArea.classList.add("hidden");

        previewArea.classList.remove("hidden");
    };

    reader.readAsDataURL(file);
});




analyzeButton.addEventListener("click", function () {

    previewArea.classList.add("hidden");

    resultArea.classList.remove("hidden");

});



changeButton.addEventListener("click", function () {

    imageInput.value = "";

    uploadArea.classList.remove("hidden");

    previewArea.classList.add("hidden");

    resultArea.classList.add("hidden");

});




newAnalysisButton.addEventListener("click", function () {

    imageInput.value = "";

    resultArea.classList.add("hidden");

    uploadArea.classList.remove("hidden");

});