(() => {
  "use strict";
  const players = [...document.querySelectorAll("[data-app-player]")];
  players.forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector("button");
    const status = player.parentElement.querySelector("[data-video-status]");
    const idleText = status.textContent;
    button.addEventListener("click", async () => {
      button.hidden = true;
      video.controls = true;
      if (!video.getAttribute("src")) video.src = video.dataset.src;
      status.textContent = "正在加载演示…";
      try {
        await video.play();
      } catch {
        button.hidden = false;
        status.textContent = "未能开始播放，请重试或使用视频播放控件。";
      }
    });
    video.addEventListener("play", () => {
      players.forEach((other) => {
        if (other !== player) other.querySelector("video").pause();
      });
    });
    video.addEventListener("playing", () => { status.textContent = idleText; });
    video.addEventListener("waiting", () => { status.textContent = "正在缓冲…"; });
    video.addEventListener("error", () => {
      button.hidden = false;
      status.textContent = "视频加载失败，请检查网络后重试。";
      video.removeAttribute("src");
      video.load();
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) players.forEach((player) => player.querySelector("video").pause());
  });
})();
