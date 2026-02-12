function initReveal() {
  gsap.registerPlugin(ScrollTrigger);
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((element) => {
    gsap.fromTo(
      element,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    );
  });
}

function initAwardCounter() {
  const counterElement = document.querySelector(".award-count, .premio-count");

  if (counterElement) {
    const finalValue = 9;
    const counter = { value: 0 };

    gsap.to(counter, {
      value: finalValue,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        counterElement.textContent = Math.floor(counter.value);
      },
      scrollTrigger: {
        trigger: counterElement,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  }
}

function initAllAnimations() {
  initReveal();
  initAwardCounter();
}

document.addEventListener("DOMContentLoaded", initAllAnimations);
