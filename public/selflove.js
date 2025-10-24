document.addEventListener('DOMContentLoaded', () => {

    function initializeCarousel(carouselId, wrapperId, indicatorsId) {
        const carousel = document.getElementById(wrapperId);
        const container = document.getElementById(carouselId);
        const indicatorsContainer = document.getElementById(indicatorsId);
        
        const slides = Array.from(carousel.children);
        const totalSlides = slides.length;
        let currentIndex = 0;

        function updateCarousel() {
            const offset = -currentIndex * 100;
            carousel.style.transform = `translateX(${offset}%)`;
            
            updateIndicators();
            
            if (wrapperId === 'video-carousel') {
                slides.forEach((slide, index) => {
                    const video = slide.querySelector('video');
                    if (video) {
                        if (index !== currentIndex) {
                            video.pause();
                        } else {
                            
                            video.play(); 
                        }
                    }
                });
            }
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        function createIndicators() {
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('span');
                dot.classList.add('indicator-dot');
                dot.setAttribute('data-index', i);
                dot.addEventListener('click', () => {
                    goToSlide(i);
                });
                indicatorsContainer.appendChild(dot);
            }
        }

        function updateIndicators() {
            const dots = indicatorsContainer.querySelectorAll('.indicator-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        let touchStartX = 0;
        const minSwipeDistance = 50; 

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        container.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;
            
            if (swipeDistance > minSwipeDistance) {
                nextSlide();
            } else if (swipeDistance < -minSwipeDistance) {
                prevSlide();
            }
        });
        
        createIndicators();
        updateCarousel();
        
        return { nextSlide, prevSlide };
    }

    const videoGallery = initializeCarousel('video-gallery', 'video-carousel', 'video-indicators');
    const quoteGallery = initializeCarousel('quote-gallery', 'quote-carousel', 'quote-indicators');

    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const galleryType = e.currentTarget.getAttribute('data-gallery');
            const action = e.currentTarget.classList.contains('next-button') ? 'nextSlide' : 'prevSlide';
            
            if (galleryType === 'video') {
                videoGallery[action]();
            } else if (galleryType === 'quote') {
                quoteGallery[action]();
            }
        });
    });

});