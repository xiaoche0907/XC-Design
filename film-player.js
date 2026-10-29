const deferredPosters = document.querySelectorAll("video[data-poster]");

function loadVideoPoster(video) {
  video.poster = video.dataset.poster;
  video.removeAttribute("data-poster");
}

if ("IntersectionObserver" in window) {
  const posterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadVideoPoster(entry.target);
      posterObserver.unobserve(entry.target);
    });
  }, { rootMargin: "400px 0px" });
  deferredPosters.forEach((video) => posterObserver.observe(video));
} else {
  deferredPosters.forEach(loadVideoPoster);
}

document.querySelectorAll("[data-film-player]").forEach((video) => {
  const controls = video.parentElement.querySelector(".film-playback");
  const status = controls.querySelector("[role='status']");
  const retry = controls.querySelector("button");
  function clearStatus() {
    controls.hidden = true;
    status.textContent = "";
    retry.hidden = true;
  }

  function resumeAt(time) {
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(time, Math.max(0, video.duration - 0.1));
      video.play().catch(() => {});
    }, { once: true });
    video.load();
  }

  retry.addEventListener("click", () => {
    const time = video.currentTime;
    clearStatus();
    resumeAt(time);
  });

  video.addEventListener("play", () => {
    document.querySelectorAll("[data-film-player]").forEach((other) => {
      if (other !== video && !other.paused) other.pause();
    });
  });

  ["playing", "loadeddata", "pause", "ended"].forEach((event) => {
    video.addEventListener(event, () => {
      if (!video.error) clearStatus();
    });
  });

  video.addEventListener("error", () => {
    controls.hidden = false;
    status.textContent = "视频加载失败";
    retry.hidden = false;
  });
});
