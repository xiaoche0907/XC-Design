const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const interactivePortrait = document.querySelector(".hero-title-portrait");

if (interactivePortrait) {
  const portraitWindow = interactivePortrait.querySelector(".portrait-window");
  const portraitImage = interactivePortrait.querySelector(".portrait-window img");
  const enterPortrait = () => {
    interactivePortrait.classList.add("is-portrait-hover");
    portraitWindow?.style.setProperty(
      "transform",
      "translateY(-2px) scaleX(1.015) scaleY(1.025)",
      "important",
    );
    portraitImage?.style.setProperty("filter", "saturate(1.06) contrast(1.035)");
    portraitImage?.style.setProperty(
      "transform",
      "translateY(-3px) scale(1.045)",
      "important",
    );
  };
  const leavePortrait = () => {
    interactivePortrait.classList.remove("is-portrait-hover");
    portraitWindow?.style.removeProperty("transform");
    portraitImage?.style.removeProperty("filter");
    portraitImage?.style.removeProperty("transform");
  };

  interactivePortrait.addEventListener("pointerenter", enterPortrait);
  interactivePortrait.addEventListener("pointerleave", leavePortrait);
  interactivePortrait.addEventListener("mouseenter", enterPortrait);
  interactivePortrait.addEventListener("mouseleave", leavePortrait);
  interactivePortrait.addEventListener("focus", enterPortrait);
  interactivePortrait.addEventListener("blur", leavePortrait);
  interactivePortrait.addEventListener("focusin", enterPortrait);
  interactivePortrait.addEventListener("focusout", leavePortrait);
  interactivePortrait.addEventListener("click", (event) => {
    event.stopPropagation();
    enterPortrait();
  });
  document.addEventListener("click", leavePortrait);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });
});

const contactModal = document.querySelector("[data-contact-modal]");
const contactOpenButtons = document.querySelectorAll("[data-contact-open]");
const contactCloseButtons = document.querySelectorAll("[data-contact-close]");
const copyPhoneButton = document.querySelector("[data-copy-phone]");
let contactLastActiveElement;

function openContactModal() {
  if (!contactModal) return;

  contactLastActiveElement = document.activeElement;
  contactModal.hidden = false;
  document.body.classList.add("contact-modal-open");
  contactModal.querySelector("[data-contact-close]")?.focus({ preventScroll: true });
}

function closeContactModal() {
  if (!contactModal || contactModal.hidden) return;

  contactModal.hidden = true;
  document.body.classList.remove("contact-modal-open");
  contactLastActiveElement?.focus?.({ preventScroll: true });
}

contactOpenButtons.forEach((button) => {
  button.addEventListener("click", openContactModal);
});

contactCloseButtons.forEach((button) => {
  button.addEventListener("click", closeContactModal);
});

contactModal?.addEventListener("click", (event) => {
  if (event.target === contactModal) closeContactModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeContactModal();
});

copyPhoneButton?.addEventListener("click", async () => {
  const phone = "15011895035";
  const originalText = copyPhoneButton.textContent;

  try {
    await navigator.clipboard.writeText(phone);
  } catch {
    const fallbackInput = document.createElement("textarea");
    fallbackInput.value = phone;
    fallbackInput.setAttribute("readonly", "");
    fallbackInput.style.position = "fixed";
    fallbackInput.style.opacity = "0";
    document.body.append(fallbackInput);
    fallbackInput.select();
    document.execCommand("copy");
    fallbackInput.remove();
  }

  copyPhoneButton.textContent = "已复制";
  window.setTimeout(() => {
    copyPhoneButton.textContent = originalText;
  }, 1400);
});

const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.append(progressBar);

const backToTopButton = document.createElement("a");
backToTopButton.className = "back-to-top";
backToTopButton.href = "#top";
backToTopButton.setAttribute("role", "button");
backToTopButton.setAttribute("aria-label", "回到顶部");
backToTopButton.innerHTML = '<span>TOP</span><i aria-hidden="true">↑</i>';
document.body.append(backToTopButton);

backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion ? "auto" : "smooth",
  });
});

let backToTopFrame;

function updateBackToTopButton() {
  document.documentElement.classList.toggle("is-back-to-top-visible", window.scrollY > 640);
  backToTopFrame = null;
}

window.addEventListener(
  "scroll",
  () => {
    if (backToTopFrame) return;
    backToTopFrame = requestAnimationFrame(updateBackToTopButton);
  },
  { passive: true },
);
updateBackToTopButton();

const revealGroups = [
  ".section-intro",
  ".project-card",
  ".about-heading",
  ".about-copy",
  ".process-list li",
  ".experience-section > div",
  ".experience-list article",
  ".contact-section > *",
  ".work-detail-copy",
  ".work-detail-cover",
  ".detail-section-head",
  ".detail-card",
  ".showcase-frame",
  ".detail-route-list li",
  ".next-work",
  ".project-switch a",
  ".project-placeholder-card",
  ".project-placeholder-strip",
  ".fashion-feature-image",
  ".fashion-case-notes article",
  ".fashion-reference-grid figure",
  ".fashion-gallery figure",
  ".case-facts > div",
  ".case-wide-image",
  ".case-process-copy",
  ".case-process-visual",
  ".case-gallery figure",
  ".brand-system-visual",
  ".packaging-visual",
  ".packaging-editorial-copy",
];

const revealItems = document.querySelectorAll(revealGroups.join(","));
revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
});

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  document.documentElement.classList.remove("motion-start");
  document.documentElement.classList.add("motion-ready", "motion-finished");
  document.querySelector(".hero-title-portrait")?.classList.add("portrait-ready");
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach((item) => observer.observe(item));
  const portrait = document.querySelector(".hero-title-portrait");
  const setMotionReady = () => {
    document.documentElement.classList.add("motion-ready");
  };
  const setPortraitReady = () => {
    document.documentElement.classList.remove("motion-start");
    portrait?.classList.add("portrait-ready");
  };
  const finishIntroMotion = () => {
    document.documentElement.classList.remove("motion-start");
    document.documentElement.classList.add("motion-finished");
    portrait?.classList.add("portrait-ready");
    document
      .querySelectorAll(
        ".title-line, .hero-kicker, .hero-subtitle, .primary-cta, .availability, .discipline-row",
      )
      .forEach((item) => {
        item.style.setProperty("animation", "none", "important");
        item.style.setProperty("transition", "none", "important");
        item.style.setProperty("opacity", "1", "important");
        item.style.setProperty("transform", "none", "important");
      });
    const floatingNav = document.querySelector(".floating-nav");
    if (floatingNav) {
      floatingNav.style.setProperty("animation", "none", "important");
      floatingNav.style.setProperty("opacity", "1", "important");
      floatingNav.style.setProperty("transform", "translate(-50%, 0) scale(1)", "important");
    }
    if (portrait) {
      const styles = getComputedStyle(portrait);
      const portraitWidth = styles.getPropertyValue("--portrait-width").trim();
      const portraitMargin = styles.getPropertyValue("--portrait-margin").trim();
      const measuringPortrait = portrait.cloneNode(false);
      measuringPortrait.style.position = "absolute";
      measuringPortrait.style.visibility = "hidden";
      measuringPortrait.style.pointerEvents = "none";
      measuringPortrait.style.width = portraitWidth;
      measuringPortrait.style.marginLeft = portraitMargin;
      measuringPortrait.style.marginRight = portraitMargin;
      document.body.append(measuringPortrait);
      const measuredWidth = `${measuringPortrait.getBoundingClientRect().width}px`;
      const measuredMargin = getComputedStyle(measuringPortrait).marginLeft;
      measuringPortrait.remove();
      portrait.style.setProperty("animation", "none", "important");
      portrait.style.setProperty(
        "transition",
        "box-shadow 360ms ease, transform 300ms cubic-bezier(0.45, 0, 0.2, 1)",
        "important",
      );
      portrait.style.setProperty("width", measuredWidth, "important");
      portrait.style.setProperty("margin-left", measuredMargin, "important");
      portrait.style.setProperty("margin-right", measuredMargin, "important");
      portrait.style.setProperty("opacity", "1", "important");

      const portraitImage = portrait.querySelector(".portrait-window img");
      portraitImage?.style.setProperty("opacity", "1", "important");
      portrait.style.setProperty("--portrait-dot-opacity", "1");
    }
  };
  requestAnimationFrame(setMotionReady);
  setTimeout(setMotionReady, 120);
  setTimeout(setPortraitReady, 620);
  setTimeout(finishIntroMotion, 1280);
  setTimeout(finishIntroMotion, 1680);
  window.addEventListener("load", () => setTimeout(finishIntroMotion, 1280), { once: true });
}

const fashionProject = document.querySelector("#case-fashion");
const annaRoseProject = document.querySelector("#case-anna-rose");

if (fashionProject && annaRoseProject) {
  annaRoseProject.before(fashionProject);
}

const projectLinks = [...document.querySelectorAll("[data-project-link]")];
const projectCases = [...document.querySelectorAll("[data-project-case]")];
const projectSwitchSection = document.querySelector(".project-switch-section");
const projectMiniThreshold = 260;
const projectMiniTrigger = document.createElement("span");
projectMiniTrigger.className = "project-mini-trigger";
projectMiniTrigger.setAttribute("aria-hidden", "true");

projectSwitchSection?.before(projectMiniTrigger);

if (projectLinks.length && projectCases.length) {
  const setActiveProject = (id) => {
    projectLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  let projectFrame;
  let miniNavigationVisible = false;

  const setMiniNavigationVisible = (isVisible) => {
    miniNavigationVisible = isVisible;
    document.documentElement.classList.toggle("is-project-mini-visible", isVisible);
  };

  const updateActiveProject = () => {
    const markerY = window.innerHeight * 0.32;
    const triggerRect = projectMiniTrigger.getBoundingClientRect();
    const showMiniNavigation = projectSwitchSection
      ? triggerRect.top < projectMiniThreshold
      : false;

    setMiniNavigationVisible(Boolean(showMiniNavigation));

    const current =
      projectCases.find((item) => {
        const rect = item.getBoundingClientRect();
        return rect.top <= markerY && rect.bottom > markerY;
      }) || projectCases[0];

    if (current?.id) setActiveProject(current.id);
    projectFrame = null;
  };

  projectLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href")?.replace("#", "");
      if (id) setActiveProject(id);
    });
  });

  if ("IntersectionObserver" in window && projectSwitchSection) {
    const miniObserver = new IntersectionObserver(
      ([entry]) => {
        const shouldShow = !entry.isIntersecting && entry.boundingClientRect.top < projectMiniThreshold;

        if (shouldShow !== miniNavigationVisible) {
          setMiniNavigationVisible(shouldShow);
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${projectMiniThreshold}px 0px 0px 0px`,
      },
    );

    miniObserver.observe(projectMiniTrigger);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (projectFrame) return;
      projectFrame = requestAnimationFrame(updateActiveProject);
    },
    { passive: true },
  );
  updateActiveProject();
}

let scrollFrame;

function updateScrollEffects() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  progressBar.style.transform = `scaleX(${progress})`;
  document.documentElement.style.setProperty("--page-scroll", `${window.scrollY}px`);

  document.querySelectorAll(".project-image").forEach((frame) => {
    const rect = frame.getBoundingClientRect();
    const viewportProgress =
      (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const offset = (Math.min(1, Math.max(0, viewportProgress)) - 0.5) * 24;
    frame.style.setProperty("--image-shift", `${offset}px`);
  });

  scrollFrame = null;
}

window.addEventListener(
  "scroll",
  () => {
    if (reducedMotion || scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollEffects);
  },
  { passive: true },
);

if (!reducedMotion) {
  updateScrollEffects();

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-x", `${y * -2.4}deg`);
      card.style.setProperty("--tilt-y", `${x * 2.4}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });

  document.querySelectorAll(".primary-cta, .contact-section > a, .contact-trigger").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;

      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      button.style.transform = `translate(${x * 0.06}px, ${y * 0.08}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}
