document.addEventListener("DOMContentLoaded", () => {
  const entryScreen = document.getElementById("entry-screen");
  const enterButton = document.getElementById("enter-button");
  const body = document.body;

  let bgMusic = document.getElementById("bg-music");
  let audioToggle = document.getElementById("audio-toggle");

  if (!bgMusic) {
    bgMusic = document.createElement("audio");
    bgMusic.id = "bg-music";
    bgMusic.loop = true;
    bgMusic.innerHTML = `<source src="soundtrack.mp3" type="audio/mpeg" />`;
    document.body.appendChild(bgMusic);
  }

  if (!audioToggle) {
    const div = document.createElement("div");
    div.className = "audio-control";
    div.innerHTML = `<button id="audio-toggle" class="audio-toggle" aria-label="Ativar ou desativar trilha sonora" aria-pressed="false"><span class="audio-icon">\uD83D\uDD0A</span> Som</button>`;
    document.body.appendChild(div);
    audioToggle = document.getElementById("audio-toggle");
  }

  const audioIcon = audioToggle
    ? audioToggle.querySelector(".audio-icon")
    : null;

  const setAudioUiState = (isPlaying) => {
    if (!audioToggle) return;
    audioToggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    audioToggle.classList.toggle("muted", !isPlaying);
    if (audioIcon) audioIcon.textContent = isPlaying ? "\uD83D\uDD0A" : "\uD83D\uDD07";
  };

  const syncAudioContextHint = () => {
    if (!audioToggle) return;
    const audioControl = audioToggle.closest(".audio-control");
    if (!audioControl) return;

    let hint = audioControl.querySelector(".audio-context");
    if (!hint) {
      hint = document.createElement("span");
      hint.className = "audio-context";
      hint.id = "audio-context-hint";
      hint.textContent = "Trilha ambiente";
      audioControl.insertBefore(hint, audioToggle);
    }

    const hasSoundtrackSection = Boolean(document.querySelector(".soundtrack-secao"));
    const showHint = !hasSoundtrackSection;
    hint.hidden = !showHint;
    audioControl.classList.toggle("audio-control-highlight", showHint);

    if (showHint) {
      audioToggle.setAttribute("aria-describedby", hint.id);
    } else {
      audioToggle.removeAttribute("aria-describedby");
    }
  };

  let transitionEl = document.getElementById("page-transition-overlay");
  if (!transitionEl) {
    transitionEl = document.createElement("div");
    transitionEl.id = "page-transition-overlay";
    document.body.appendChild(transitionEl);
  }

  const tryToPlayMusic = () => {
    if (bgMusic && bgMusic.paused) {
      bgMusic.volume = 0.4;
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioUiState(true);
          })
          .catch((error) => {
            console.log(
              "Reproducao automatica bloqueada. O usuario precisara interagir.",
              error,
            );
            setAudioUiState(false);

            const playOnInteraction = () => {
              if (bgMusic && bgMusic.paused) {
                bgMusic.volume = 0.4;
                bgMusic
                  .play()
                  .then(() => {
                    setAudioUiState(true);
                  })
                  .catch((e) => console.log("Audio ainda bloqueado:", e));
              }
              ["click", "touchstart", "keydown"].forEach((evt) =>
                document.removeEventListener(evt, playOnInteraction),
              );
            };
            ["click", "touchstart", "keydown"].forEach((evt) =>
              document.addEventListener(evt, playOnInteraction),
            );
          });
      }
    }
  };

  if (sessionStorage.getItem("hasEntered") === "true") {
    if (entryScreen) {
      entryScreen.style.display = "none";
    }
    body.classList.remove("no-scroll");
    tryToPlayMusic();
  } else if (entryScreen && enterButton) {
    body.classList.add("no-scroll");
    enterButton.addEventListener("click", (e) => {
      if (e) e.preventDefault();
      sessionStorage.setItem("hasEntered", "true");

      entryScreen.classList.add("hidden");
      body.classList.remove("no-scroll");
      setTimeout(() => {
        entryScreen.style.display = "none";
      }, 1000);
      tryToPlayMusic();
    });
  } else {
    tryToPlayMusic();
  }

  syncAudioContextHint();

  if (audioToggle && bgMusic) {
    audioToggle.addEventListener("click", () => {
      if (bgMusic.paused) {
        bgMusic.volume = 0.4;
        bgMusic.play();
        setAudioUiState(true);
      } else {
        bgMusic.pause();
        setAudioUiState(false);
      }
    });

    window.toggleAudioState = () => {
      if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
        setAudioUiState(false);
      }
    };
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");

    if (
      link &&
      link.href.startsWith(window.location.origin) &&
      link.href.includes(".html")
    ) {
      e.preventDefault();
      loadPage(link.href);
    }
  });

  window.addEventListener("popstate", () => {
    loadPage(window.location.href, false);
  });

  async function loadPage(url, pushState = true) {
    try {
      if (transitionEl && window.gsap) {
        await new Promise((resolve) => {
          gsap.to(transitionEl, {
            opacity: 1,
            duration: 0.7,
            ease: "power2.inOut",
            onComplete: resolve,
          });
        });
      }

      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const currentMain = document.querySelector("main");
      const newMain = doc.querySelector("main");

      if (currentMain && newMain) {
        if (window.ScrollTrigger)
          window.ScrollTrigger.getAll().forEach((t) => t.kill());

        currentMain.innerHTML = newMain.innerHTML;
        currentMain.className = newMain.className;
        document.title = doc.title;

        if (pushState) window.history.pushState({}, "", url);

        if (typeof initAllAnimations === "function") initAllAnimations();

        const checkEntry = document.getElementById("entry-screen");
        if (checkEntry && sessionStorage.getItem("hasEntered") === "true") {
          checkEntry.style.display = "none";
        }

        updateActiveMenu(url);
        syncAudioContextHint();
        window.scrollTo(0, 0);

        const menuToggle = document.getElementById("menu-toggle");
        if (menuToggle) menuToggle.checked = false;

        if (transitionEl && window.gsap) {
          gsap.to(transitionEl, {
            opacity: 0,
            duration: 0.7,
            ease: "power2.inOut",
            delay: 0.2,
          });
        }
      }
    } catch (err) {
      window.location.href = url;
    }
  }

  function updateActiveMenu(url) {
    const menuLinks = document.querySelectorAll(".nav-menu a");
    menuLinks.forEach((link) => {
      link.classList.remove("active");
      if (
        link.href === url ||
        (url.endsWith("/") && link.href.endsWith("index.html"))
      ) {
        link.classList.add("active");
      }
    });
  }

  let isSpotifyFocused = false;
  let wasAudioPlayingBeforeSpotify = false;

  const spotifyFocusPoll = window.setInterval(() => {
    const spotifyIframe = document.querySelector(
      ".spotify-player-wrapper iframe",
    );
    const isCurrentlyFocused = document.activeElement === spotifyIframe;

    if (isCurrentlyFocused && !isSpotifyFocused) {
      isSpotifyFocused = true;
      if (bgMusic && !bgMusic.paused) {
        wasAudioPlayingBeforeSpotify = true;
        if (window.toggleAudioState) window.toggleAudioState();
      }
    }
    else if (!isCurrentlyFocused && isSpotifyFocused) {
      isSpotifyFocused = false;
      if (wasAudioPlayingBeforeSpotify && bgMusic && bgMusic.paused) {
        bgMusic.volume = 0.4;
        bgMusic.play();
        setAudioUiState(true);
      }
    }
  }, 1200);
});

