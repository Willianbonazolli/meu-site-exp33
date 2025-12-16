function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    function checkReveal() {
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }
    
    checkReveal();
    window.addEventListener('scroll', checkReveal);
}


function initAwardCounter() {
    const counterElement = document.querySelector('.award-count, .premio-count');
    
    if (counterElement) {
        function animateCounter(element, finalValue, duration = 2000) {
            let start = 0;
            const increment = finalValue / (duration / 16);
            const timer = setInterval(() => {
                start += increment;
                if (start >= finalValue) {
                    element.textContent = finalValue + '+';
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(start);
                }
            }, 16);
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(counterElement, 9);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counterElement);
    }
}

function initAllAnimations() {
    
    initReveal();
    initAwardCounter();

    console.log(' Teste animações');
}

document.addEventListener('DOMContentLoaded', initAllAnimations);

if (document.readyState === 'complete') {
    initAllAnimations();
}