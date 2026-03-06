// assets/js/scrolly-canvas.js

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("scrolly-canvas");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const frameCount = 90;

    // Generate paths for frame_00_delay-0.066s.png to frame_89_delay-0.066s.png
    const currentFrame = index => (
        `./sequences/frame_${index.toString().padStart(2, '0')}_delay-0.066s.png`
    );

    const images = [];
    let loadedImages = 0;
    let isReady = false;

    // Preload all images
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
            loadedImages++;
            if (loadedImages === frameCount) {
                isReady = true;
                renderFrame(0); // Initial render
            }
        };
        images.push(img);
    }

    // Logic to draw image with object-fit: cover 
    const renderFrame = (index) => {
        if (!isReady || !images[index]) return;
        const img = images[index];

        // Set canvas rendering resolution based on real screen pixels
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        // CSS width/height
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        context.scale(dpr, dpr);

        const canvasAspect = window.innerWidth / window.innerHeight;
        const imgAspect = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
            drawWidth = window.innerWidth;
            drawHeight = window.innerWidth / imgAspect;
            offsetX = 0;
            offsetY = (window.innerHeight - drawHeight) / 2;
        } else {
            drawWidth = window.innerHeight * imgAspect;
            drawHeight = window.innerHeight;
            offsetX = (window.innerWidth - drawWidth) / 2;
            offsetY = 0;
        }

        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Listen to scroll to update frames
    const scrollyContainer = document.getElementById("scrolly-container");

    window.addEventListener("scroll", () => {
        if (!isReady || !scrollyContainer) return;

        const rect = scrollyContainer.getBoundingClientRect();
        // rect.top is 0 when container reaches top of viewport
        // rect.height is 500vh

        // Calculate scroll progress through the container (0 to 1)
        const maxScroll = rect.height - window.innerHeight;
        const currentScroll = -rect.top;

        let scrollFraction = currentScroll / maxScroll;

        // Clamp between 0 and 1
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));

        // Map fraction to frame index
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );

        // Use requestAnimationFrame for smooth drawing
        requestAnimationFrame(() => renderFrame(frameIndex));
    });

    // Handle resizes
    window.addEventListener("resize", () => {
        if (!isReady || !scrollyContainer) return;

        const rect = scrollyContainer.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        const currentScroll = -rect.top;
        let scrollFraction = Math.max(0, Math.min(1, currentScroll / maxScroll));
        const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));

        renderFrame(frameIndex);
    });
});
