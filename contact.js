const EMAILJS_SERVICE_ID = "service_c6roilh";
const EMAILJS_TEMPLATE_ID = "template_7b21nl7";
const EMAILJS_PUBLIC_KEY = "Ma1U09KC_apRla0aV";

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

function initContactForm() {
    const form = document.getElementById("contact-form");
    const statusText = document.getElementById("contact-status");
    const submitButton = form?.querySelector(".contact-submit");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const fromNameInput = document.getElementById("from_name");
    const fromEmailInput = document.getElementById("from_email");
    const replyToInput = document.getElementById("reply_to");

    if (
        !form ||
        !statusText ||
        !submitButton ||
        !nameInput ||
        !emailInput ||
        !fromNameInput ||
        !fromEmailInput ||
        !replyToInput ||
        typeof emailjs === "undefined"
    ) {
        return;
    }

    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        fromNameInput.value = nameInput.value.trim();
        fromEmailInput.value = emailInput.value.trim();
        replyToInput.value = emailInput.value.trim();

        statusText.textContent = "Sending your message...";
        statusText.classList.remove("is-error");
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
            .then(() => {
                statusText.textContent = "Message sent successfully. I will get back to you soon.";
                form.reset();
            })
            .catch((error) => {
                console.error("EmailJS error:", error);
                const errorMessage = error?.text || error?.message || "Please try again.";
                const errorCode = error?.status ? ` (${error.status})` : "";
                statusText.textContent = `Message failed to send${errorCode}: ${errorMessage}`;
                statusText.classList.add("is-error");
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Send Message →";
            });
    });
}

function initContactPage() {
    initCursor();
    initContactForm();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactPage, { once: true });
} else {
    initContactPage();
}
