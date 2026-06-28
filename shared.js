/* ============================================
   Sandeep Shankar — Shared Site JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---------- Navigation mobile toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    function toggleNav() {
      navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('open')));
    }
    navToggle.addEventListener('click', toggleNav);

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('touchstart', function (e) {
      if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }, { passive: true });

    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Reading progress bar ---------- */
  var progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      var show = (window.scrollY || document.documentElement.scrollTop) > 400;
      backToTop.classList.toggle('visible', show);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Section progress dots ---------- */
  (function () {
    var sections = document.querySelectorAll('.section[data-label]');
    if (sections.length < 2) return;

    var rail = document.createElement('nav');
    rail.className = 'section-rail';
    rail.setAttribute('aria-label', 'Page sections');

    var dots = [];
    sections.forEach(function (sec, i) {
      var dot = document.createElement('button');
      dot.className = 'rail-dot';
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', sec.getAttribute('data-label'));
      dot.setAttribute('title', sec.getAttribute('data-label'));
      dot.addEventListener('click', function () {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      rail.appendChild(dot);
      dots.push({ dot: dot, sec: sec });
    });

    document.body.appendChild(rail);

    if ('IntersectionObserver' in window) {
      var railObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          dots.forEach(function (d) {
            if (d.sec === entry.target) {
              d.dot.classList.toggle('active', entry.isIntersecting);
            }
          });
        });
      }, { threshold: 0.3 });

      dots.forEach(function (d) { railObserver.observe(d.sec); });
    }
  })();

  /* ---------- Scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    var revealStyle = document.createElement('style');
    revealStyle.textContent =
      '.will-animate{opacity:0;transform:translateY(18px);transition:opacity 0.5s ease,transform 0.5s ease;}' +
      '.will-animate.animated{opacity:1;transform:translateY(0);}' +
      '@media(prefers-reduced-motion:reduce){.will-animate{opacity:1!important;transform:none!important;}}';
    document.head.appendChild(revealStyle);

    var revealSelectors = [
      '.achievement-card', '.personal-card', '.podcast-card',
      '.engagement-row', '.timeline-item', '.project-row',
      '.cert-row', '.edu-row', '.gallery-tile', '.pull-quote',
      '.section-head', '.stat-row', '.lede', '.story p',
      '.principle-card', '.expertise-card', '.philosophy-quote',
      '.am-item', '.manifesto-item', '.case-card'
    ].join(',');

    var revealEls = document.querySelectorAll(revealSelectors);

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });

    revealEls.forEach(function (el) {
      var siblings = Array.from(el.parentElement.children).filter(function (c) {
        return c.tagName === el.tagName && c.className === el.className;
      });
      var sibIdx = siblings.indexOf(el);
      var delay = sibIdx >= 0 ? Math.min(sibIdx * 70, 280) : 0;
      el.classList.add('will-animate');
      el.style.transitionDelay = delay + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---------- Animated stat counters ---------- */
  function animateCounter(el) {
    var original = el.textContent || '';
    var match = original.match(/(\d+\.?\d*)/);
    if (!match) return;
    var numStr = match[1];
    var num = parseFloat(numStr);
    var before = original.slice(0, match.index);
    var after = original.slice(match.index + numStr.length);
    var isDecimal = numStr.indexOf('.') !== -1;
    var duration = 1100;
    var startTime = null;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var current = num * easeOutCubic(progress);
      var formatted = isDecimal ? current.toFixed(1) : Math.round(current).toString();
      el.textContent = before + formatted + after;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterEls = document.querySelectorAll('.a-num, .stat .num, .stat-lead .num, .timeline-stats .t-stat .num, .impact-num');
  if ('IntersectionObserver' in window && counterEls.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counterEls.forEach(function (el) { counterObserver.observe(el); });
  }

})();
