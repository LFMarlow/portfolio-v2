(function () {
  'use strict';

  var revealTargets = [
    '.section__header',
    '.project-card',
    '.stack-category',
    '.timeline__item',
    '.arch-container'
  ];

  var allElements = [];

  revealTargets.forEach(function (selector) {
    var els = document.querySelectorAll(selector);
    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      allElements.push(el);
    });
  });

  function applyStagger() {
    var groups = {};

    allElements.forEach(function (el) {
      var parent = el.parentElement;
      var key = parent ? parent.className : 'default';
      if (!groups[key]) groups[key] = [];
      groups[key].push(el);
    });

    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.1) + 's';
      });
    });
  }

  applyStagger();

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    allElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    //Fallback: just show everything
    allElements.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
})();
