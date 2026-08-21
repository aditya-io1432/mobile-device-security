(function () {
  'use strict';

  var sections = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var railButtons = Array.prototype.slice.call(document.querySelectorAll('.rail-nav button'));
  var railFill = document.getElementById('railProgressFill');
  var topFill = document.getElementById('topProgressFill');

  /* ---------- Nav: click to scroll ---------- */
  railButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Active section + scroll progress ---------- */
  function setActive(id) {
    railButtons.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.target === id);
    });
  }

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
        setActive(entry.target.id);
      }
    });
  }, { threshold: [0.45] });

  sections.forEach(function (s) { sectionObserver.observe(s); });

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (railFill) railFill.style.height = pct + '%';
    if (topFill) topFill.style.width = pct + '%';
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { updateProgress(); ticking = false; });
      ticking = true;
    }
  });
  updateProgress();

  /* ---------- Scroll-reveal ---------- */
  var revealTargets = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Keyboard navigation ---------- */
  function currentIndex() {
    var mid = window.scrollY + window.innerHeight / 2;
    var closest = 0, closestDist = Infinity;
    sections.forEach(function (s, i) {
      var d = Math.abs(s.offsetTop + s.offsetHeight / 2 - mid);
      if (d < closestDist) { closestDist = d; closest = i; }
    });
    return closest;
  }
  document.addEventListener('keydown', function (e) {
    var idx = currentIndex();
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      sections[Math.min(idx + 1, sections.length - 1)].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      sections[Math.max(idx - 1, 0)].scrollIntoView({ behavior: 'smooth' });
    }
  });

  /* ---------- Threat strip: drag to scroll ---------- */
  var scroller = document.querySelector('.threat-scroller');
  if (scroller) {
    var isDown = false, startX, scrollLeft;
    scroller.addEventListener('mousedown', function (e) {
      isDown = true;
      startX = e.pageX - scroller.offsetLeft;
      scrollLeft = scroller.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(function (evt) {
      scroller.addEventListener(evt, function () { isDown = false; });
    });
    scroller.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - scroller.offsetLeft;
      scroller.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  }

  /* ---------- Phishing simulator ---------- */
  var flags = Array.prototype.slice.call(document.querySelectorAll('.flag'));
  var logBody = document.getElementById('simLogBody');
  var counterEl = document.getElementById('flagCounter');
  var found = new Set();
  var TOTAL = flags.length;

  flags.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.dataset.flag;
      btn.classList.add('is-found');
      if (found.has(key)) return;
      found.add(key);
      counterEl.textContent = found.size + ' / ' + TOTAL;

      if (found.size === 1) { logBody.innerHTML = ''; }
      var line = document.createElement('p');
      line.className = 'log-line';
      line.innerHTML = '<b>[FLAG ' + found.size + ']</b> ' + btn.dataset.explain;
      logBody.appendChild(line);

      if (found.size === TOTAL) {
        var done = document.createElement('p');
        done.className = 'log-line';
        done.innerHTML = 'All flags found — nice catch.<span class="cursor"></span>';
        logBody.appendChild(done);
      }
    });
  });

  /* ---------- Checklist toggle ---------- */
  var checkItems = Array.prototype.slice.call(document.querySelectorAll('.check-item'));
  var checkProgress = document.getElementById('checkProgress');
  var TOTAL_CHECKS = checkItems.length;

  function updateCheckProgress() {
    var done = document.querySelectorAll('.check-item.done').length;
    if (checkProgress) checkProgress.textContent = done + ' / ' + TOTAL_CHECKS + ' secured';
  }

  checkItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('done');
      updateCheckProgress();
    });
  });
  updateCheckProgress();

})();
