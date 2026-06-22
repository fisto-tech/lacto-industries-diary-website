// Initialize Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Link GSAP to Lenis
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
});
gsap.ticker.lagSmoothing(0);

// Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const magneticBtns = document.querySelectorAll('.magnetic-btn, .nav-links a, .nav-cta, .family-btn, .gallery-item');

const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 992;

if (!isMobileDevice) {
    document.addEventListener('mousemove', (e) => {
        // Fast dot
        gsap.to(cursorDot, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });

        // Slower ring (trailing effect)
        gsap.to(cursorRing, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    magneticBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            cursorRing.classList.add('active');
            cursorDot.style.opacity = '0';
        });
        btn.addEventListener('mouseleave', () => {
            cursorRing.classList.remove('active');
            cursorDot.style.opacity = '1';
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
        });
    });

    // Magnetic button effect
    const magneticElements = document.querySelectorAll('.magnetic-btn');
    magneticElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(elem, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

// Mobile Menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });
}

// Back to Top Button
const backToTopBtn = document.getElementById('back-to-top');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        lenis.scrollTo(0, { duration: 1.5 });
    });
}

// Hero Animation is now triggered after the preloader finishes

// Image Sequence Scrubbing (Birth Section)
const birthSection = document.querySelector('.birth-section');
const canvas = document.getElementById('birth-canvas');

if (canvas) {
    const context = canvas.getContext('2d');
    const frameCount = 240;
    const currentFrame = index => (
        `assets/image-frames/${(index + 1).toString().padStart(5, '0')}.webp`
    );

    const images = [];
    const seq = { frame: 0 };
    let loadedImages = 0;

    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderText = document.getElementById('preloader-text');

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        
        img.onload = () => {
            loadedImages++;
            const progress = Math.floor((loadedImages / frameCount) * 100);
            
            // Update Preloader UI
            if (preloaderBar) preloaderBar.style.width = `${progress}%`;
            if (preloaderText) preloaderText.innerText = `${progress}%`;

            // Initial render
            if (i === 0) {
                canvas.width = images[0].width;
                canvas.height = images[0].height;
                context.drawImage(images[0], 0, 0);
            }

            // Loading complete
            if (loadedImages === frameCount) {
                gsap.to(preloader, {
                    opacity: 0,
                    duration: 0.8,
                    delay: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        preloader.style.display = 'none';
                        document.body.classList.remove('loading');
                        
                        // Fire hero animation after preloader finishes
                        const tl = gsap.timeline();
                        tl.to('.hero-title', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
                          .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.8')
                          .to('.hero-tagline', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
                          .to('.scroll-indicator', { opacity: 1, duration: 1 }, '-=0.5');
                    }
                });
            }
        };
        
        img.onerror = () => {
            // Fallback if an image fails to load
            loadedImages++;
        };

        images.push(img);
    }

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: birthSection,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
            pin: '.birth-container',
        }
    });

    // 1. Animate the image sequence over the full timeline duration (1.0)
    tl.to(seq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: render,
        duration: 1
    }, 0);

    // 2. Animate the cards appearing and disappearing
    // Card 1
    tl.fromTo('.birth-card-1', 
        { autoAlpha: 0, y: 50 }, 
        { autoAlpha: 1, y: 0, duration: 0.1 }, 0.05);
    tl.to('.birth-card-1', { autoAlpha: 0, y: -50, duration: 0.1 }, 0.25);

    // Card 2
    tl.fromTo('.birth-card-2', 
        { autoAlpha: 0, y: 50 }, 
        { autoAlpha: 1, y: 0, duration: 0.1 }, 0.35);
    tl.to('.birth-card-2', { autoAlpha: 0, y: -50, duration: 0.1 }, 0.55);

    // Card 3
    tl.fromTo('.birth-card-3', 
        { autoAlpha: 0, y: 50 }, 
        { autoAlpha: 1, y: 0, duration: 0.1 }, 0.65);
    tl.to('.birth-card-3', { autoAlpha: 0, y: -50, duration: 0.1 }, 0.85);

    function render() {
        if (images[seq.frame] && images[seq.frame].complete) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(images[seq.frame], 0, 0);
        }
    }
}

// Reliable On-Scroll Reveal for Zigzag Rows
gsap.utils.toArray('.zigzag-row').forEach((row) => {
    gsap.fromTo(row, 
        { opacity: 0, y: 80 }, 
        {
            scrollTrigger: {
                trigger: row,
                start: 'top 85%',
                once: true
            },
            opacity: 1,
            y: 0,
            duration: 1.8,
            delay: 0.2,
            ease: 'expo.out'
        }
    );
});

// Fade in all section headers
gsap.utils.toArray('.section-header').forEach((header) => {
    gsap.from(header, {
        scrollTrigger: {
            trigger: header,
            start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 1.5,
        delay: 0.1,
        ease: 'expo.out'
    });
});

// Layer Explorer Reveal
const layers = document.querySelectorAll('.layer-label');
layers.forEach((layer, index) => {
    gsap.to(layer, {
        scrollTrigger: {
            trigger: '.layer-explorer',
            start: 'top 50%',
        },
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: index * 0.4,
        ease: 'expo.out'
    });
});

// Gallery Staggered Reveal
gsap.to('.gallery-item', {
    scrollTrigger: {
        trigger: '.gallery-section',
        start: 'top 70%',
    },
    opacity: 1,
    y: 0,
    duration: 1.5,
    stagger: 0.25,
    ease: 'expo.out'
});

// Product Family Selector
const familyData = {
    nova: {
        title: 'NovaPack™',
        desc: 'The flagship 1.0L container. Engineered for optimal everyday use with standard refrigeration shelf spacing.',
        cap: '1.0L',
        weight: '42g',
        img: 'assets/images/product-family-shot.jpeg'
    },
    mini: {
        title: 'NovaPack Mini™',
        desc: 'Compact 500ml form factor. Perfect for on-the-go consumption without compromising freshness preservation.',
        cap: '500ml',
        weight: '28g',
        img: 'assets/images/floating-product-shot.jpeg'
    },
    max: {
        title: 'NovaPack Max™',
        desc: 'Industrial 2.0L capacity featuring reinforced structural ribs for high-volume commercial environments.',
        cap: '2.0L',
        weight: '65g',
        img: 'assets/images/product-family-shot.jpeg' // Reusing as instructed
    },
    eco: {
        title: 'NovaPack Eco™',
        desc: 'Ultra-lightweight variant achieving a 15% material reduction for maximum sustainability impact.',
        cap: '1.0L',
        weight: '35g',
        img: 'assets/images/sustainability-visualization.jpeg'
    }
};

const familyBtns = document.querySelectorAll('.family-btn');
const fImg = document.getElementById('family-img');
const fTitle = document.getElementById('family-title');
const fDesc = document.getElementById('family-desc');
const fCap = document.getElementById('family-cap');
const fWeight = document.getElementById('family-weight');

familyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active
        familyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const model = btn.dataset.model;
        const data = familyData[model];

        // Animate out
        gsap.to([fImg, fTitle, fDesc, fCap, fWeight], {
            opacity: 0,
            y: 10,
            duration: 0.3,
            onComplete: () => {
                fImg.src = data.img;
                fTitle.textContent = data.title;
                fDesc.textContent = data.desc;
                fCap.textContent = data.cap;
                fWeight.textContent = data.weight;

                // Animate in
                gsap.to([fImg, fTitle, fDesc, fCap, fWeight], {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: 'power2.out'
                });
            }
        });
    });
});

// Sustainability Stats Animation
const stats = document.querySelectorAll('.stat-number');
stats.forEach(stat => {
    const target = parseInt(stat.textContent);
    
    ScrollTrigger.create({
        trigger: '.sustainability-section',
        start: 'top 60%',
        onEnter: () => {
            gsap.fromTo(stat, 
                { innerHTML: 0 }, 
                { 
                    innerHTML: target,
                    duration: 2, 
                    ease: 'power2.out',
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        stat.innerHTML = Math.round(this.targets()[0].innerHTML) + '<span class="pct">%</span>';
                    }
                }
            );
        },
        once: true
    });
});
