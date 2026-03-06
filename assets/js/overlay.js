// assets/js/overlay.js
document.addEventListener("DOMContentLoaded", () => {
    const scrollyContainer = document.getElementById("scrolly-container");
    const overlayIntro = document.getElementById("overlay-intro");
    const overlaySystems = document.getElementById("overlay-systems");
    const overlayBridging = document.getElementById("overlay-bridging");

    if (!scrollyContainer || !overlayIntro || !overlaySystems || !overlayBridging) return;

    // We attach scroll listener to calculate opacities based on scroll position
    window.addEventListener("scroll", () => {
        const rect = scrollyContainer.getBoundingClientRect();

        // Calculate scroll progress through the container (0 to 1)
        const maxScroll = rect.height - window.innerHeight;
        const currentScroll = -rect.top;

        let scrollFraction = currentScroll / maxScroll;

        // Clamp between 0 and 1
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));

        // Section 1: Intro (0% to 20%)
        // Opacity 1 at 0-10%, fading to 0 by 20%
        if (scrollFraction <= 0.1) {
            overlayIntro.style.opacity = "1";
            overlayIntro.style.transform = "translate(-50%, -50%)"; // Center transform
        } else if (scrollFraction <= 0.3) {
            const fadeProg = (scrollFraction - 0.1) / 0.2; // 0 -> 1
            overlayIntro.style.opacity = `${1 - fadeProg}`;
            overlayIntro.style.transform = `translate(-50%, calc(-50% - ${fadeProg * 50}px))`;
        } else {
            overlayIntro.style.opacity = "0";
        }

        // Section 2: Building Systems (30% to 50%)
        // Fades in 25-30%, holds 30-45%, fades out 45-55%
        if (scrollFraction > 0.1 && scrollFraction < 0.6) {
            if (scrollFraction >= 0.25 && scrollFraction < 0.3) {
                const prog = (scrollFraction - 0.25) / 0.05;
                overlaySystems.style.opacity = `${prog}`;
                overlaySystems.style.transform = `translateY(${50 - prog * 50}px)`;
            } else if (scrollFraction >= 0.3 && scrollFraction <= 0.45) {
                overlaySystems.style.opacity = "1";
                overlaySystems.style.transform = "translateY(0)";
            } else if (scrollFraction > 0.45 && scrollFraction <= 0.55) {
                const prog = (scrollFraction - 0.45) / 0.1;
                overlaySystems.style.opacity = `${1 - prog}`;
                overlaySystems.style.transform = `translateY(${-prog * 50}px)`;
            } else {
                overlaySystems.style.opacity = "0";
            }
        } else {
            overlaySystems.style.opacity = "0";
        }

        // Section 3: Bridging engineering (60% to 80%)
        // Fades in 55-60%, holds 60-80%, fades out 80-90%
        if (scrollFraction > 0.45) {
            if (scrollFraction >= 0.55 && scrollFraction < 0.6) {
                const prog = (scrollFraction - 0.55) / 0.05;
                overlayBridging.style.opacity = `${prog}`;
                overlayBridging.style.transform = `translateY(${50 - prog * 50}px)`;
            } else if (scrollFraction >= 0.6 && scrollFraction <= 0.8) {
                overlayBridging.style.opacity = "1";
                overlayBridging.style.transform = "translateY(0)";
            } else if (scrollFraction > 0.8 && scrollFraction <= 0.95) {
                const prog = (scrollFraction - 0.8) / 0.15;
                overlayBridging.style.opacity = `${1 - prog}`;
                overlayBridging.style.transform = `translateY(${-prog * 50}px)`;
            } else {
                overlayBridging.style.opacity = "0";
            }
        } else {
            overlayBridging.style.opacity = "0";
        }
    });

    // Fire scroll event once on load to set initial positions
    window.dispatchEvent(new Event("scroll"));
});
