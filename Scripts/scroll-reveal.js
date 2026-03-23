// ============================================================
// Scroll Reveal — IntersectionObserver based
// Replaces scroll listener for better performance
// ============================================================

(function () {
  'use strict';

  var selectors = [
    '.section__header',
    '.project-card',
    '.dev-project',
    '.stack-category',
    '.timeline__item',
    '.approach-card',
    '.arch-container',
    '.about-card',
    '.contact-block'
  ];

  var elements = [];
  selectors.forEach(function (sel) {
    var nodes = document.querySelectorAll(sel);
    nodes.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      elements.push(el);
    });
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    elements.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;

      // Stagger delay based on sibling index
      var delay = 0;
      var parent = el.parentElement;
      if (parent) {
        var siblings = Array.prototype.slice.call(parent.children);
        var index = siblings.indexOf(el);
        delay = index * 80;
      }

      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delay);

      observer.unobserve(el);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();
