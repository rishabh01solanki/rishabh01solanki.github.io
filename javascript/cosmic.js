/* COSMIC DEPTH — starfield, scroll reveals, typed hero, nav.
   Plain JS, no dependencies. Loaded with `defer` on every page. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coarsePointer = window.matchMedia('(pointer: coarse)');

  /* ---- Starfield --------------------------------------------------------- */
  function startStarfield() {
    var canvas = document.getElementById('starfield');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [];
    var w = 0, h = 0;
    var mouseX = 0, mouseY = 0;     // normalized target (-0.5 .. 0.5)
    var offX = 0, offY = 0;          // lerped offset
    var rafId = null;
    var shooting = null;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var count = Math.min(220, Math.floor((w * h) / 6000));
      stars = [];
      for (var i = 0; i < count; i++) {
        var z = [0.3, 0.6, 1][i % 3];
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: z,
          r: 0.4 + z * Math.random(),
          base: 0.25 + 0.55 * z * Math.random() + 0.15,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2
        });
      }
    }

    function drawStar(s, t) {
      var alpha = s.base + 0.25 * Math.sin(t * 0.001 * s.speed + s.phase);
      ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(s.x + offX * s.z * 14, s.y + offY * s.z * 14, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function maybeShoot() {
      if (shooting || Math.random() > 1 / 300) return;
      var fromTop = Math.random() < 0.7;
      shooting = {
        x: Math.random() * w,
        y: fromTop ? -10 : Math.random() * h * 0.4,
        vx: 6 + Math.random() * 5,
        vy: 4 + Math.random() * 3,
        life: 1
      };
    }

    function drawShooting() {
      if (!shooting) return;
      var s = shooting;
      ctx.globalAlpha = s.life * 0.8;
      ctx.strokeStyle = '#b6bdf5';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 6, s.y - s.vy * 6);
      ctx.stroke();
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.02;
      if (s.life <= 0 || s.x > w + 80 || s.y > h + 80) shooting = null;
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#e8eaf6';
      offX += (mouseX - offX) * 0.05;
      offY += (mouseY - offY) * 0.05;
      for (var i = 0; i < stars.length; i++) drawStar(stars[i], t);
      maybeShoot();
      drawShooting();
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(frame);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#e8eaf6';
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        ctx.globalAlpha = s.base;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function play() {
      if (rafId === null && !reduceMotion.matches) rafId = requestAnimationFrame(frame);
    }
    function pause() {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        if (reduceMotion.matches) drawStatic();
      }, 150);
    });

    if (!coarsePointer.matches) {
      window.addEventListener('mousemove', function (e) {
        mouseX = e.clientX / w - 0.5;
        mouseY = e.clientY / h - 0.5;
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else play();
    });

    function applyMotionPref() {
      if (reduceMotion.matches) { pause(); drawStatic(); }
      else play();
    }
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', applyMotionPref);

    resize();
    applyMotionPref();
  }

  /* ---- Typed hero name ---------------------------------------------------- */
  function startTypedName() {
    var el = document.querySelector('[data-typed]');
    if (!el) return;
    var text = el.getAttribute('data-typed');
    var target = el.querySelector('.typed-target') || el;
    var caret = el.querySelector('.caret');

    if (reduceMotion.matches) {
      target.textContent = text;
      if (caret) caret.classList.add('done');
      return;
    }

    target.textContent = ''; // markup ships the full name for no-JS; typing rebuilds it
    var i = 0;
    function tick() {
      if (i < text.length) {
        target.textContent += text.charAt(i);
        i++;
        setTimeout(tick, 70);
      } else if (caret) {
        caret.classList.add('done');
      }
    }
    setTimeout(tick, 650); // let the hero stage-in start first
  }

  /* ---- Scroll reveals ------------------------------------------------------ */
  function startReveals() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Nav: mobile toggle + scrollspy -------------------------------------- */
  function startNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') links.classList.remove('open');
      });
    }

    // Scrollspy (homepage only — sections with ids referenced by nav hashes)
    var navAnchors = document.querySelectorAll('.nav-links a[href^="/#"], .nav-links a[href^="#"]');
    if (!navAnchors.length || !('IntersectionObserver' in window)) return;
    var map = {};
    navAnchors.forEach(function (a) {
      var hash = a.getAttribute('href').replace(/^\/?#/, '');
      var section = document.getElementById(hash);
      if (section) map[hash] = a;
    });
    var ids = Object.keys(map);
    if (!ids.length) return;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) { a.classList.remove('active'); });
          map[entry.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    ids.forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ---- Hero entrance -------------------------------------------------------- */
  function startHero() {
    var hero = document.querySelector('.hero');
    if (hero) {
      requestAnimationFrame(function () { hero.classList.add('is-live'); });
    }
  }

  function init() {
    startStarfield();
    startTypedName();
    startReveals();
    startNav();
    startHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
