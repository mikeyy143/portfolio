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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCursor, { once: true });
} else {
    initCursor();
}
