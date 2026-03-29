const TOTAL_FRAMES = 240;
const FRAME_PATH = "ezgif-77a1f64dd7d22636-jpg";
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");
const preloader = document.getElementById("preloader");
const progressBar = document.getElementById("progress-bar");
const loadingPercentage = document.getElementById("loading-percentage");
const navbar = document.getElementById("navbar");
const scrollHint = document.getElementById("scroll-hint");
const heroSection = document.getElementById("hero-scroll");
const beatElements = [
    { element: document.getElementById("beat-1"), start: 0, end: 0.2 },
    { element: document.getElementById("beat-2"), start: 0.2, end: 0.45 },
    { element: document.getElementById("beat-3"), start: 0.45, end: 0.7 },
    { element: document.getElementById("beat-4"), start: 0.7, end: 0.9 },
    { element: document.getElementById("beat-5"), start: 0.9, end: 1.01 }
];
const sectionObserverTargets = document.querySelectorAll(".fade-in-section");

const frames = [];
let currentFrameIndex = -1;
let rafId = null;
let hasLoaded = false;
let currentProgress = 0;

function frameUrl(index) {
    return `${FRAME_PATH}/ezgif-frame-${String(index).padStart(3, "0")}.jpg`;
}

function updatePreloader(progress) {
    const percentage = Math.round(progress * 100);
    loadingPercentage.textContent = String(percentage);
    progressBar.style.width = `${percentage}%`;
}

function preloadFrames() {
    let loaded = 0;

    const loaders = Array.from({ length: TOTAL_FRAMES }, (_, offset) => {
        const frameNumber = offset + 1;
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.decoding = "async";
            image.src = frameUrl(frameNumber);
            image.onload = () => {
                frames[offset] = image;
                loaded += 1;
                updatePreloader(loaded / TOTAL_FRAMES);
                resolve(image);
            };
            image.onerror = () => reject(new Error(`Failed to load frame ${frameNumber}`));
        });
    });

    return Promise.all(loaders);
}

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(window.innerWidth * dpr);
    const height = Math.floor(window.innerHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
    }

    drawFrame(Math.max(currentFrameIndex, 0), currentProgress);
}

function drawFrame(index, progress = currentProgress) {
    const image = frames[index];
    if (!image) {
        return;
    }

    currentFrameIndex = index;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imageRatio = image.width / image.height;
    const canvasRatio = canvasWidth / canvasHeight;

    const introT = Math.max(0, 1 - Math.min(progress / 0.18, 1));
    const containScale = 0.88;
    const coverScale = 1.06;
    const blendedScale = containScale + (coverScale - containScale) * introT;

    let drawWidth;
    let drawHeight;

    if (imageRatio > canvasRatio) {
        drawHeight = canvasHeight * blendedScale;
        drawWidth = drawHeight * imageRatio;
    } else {
        drawWidth = canvasWidth * blendedScale;
        drawHeight = drawWidth / imageRatio;
    }

    const desktopShift = window.innerWidth > 860 ? canvasWidth * 0.08 * introT : 0;
    const x = (canvasWidth - drawWidth) / 2 + desktopShift;
    const y = (canvasHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function getHeroProgress() {
    const rect = heroSection.getBoundingClientRect();
    const totalScrollable = heroSection.offsetHeight - window.innerHeight;

    if (totalScrollable <= 0) {
        return 0;
    }

    const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
    return scrolled / totalScrollable;
}

function updateBeatVisibility(progress) {
    beatElements.forEach(({ element, start, end }) => {
        if (!element) {
            return;
        }

        const isActive = progress >= start && progress < end;
        element.classList.toggle("is-active", isActive);
    });

    scrollHint.classList.toggle("is-hidden", progress > 0.12);
}

function updateNavbar() {
    const scrollY = window.scrollY || window.pageYOffset;
    navbar.classList.toggle("is-visible", scrollY > 24 || hasLoaded);
    navbar.classList.toggle("is-scrolled", scrollY > 80);
}

function renderOnScroll() {
    rafId = null;

    if (!hasLoaded) {
        return;
    }

    const progress = getHeroProgress();
    currentProgress = progress;
    const nextFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(progress * (TOTAL_FRAMES - 1))
    );

    if (nextFrame !== currentFrameIndex) {
        drawFrame(nextFrame, progress);
    } else {
        drawFrame(nextFrame, progress);
    }

    updateBeatVisibility(progress);
    updateNavbar();
}

function requestRender() {
    if (rafId !== null) {
        return;
    }

    rafId = window.requestAnimationFrame(renderOnScroll);
}

function initCursor() {
    const cursor = document.getElementById("custom-cursor");
    if (!cursor || window.matchMedia("(pointer: coarse)").matches) {
        return;
    }

    const state = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        targetX: window.innerWidth / 2,
        targetY: window.innerHeight / 2
    };

    function tick() {
        state.x += (state.targetX - state.x) * 0.18;
        state.y += (state.targetY - state.y) * 0.18;
        cursor.style.transform = `translate(${state.x}px, ${state.y}px) translate(-50%, -50%)`;
        window.requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", (event) => {
        state.targetX = event.clientX;
        state.targetY = event.clientY;
        cursor.classList.add("is-visible");
    });

    window.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-visible");
    });

    tick();
}

function initSectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sectionObserverTargets.forEach((target) => observer.observe(target));
}

function hidePreloader() {
    preloader.classList.add("is-hidden");
    document.body.classList.remove("is-loading");
}

function init() {
    document.body.classList.add("is-loading");
    initCursor();
    initSectionObserver();
    updateBeatVisibility(0);
    updateNavbar();

    preloadFrames()
        .then(() => {
            hasLoaded = true;
            resizeCanvas();
            currentProgress = 0;
            drawFrame(0, 0);
            updateBeatVisibility(0);
            hidePreloader();
            updateNavbar();
            requestRender();
        })
        .catch((error) => {
            console.error(error);
            loadingPercentage.textContent = "Error";
        });
}

window.addEventListener("scroll", requestRender, { passive: true });
window.addEventListener("resize", () => {
    resizeCanvas();
    requestRender();
}, { passive: true });

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
