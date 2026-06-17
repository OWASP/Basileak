/* BASILEAK · social stage scaler
   Each deliverable is an exact-pixel .bb-canvas[data-w][data-h]. The art is
   authored at true size; this scales it to fit its column so the spec page is
   browsable, while the canvas itself stays pixel-exact for screenshot export. */
(function () {
  function fit() {
    document.querySelectorAll('.bb-frame').forEach(function (frame) {
      var c = frame.querySelector('.bb-canvas');
      if (!c) return;
      var w = +c.dataset.w, h = +c.dataset.h;
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      var avail = frame.parentElement.clientWidth;
      var scale = Math.min(1, avail / w);
      c.style.transform = 'scale(' + scale + ')';
      frame.style.width = Math.round(w * scale) + 'px';
      frame.style.height = Math.round(h * scale) + 'px';
    });
  }
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
  fit();
})();
