/* ===============================
   STACK CARD – SCROLL CINEMATIC
   =============================== */

const stack = document.getElementById("stack");
const cards = Array.from(stack.querySelectorAll(".card"));

/* ---- Visual tuning ---- */
const MAX_VISIBLE = 4;
const OFFSET_Y = 18;
const SCALE_STEP = 0.04;
const ROTATE_X = -8;

/* ---- Scroll tuning ---- */
const SCROLL_THRESHOLD = 120;  // how much scroll needed per card
const SCROLL_COOLDOWN = 600;   // lock during animation

/* ---- Autoplay (still supported) ---- */
const AUTOPLAY_INTERVAL = 2600;

/* ---- State ---- */
let activeIndex = 0;
let isAnimating = false;
let scrollAccumulator = 0;
let lastScrollTime = 0;
let autoplayTimer = null;

/* ---------------- HAPTICS ---------------- */
function haptic(pattern) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
}

/* ---------------- LAYOUT ---------------- */
function layoutCards() {
    const total = cards.length;

    cards.forEach((card, i) => {
        const diff = (i - activeIndex + total) % total;

        if (diff < MAX_VISIBLE) {
            const y = diff * OFFSET_Y;
            const scale = 1 - diff * SCALE_STEP;

            card.style.transition =
                "transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.6s ease";

            card.style.transform = `
                translateY(${y}px)
                scale(${scale})
                rotateX(${ROTATE_X}deg)
            `;

            card.style.boxShadow =
                `0 ${12 + diff * 4}px ${24 + diff * 6}px rgba(0,0,0,0.08)`;

            card.style.opacity = 1;
            card.style.zIndex = MAX_VISIBLE - diff;
            card.style.pointerEvents = diff === 0 ? "auto" : "none";
            card.style.setProperty("--light-intensity", diff === 0 ? 0.15 : 0);
        } else {
            card.style.opacity = 0;
            card.style.pointerEvents = "none";
        }
    });
}

layoutCards();

/* ---------------- CARD TRANSITIONS ---------------- */
function nextCard() {
    if (isAnimating) return;
    isAnimating = true;

    const card = cards[activeIndex];
    haptic([10, 20, 30]);

    card.style.transition =
        "transform 0.5s cubic-bezier(0.215,0.61,0.355,1)";

    card.style.transform = `
        translate(120%, -120px)
        rotate(30deg)
    `;

    setTimeout(() => {
        activeIndex = (activeIndex + 1) % cards.length;
        layoutCards();
        isAnimating = false;
    }, SCROLL_COOLDOWN);
}

function prevCard() {
    if (isAnimating) return;
    isAnimating = true;

    activeIndex =
        (activeIndex - 1 + cards.length) % cards.length;

    const card = cards[activeIndex];
    haptic([30, 10, 10]);

    card.style.transition = "none";
    card.style.transform = `
        translate(-120%, -120px)
        rotate(-30deg)
    `;

    requestAnimationFrame(() => {
        card.style.transition =
            "transform 0.5s cubic-bezier(0.23,1,0.32,1)";
        layoutCards();
        isAnimating = false;
    });
}

/* ---------------- SCROLL HANDLER ---------------- */
function onWheel(e) {
    e.preventDefault();
    stopAutoplay();

    const now = performance.now();
    if (now - lastScrollTime > 300) {
        scrollAccumulator = 0;
    }
    lastScrollTime = now;

    scrollAccumulator += e.deltaY;

    if (Math.abs(scrollAccumulator) >= SCROLL_THRESHOLD) {
        if (scrollAccumulator > 0) {
            nextCard();
        } else {
            prevCard();
        }
        scrollAccumulator = 0;
    }
}

/* ---------------- AUTOPLAY ---------------- */
function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
        if (!isAnimating) nextCard();
    }, AUTOPLAY_INTERVAL);
}

function stopAutoplay() {
    clearInterval(autoplayTimer);
}

/* ---------------- EVENTS ---------------- */
stack.addEventListener(
    "wheel",
    onWheel,
    { passive: false }
);

/* Optional: click fallback */
stack.addEventListener("click", () => {
    stopAutoplay();
    nextCard();
});

/* ---- Start in cinematic demo mode ---- */
startAutoplay();
