document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particles-bg");
  if (!canvas) {
    console.error('Canvas element with id "particles-bg" not found.');
    return;
  }
  const ctx = canvas.getContext("2d");

  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "100";
  canvas.style.pointerEvents = "none";

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    petals.forEach((petal) => petal.reset(true));
  });

  const mouse = {
    x: undefined,
    y: undefined,
    radius: 90,
  };

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  const wind = { x: 0 };

  function updateWind() {
    if (typeof gsap !== "undefined") {
      gsap.to(wind, {
        x: (Math.random() - 0.5) * 1.5,
        duration: 3 + Math.random() * 4,
        ease: "sine.inOut",
        onComplete: updateWind,
      });
    }
  }
  updateWind();

  const petals = [];
  const numPetals = 100;

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -this.size;
      this.size = 5 + Math.random() * 7;

      if (Math.random() > 0.5) {
        this.r = 139;
        this.g = 0;
        this.b = 0;
        this.baseAlpha = 0.4 + Math.random() * 0.3;
      } else {
        this.r = 240;
        this.g = 240;
        this.b = 248;
        this.baseAlpha = 0.5 + Math.random() * 0.3;
      }

      this.xSpeed = (Math.random() - 0.5) * 0.2;
      this.ySpeed = 0.1 + Math.random() * 0.3;

      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.01;

      this.flip = Math.random() * Math.PI;
      this.flipSpeed = 0.005 + Math.random() * 0.01;

      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.01 + Math.random() * 0.02;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      const flipScale = Math.cos(this.flip);
      ctx.scale(1, flipScale);

      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(
        this.size / 2,
        -this.size / 2,
        this.size,
        this.size / 2,
        0,
        this.size,
      );
      ctx.bezierCurveTo(
        -this.size,
        this.size / 2,
        -this.size / 2,
        -this.size / 2,
        0,
        -this.size,
      );

      const alpha = this.baseAlpha * (0.5 + 0.5 * Math.abs(flipScale));
      ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
      ctx.fill();
      ctx.restore();
    }

    animate() {
      this.x += this.xSpeed + wind.x + Math.sin(this.sway) * 0.5;
      this.y += this.ySpeed + Math.abs(wind.x) * 0.1;

      this.rotation += this.rotationSpeed + wind.x * 0.05;
      this.flip += this.flipSpeed;
      this.sway += this.swaySpeed;

      if (mouse.x !== undefined && mouse.y !== undefined) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          const pushStrength = 0.6;
          this.x += forceDirectionX * force * pushStrength;
          this.y += forceDirectionY * force * pushStrength;
        }
      }

      if (this.y > height + this.size) {
        this.reset();
      }
      if (this.x > width + this.size) {
        this.x = -this.size;
      } else if (this.x < -this.size) {
        this.x = width + this.size;
      }
    }
  }

  for (let i = 0; i < numPetals; i++) {
    petals.push(new Petal());
  }

  if (typeof gsap !== "undefined") {
    gsap.ticker.add(() => {
      ctx.clearRect(0, 0, width, height);
      petals.forEach((petal) => {
        petal.animate();
        petal.draw();
      });
    });
  } else {
    function animate() {
      ctx.clearRect(0, 0, width, height);
      petals.forEach((petal) => {
        petal.animate();
        petal.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }
});
