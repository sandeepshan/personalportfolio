/* ============================================
   Sandeep Shankar — Shared Site JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---------- Navigation mobile toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    var lastToggleWasTouch = false;
    function toggleNav(e) {
      e.preventDefault();
      e.stopPropagation();
      // On mobile, touchend fires then click fires — ignore the ghost click
      if (e.type === 'touchend') { lastToggleWasTouch = true; }
      if (e.type === 'click' && lastToggleWasTouch) { lastToggleWasTouch = false; return; }
      lastToggleWasTouch = false;
      navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('open')));
    }
    navToggle.addEventListener('touchend', toggleNav);
    navToggle.addEventListener('click', toggleNav);

    // Close when a link is tapped
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when tapping outside the nav
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

  /* ---------- Scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    // Inject styles only when JS is running (avoids flash of invisible content)
    var revealStyle = document.createElement('style');
    revealStyle.textContent =
      '.will-animate{opacity:0;transform:translateY(18px);transition:opacity 0.5s ease,transform 0.5s ease;}' +
      '.will-animate.animated{opacity:1;transform:translateY(0);}' +
      '@media(prefers-reduced-motion:reduce){.will-animate{opacity:1!important;transform:none!important;}}';
    document.head.appendChild(revealStyle);

    var revealSelectors = [
      '.achievement-card',
      '.personal-card',
      '.podcast-card',
      '.engagement-row',
      '.timeline-item',
      '.project-row',
      '.cert-row',
      '.edu-row',
      '.gallery-tile',
      '.pull-quote',
      '.section-head',
      '.stat-row',
      '.lede',
      '.story p',
      '.principle-card',
      '.expertise-card',
      '.philosophy-quote',
      '.am-item',
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

    revealEls.forEach(function (el, i) {
      // Stagger siblings within the same parent
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
    // Find the first number in the text
    var match = original.match(/(\d+\.?\d*)/);
    if (!match) return;

    var numStr = match[1];
    var num = parseFloat(numStr);
    var before = original.slice(0, match.index);
    var after = original.slice(match.index + numStr.length);
    var isDecimal = numStr.indexOf('.') !== -1;
    var duration = 1100;
    var startTime = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      var current = num * eased;
      var formatted = isDecimal ? current.toFixed(1) : Math.round(current).toString();
      el.textContent = before + formatted + after;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  var counterSelectors = '.a-num, .stat .num, .stat-lead .num, .timeline-stats .t-stat .num';
  var counterEls = document.querySelectorAll(counterSelectors);

  if ('IntersectionObserver' in window && counterEls.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counterEls.f