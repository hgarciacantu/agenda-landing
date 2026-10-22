/* Giros: selector por industria.
   Patrón WAI-ARIA Tabs con roving tabindex, sin dependencias ni globals.
   Si este archivo falla, el HTML ya renderiza el primer panel visible. */
(function () {
  'use strict';

  var root = document.getElementById('giros');
  if (!root) return;

  var tablist = root.querySelector('[role="tablist"]');
  if (!tablist) return;

  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  var entries = tabs.map(function (tab) {
    return {
      tab: tab,
      panel: document.getElementById(tab.getAttribute('aria-controls')),
      slug: tab.getAttribute('data-giro') || ''
    };
  }).filter(function (entry) {
    return entry.panel !== null;
  });
  if (!entries.length) return;

  var HASH_PREFIX = '#giros-';

  // Prefetch: las fotos de los paneles ocultos viven en data-src y loading="lazy",
  // así que el navegador no las pide hasta mostrarlas. Un Image() aparte las deja
  // en caché para que al cambiar de pestaña ya estén listas, sin tocar el lazy del
  // <img> real.
  var preloads = [];

  function prefetchImages(panel) {
    if (!panel) return;
    var deferred = panel.querySelectorAll('img[data-src]');
    Array.prototype.forEach.call(deferred, function (img) {
      if (img.hasAttribute('data-prefetched')) return;
      var url = img.getAttribute('data-src');
      if (!url) return;
      img.setAttribute('data-prefetched', '');
      var loader = new window.Image();
      loader.decoding = 'async';
      loader.src = url;
      if (loader.decode) loader.decode().catch(function () {});
      preloads.push(loader); // referencia viva: evita que el GC cancele la descarga
    });
  }

  function prefetchTab(tab) {
    var index = indexOfTab(tab);
    if (index >= 0) prefetchImages(entries[index].panel);
  }

  // Precarga en idle de los giros restantes, sin competir con la carga inicial.
  function prefetchRest() {
    var conn = navigator.connection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
    var run = function () {
      entries.forEach(function (entry) { prefetchImages(entry.panel); });
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      window.setTimeout(run, 1500);
    }
  }

  // Las fotos de los paneles no visibles viven en data-src para no descargarlas
  // hasta que el usuario abre ese giro. La primera se sirve con src normal.
  function hydrateImages(panel) {
    var deferred = panel.querySelectorAll('img[data-src]');
    Array.prototype.forEach.call(deferred, function (img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }

  function indexOfTab(tab) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].tab === tab) return i;
    }
    return -1;
  }

  // Mantiene visible la pestaña activa dentro de la tira con scroll horizontal,
  // sin mover el scroll de la página (solo scrollLeft del tablist).
  // Alinea al inicio de la pestaña porque en móvil el tablist usa
  // scroll-snap-type x mandatory: un scrollLeft intermedio lo revierte el snap.
  function revealTab(tab) {
    var listRect = tablist.getBoundingClientRect();
    var tabRect = tab.getBoundingClientRect();
    if (tabRect.left >= listRect.left - 1 && tabRect.right <= listRect.right + 1) return;

    var max = tablist.scrollWidth - tablist.clientWidth;
    if (max <= 0) return;

    var target = tablist.scrollLeft + (tabRect.left - listRect.left);
    tablist.scrollLeft = Math.max(0, Math.min(max, Math.round(target)));
  }

  // La pista de scroll (degradado en el borde) solo se muestra cuando el tablist
  // desborda y queda contenido oculto hacia ese lado. Es puramente decorativa:
  // no añade nodos focusables ni altera el rol tablist.
  var rail = tablist.parentElement && tablist.parentElement.classList.contains('giros-tabrail')
    ? tablist.parentElement
    : null;

  function updateRail() {
    if (!rail) return;
    var max = tablist.scrollWidth - tablist.clientWidth;
    var x = tablist.scrollLeft;
    rail.classList.toggle('has-more', max > 2 && x < max - 2);
    rail.classList.toggle('has-less', max > 2 && x > 2);
  }

  var railFrame = 0;
  tablist.addEventListener('scroll', function () {
    if (railFrame) return;
    railFrame = window.requestAnimationFrame(function () {
      railFrame = 0;
      updateRail();
    });
  }, { passive: true });

  if (rail) {
    if ('ResizeObserver' in window) {
      new ResizeObserver(updateRail).observe(tablist);
    } else {
      window.addEventListener('resize', updateRail);
    }
  }

  function activate(index, focusTab) {
    if (index < 0 || index >= entries.length) return;

    entries.forEach(function (entry, i) {
      var selected = i === index;

      entry.tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      entry.tab.tabIndex = selected ? 0 : -1;
      entry.tab.classList.toggle('is-active', selected);

      if (selected) {
        hydrateImages(entry.panel);
        entry.panel.hidden = false;
        // Coexiste con la capa de scroll-reveal de main.js: el panel activo
        // siempre queda visible aunque el observer todavía no lo haya tocado.
        entry.panel.classList.add('is-visible');
        entry.panel.classList.remove('is-entering');
        void entry.panel.offsetWidth; // reinicia el fade del panel
        entry.panel.classList.add('is-entering');
      } else {
        entry.panel.hidden = true;
        entry.panel.classList.remove('is-entering');
      }
    });

    if (focusTab) entries[index].tab.focus();
    revealTab(entries[index].tab);
    updateRail();
  }

  function currentIndex() {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].tab.getAttribute('aria-selected') === 'true') return i;
    }
    return 0;
  }

  function indexFromHash() {
    var hash = window.location.hash || '';
    if (hash.indexOf(HASH_PREFIX) !== 0) return -1;
    var slug = hash.slice(HASH_PREFIX.length);
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].slug === slug) return i;
    }
    return -1;
  }

  // Intención de abrir una pestaña: precarga su foto al pasar el cursor o al
  // enfocarla con teclado (y en touch desde el primer contacto).
  function onTabIntent(event) {
    var tab = event.target.closest ? event.target.closest('[role="tab"]') : null;
    if (tab) prefetchTab(tab);
  }
  tablist.addEventListener('pointerover', onTabIntent);
  tablist.addEventListener('pointerdown', onTabIntent);
  tablist.addEventListener('focusin', onTabIntent);

  tablist.addEventListener('click', function (event) {
    var tab = event.target.closest ? event.target.closest('[role="tab"]') : null;
    if (!tab) return;
    var index = indexOfTab(tab);
    if (index >= 0) activate(index, false);
  });

  tablist.addEventListener('keydown', function (event) {
    var tab = event.target.closest ? event.target.closest('[role="tab"]') : null;
    if (!tab) return;

    var index = indexOfTab(tab);
    if (index < 0) return;

    var target = -1;
    var key = event.key;

    if (key === 'ArrowRight' || key === 'ArrowDown') {
      target = (index + 1) % entries.length;
    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
      target = (index - 1 + entries.length) % entries.length;
    } else if (key === 'Home') {
      target = 0;
    } else if (key === 'End') {
      target = entries.length - 1;
    }

    if (target < 0) return;
    event.preventDefault();
    activate(target, true);
  });

  // Sincronización trivial con el hash: #giros-salon abre ese giro.
  window.addEventListener('hashchange', function () {
    var index = indexFromHash();
    if (index >= 0 && index !== currentIndex()) activate(index, false);
  });

  var initial = indexFromHash();
  activate(initial >= 0 ? initial : 0, false);
  updateRail();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateRail).catch(function () {});
  }

  // Al terminar la carga inicial, precarga el resto de giros sin bloquear nada.
  if (document.readyState === 'complete') {
    prefetchRest();
  } else {
    window.addEventListener('load', prefetchRest, { once: true });
  }
})();
