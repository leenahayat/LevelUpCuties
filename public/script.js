
const quotes = [
  "“Believe in yourself and all that you are.”",
  "“Small steps every day lead to big results.”",
  "“Your only limit is your mind.”",
  "“Confidence comes from discipline and training.”",
  "“Love yourself first, and everything else falls into line.”",
  "“Your value doesn’t decrease based on someone’s inability to see your worth.”",
  "“The best view comes after the hardest climb.”"
];


function setDailyQuote() {
  const quoteEl = document.getElementById("quote");
  if (!quoteEl) return;

  
  const today = new Date().getDate();
  const index = today % quotes.length;
  quoteEl.textContent = quotes[index];
  
  
  quoteEl.style.transition = 'opacity 1s ease-in';
  quoteEl.style.opacity = '1';
}


function setupNavbarToggle() {
   
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }
}


function setupSparkleAnimation() {
    const sparkleContainer = document.getElementById("sparkle-container");
    if (!sparkleContainer) return;
    
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement("div");
        sparkle.classList.add("sparkle");

        sparkle.style.top = Math.random() * 100 + "vh";
        sparkle.style.left = Math.random() * 100 + "vw";
        
        sparkle.style.animationDuration = 2.5 + Math.random() * 3.5 + "s";
        sparkle.style.animationDelay = Math.random() * 6 + "s";
        
        sparkleContainer.appendChild(sparkle);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    
   
    setDailyQuote();
    setupNavbarToggle(); n
    setupSparkleAnimation();

    
    const video = document.getElementById('bg-video');
    const endTime = 3; 

    if (video) {
        video.addEventListener('timeupdate', () => {
            if (video.currentTime >= endTime) {
                video.currentTime = 0;
                video.play(); 
            }
        });
    }
});