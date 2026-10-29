(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const smallScreen = window.matchMedia("(max-width: 760px)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  const intro = document.getElementById("intro");
  const skipIntro = document.getElementById("skip-intro");
  const heroReveal = Array.from(document.querySelectorAll(".hero-reveal"));
  let introTimeline = null;
  let introFinished = false;

  /* ---------- split titles for per-character hover motion ---------- */
  document.querySelectorAll(".split").forEach((element) => {
    const text = element.textContent;
    element.setAttribute("aria-label", text);
    element.textContent = "";
    Array.from(text).forEach((character, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--i", String(index));
      span.textContent = character === " " ? "\u00A0" : character;
      element.appendChild(span);
    });
  });

  /* ---------- intro: chrome cube, 64 shards, XC emblem ---------- */
  function showHeroImmediately() {
    if (hasGSAP) {
      window.gsap.set(heroReveal, { opacity: 1, y: 0, clearProps: "transform" });
    } else {
      heroReveal.forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "none";
      });
    }
    if (intro) {
      intro.classList.add("is-hidden");
      intro.style.display = "none";
    }
    document.querySelectorAll(".nav, .nav-actions").forEach((element) => {
      element.style.opacity = "1";
    });
  }

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    if (introTimeline) introTimeline.kill();
    showHeroImmediately();
  }

  function buildShards() {
    const field = document.getElementById("shards");
    if (!field) return [];
    const shardData = [];
    for (let index = 0; index < 64; index += 1) {
      const layer = Math.floor(index / 16);
      const row = Math.floor((index % 16) / 4);
      const column = index % 4;
      const shard = document.createElement("span");
      shard.className = "shard";
      shard.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i>";
      shard.dataset.x = String((column - 1.5) * 52);
      shard.dataset.y = String((row - 1.5) * 52);
      shard.dataset.z = String((layer - 1.5) * 52);
      field.appendChild(shard);
      shardData.push(shard);
    }
    return shardData;
  }

  function playIntro() {
    if (!intro || !hasGSAP || reduceMotion || smallScreen) {
      finishIntro();
      return;
    }

    const shards = buildShards();
    const emblem = document.getElementById("intro-emblem");
    const signalLine = document.getElementById("signal-line");
    const scanBeam = document.getElementById("scan-beam");
    const core = document.getElementById("core-cube");
    const nav = document.querySelector(".nav");

    window.gsap.set(heroReveal, { opacity: 0, y: 30 });
    window.gsap.set(shards, { x: 0, y: 0, z: 0, scale: 0.18, opacity: 0, rotationX: 0, rotationY: 0 });
    window.gsap.set(emblem, { opacity: 0, scale: 0.86 });
    window.gsap.set(signalLine, { opacity: 0 });
    window.gsap.set(scanBeam, { opacity: 0, left: "9%" });
    window.gsap.set(nav, { y: -16, opacity: 0 });

    introTimeline = window.gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: finishIntro
    });

    introTimeline
      .to(core, { opacity: 1, scale: 1, duration: 0.45, ease: "expo.out" }, 0.12)
      .to(scanBeam, { opacity: 1, duration: 0.16 }, 0.25)
      .to(scanBeam, { left: "91%", duration: 1.18, ease: "power2.inOut" }, 0.32)
      .to(scanBeam, { opacity: 0, duration: 0.2 }, 1.42)
      .to(core, { opacity: 0, scale: 0.14, duration: 0.28, ease: "power2.in" }, 0.76)
      .to(shards, {
        opacity: 1,
        scale: 1,
        x: (index, target) => Number(target.dataset.x),
        y: (index, target) => Number(target.dataset.y),
        z: (index, target) => Number(target.dataset.z),
        rotationX: (index) => (index % 2 ? 90 : 0),
        rotationY: (index) => (index % 3 ? 45 : -45),
        duration: 0.82,
        ease: "expo.out",
        stagger: { each: 0.006, from: "random" }
      }, 0.55)
      .to("#cube-stage", { rotationY: 7, rotationX: -3, duration: 1.35, ease: "sine.inOut" }, 0.62)
      .to(shards, {
        opacity: 0,
        scale: 0.58,
        duration: 0.32,
        ease: "power2.in",
        stagger: { each: 0.002, from: "center" }
      }, 1.54)
      .to(emblem, { opacity: 1, scale: 1, duration: 0.48, ease: "expo.out" }, 1.52)
      .to(emblem, { scale: 1.015, duration: 0.7, ease: "sine.inOut" }, 2)
      .to(signalLine, { opacity: 1, duration: 0.24 }, 1.92)
      .to(heroReveal, {
        opacity: 1,
        y: 0,
        duration: 0.82,
        ease: "power3.out",
        stagger: 0.055
      }, 2.04)
      .to(nav, { y: 0, opacity: 1, duration: 0.5 }, 2.12)
      .to(intro, { opacity: 0, duration: 0.55, ease: "power2.inOut" }, 2.44);

    if (skipIntro) skipIntro.addEventListener("click", finishIntro);
    window.setTimeout(() => {
      if (!introFinished) finishIntro();
    }, 3900);
  }

  function playMobileIntro() {
    intro.classList.add("is-mobile-intro");
    window.gsap.set(heroReveal, { opacity: 0, y: 14 });
    introTimeline = window.gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: finishIntro
    });
    introTimeline
      .fromTo("#intro-emblem", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.24 })
      .to(intro, { opacity: 0, duration: 0.28 }, 0.42)
      .to(heroReveal, { opacity: 1, y: 0, duration: 0.38, stagger: 0.045 }, 0.46);
    if (skipIntro) skipIntro.addEventListener("click", finishIntro);
    window.setTimeout(finishIntro, 1800);
  }

  if (!intro || reduceMotion || !hasGSAP) {
    finishIntro();
  } else if (smallScreen) {
    if (window.location.hash) {
      finishIntro();
    } else {
      playMobileIntro();
    }
  } else {
    window.setTimeout(playIntro, 30);
  }

  showHeroImmediatelyIfNeeded();

  function showHeroImmediatelyIfNeeded() {
    if (introFinished) {
      heroReveal.forEach((element) => {
        element.style.opacity = "1";
      });
    }
  }

  /* ---------- navigation ---------- */
  const nav = document.getElementById("nav");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 22);
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  function closeMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        mobileMenu.hidden = false;
        menuToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("is-locked");
      }
    });
    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealElements = Array.from(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -7% 0px" });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-in"));
  }

  /* ---------- hud labels ---------- */
  const hudSections = Array.from(document.querySelectorAll("[data-hud]"));
  const hudIndex = document.getElementById("hud-index");
  const hudLabel = document.getElementById("hud-label");
  if ("IntersectionObserver" in window && hudSections.length) {
    const hudObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target;
        if (hudIndex) hudIndex.textContent = section.dataset.hud || "00";
        if (hudLabel) hudLabel.textContent = section.dataset.hudLabel || "SIGNAL";
      });
    }, { rootMargin: "-44% 0px -44% 0px", threshold: 0 });
    hudSections.forEach((section) => hudObserver.observe(section));
  }

  /* ---------- pointer light ---------- */
  if (finePointer) {
    document.body.classList.add("has-pointer");
    let glowFrame = null;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (glowFrame) return;
      glowFrame = window.requestAnimationFrame(() => {
        document.body.style.setProperty("--mx", pointerX + "px");
        document.body.style.setProperty("--my", pointerY + "px");
        glowFrame = null;
      });
    }, { passive: true });
  }

  /* ---------- parallax ---------- */
  const parallaxElements = Array.from(document.querySelectorAll("[data-parallax]"));
  let parallaxFrame = null;

  function updateParallax() {
    if (reduceMotion || smallScreen || !parallaxElements.length) return;
    const viewport = window.innerHeight;
    parallaxElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > viewport + 200) return;
      const speed = Number(element.dataset.parallax) || 0.04;
      const offset = (rect.top + rect.height / 2 - viewport / 2) * speed;
      element.style.setProperty("--parallax", offset.toFixed(2) + "px");
    });
  }

  function requestParallax() {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(() => {
      updateParallax();
      parallaxFrame = null;
    });
  }
  if (!reduceMotion && !smallScreen) {
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);
    updateParallax();
  }

  /* ---------- subtle tilt ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".work-card, [data-tilt]").forEach((element) => {
      let bounds = null;
      element.addEventListener("pointerenter", () => {
        bounds = element.getBoundingClientRect();
      });
      element.addEventListener("pointermove", (event) => {
        if (!bounds) bounds = element.getBoundingClientRect();
        const px = (event.clientX - bounds.left) / bounds.width - 0.5;
        const py = (event.clientY - bounds.top) / bounds.height - 0.5;
        element.style.setProperty("--rx", (-py * 3.6).toFixed(2) + "deg");
        element.style.setProperty("--ry", (px * 3.6).toFixed(2) + "deg");
      });
      element.addEventListener("pointerleave", () => {
        bounds = null;
        element.style.setProperty("--rx", "0deg");
        element.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- showreel dialog ---------- */
  const dialog = document.getElementById("showreel-dialog");
  const video = document.getElementById("showreel-video");
  const closeButton = document.getElementById("dialog-close");

  function openShowreel() {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("is-locked");
    if (video) {
      if (!video.getAttribute("src")) video.src = video.dataset.src;
      video.muted = true;
      video.currentTime = 0;
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") playAttempt.catch(() => {});
    }
  }

  function closeShowreel() {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("is-locked");
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }

  document.querySelectorAll("[data-showreel-open]").forEach((button) => {
    button.addEventListener("click", openShowreel);
  });
  if (closeButton) closeButton.addEventListener("click", closeShowreel);
  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeShowreel();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("is-locked");
      if (video) video.pause();
    });
  }

  /* ---------- copy phone ---------- */
  const copyPhone = document.getElementById("copy-phone");
  if (copyPhone) {
    copyPhone.addEventListener("click", async () => {
      const phone = copyPhone.dataset.phone || "15011895035";
      const original = copyPhone.innerHTML;
      try {
        await navigator.clipboard.writeText(phone);
        copyPhone.textContent = "COPIED ✓";
      } catch (error) {
        copyPhone.textContent = phone;
      }
      window.setTimeout(() => {
        copyPhone.innerHTML = original;
      }, 1600);
    });
  }
})();
