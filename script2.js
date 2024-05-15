const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    undoBtn = document.querySelector(".undo"),
    redoBtn = document.querySelector(".redo"),
    loadImgBtn = document.querySelector(".load-img-btn"),
    loadImgInput = document.getElementById("load-img"),
    ctx = canvas.getContext("2d");

let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000",
    undoStack = [],
    redoStack = [];

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
};

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
    pushSnapshot();
});

const pushSnapshot = () => {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack = [];
    updateUndoRedoButtons();
};

const updateUndoRedoButtons = () => {
    undoBtn.disabled = undoStack.length === 0;
    redoBtn.disabled = redoStack.length === 0;
};

const drawRect = (e) => {
    if (!fillColor.checked) {
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
};

const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawLine = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
};

const drawStar = (e) => {
    const innerRadius = 10; 
    const outerRadius = 20; 
    const numPoints = 5; 
    const rotation = Math.PI / 2 * 3; 

    const angle = Math.PI / numPoints;
    ctx.beginPath();
    ctx.moveTo(e.offsetX + outerRadius * Math.cos(rotation), e.offsetY + outerRadius * Math.sin(rotation));
    for (let i = 0; i < numPoints; i++) {
        rotation += angle;
        ctx.lineTo(e.offsetX + innerRadius * Math.cos(rotation), e.offsetY + innerRadius * Math.sin(rotation));
        rotation += angle;
        ctx.lineTo(e.offsetX + outerRadius * Math.cos(rotation), e.offsetY + outerRadius * Math.sin(rotation));
    }
    ctx.closePath();
    ctx.stroke();
};

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;

    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else if (selectedTool === "triangle") {
        drawTriangle(e);
    } else if (selectedTool === "line") {
        drawLine(e);
    } else if (selectedTool === "star") {
        drawStar(e);
    }
};

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");

        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    pushSnapshot();
});

undoBtn.addEventListener("click", () => {
    if (undoStack.length > 0) {
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(undoStack.pop(), 0, 0);
        updateUndoRedoButtons();
    }
});

redoBtn.addEventListener("click", () => {
    if (redoStack.length > 0) {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(redoStack.pop(), 0, 0);
        updateUndoRedoButtons();
    }
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}`;

    const pngCanvas = document.createElement("canvas");
    const pngCtx = pngCanvas.getContext("2d");
    pngCanvas.width = canvas.width;
    pngCanvas.height = canvas.height;
    pngCtx.drawImage(canvas, 0, 0);
    link.href = pngCanvas.toDataURL("image/png");
    link.click();

    const jpegCanvas = document.createElement("canvas");
    const jpegCtx = jpegCanvas.getContext("2d");
    jpegCanvas.width = canvas.width;
    jpegCanvas.height = canvas.height;
    jpegCtx.drawImage(canvas, 0, 0);
    link.href = jpegCanvas.toDataURL("image/jpeg");
    link.download = `${Date.now()}.jpg`;
    link.click();

    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${canvas.outerHTML}</div></foreignObject></svg>`;
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    link.href = svgUrl;
    link.download = `${Date.now()}.svg`;
    link.click();
});

loadImgBtn.addEventListener("click", () => {
    loadImgInput.click();
});

loadImgInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                pushSnapshot();
            };
        };

        reader.readAsDataURL(file);
    }
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    pushSnapshot();
});

