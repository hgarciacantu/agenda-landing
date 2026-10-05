/* AgendaAI landing interactions: nav, pricing toggle, forms, dialog, WebMCP imperative */
(function () {
  'use strict';

  // Year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Pricing toggle (mensual / anual)
  var billingToggle = document.getElementById('billing-toggle');
  var announce = document.getElementById('price-announce');
  if (billingToggle) {
    billingToggle.addEventListener('click', function () {
      var annual = billingToggle.getAttribute('aria-checked') !== 'true';
      billingToggle.setAttribute('aria-checked', String(annual));
      document.querySelectorAll('.pricing-card .amount').forEach(function (el) {
        var val = annual ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
        if (val) el.textContent = val;
      });
      document.querySelectorAll('.pricing-card .period').forEach(function (el) {
        el.textContent = annual ? '/mes fact. anual' : '/mes';
      });
      if (announce) announce.textContent = annual ? 'Precios anuales con 20% de descuento.' : 'Precios mensuales.';
    });
  }

  // Demo dialog
  var dialog = document.getElementById('demo-dialog');
  var openBtn = document.querySelector('.video-placeholder');
  if (dialog && openBtn && typeof dialog.showModal === 'function') {
    openBtn.addEventListener('click', function () { dialog.showModal(); });
    dialog.querySelectorAll('[data-close-dialog]').forEach(function (btn) {
      btn.addEventListener('click', function () { dialog.close(); });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  } else if (openBtn) {
    openBtn.addEventListener('click', function () {
      document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Contact form validation (progressive enhancement; backend = /api/leads)
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var setErr = function (id, msg) {
      var input = document.getElementById(id);
      var err = document.getElementById(id + '-err');
      if (!input || !err) return;
      var bad = Boolean(msg);
      input.setAttribute('aria-invalid', String(bad));
      err.textContent = msg || '';
      err.hidden = !bad;
    };
    var showStatus = function (ok, msg) {
      if (!status) return;
      status.hidden = false;
      status.className = 'form-status ' + (ok ? 'success' : 'error');
      status.textContent = msg;
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var firstBad = null;
      setErr('name', name.length < 2 ? 'Escribe tu nombre (mín. 2 caracteres).' : '');
      if (name.length < 2) firstBad = firstBad || 'name';
      setErr('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Escribe un email válido.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) firstBad = firstBad || 'email';
      setErr('message', message.length < 10 ? 'Cuéntanos un poco más (mín. 10 caracteres).' : '');
      if (message.length < 10) firstBad = firstBad || 'message';
      if (firstBad) {
        showStatus(false, 'Revisa los campos marcados e inténtalo de nuevo.');
        document.getElementById(firstBad).focus();
        return;
      }
      // Demo sin backend: simula envío exitoso
      showStatus(true, '¡Gracias, ' + name.split(' ')[0] + '! Te responderemos en menos de 4h laborables.');
      form.reset();
    });
  }

  // Trial / pricing demo handlers (evitan 404 hasta tener backend)
  document.querySelectorAll('form[action^="/api/"]').forEach(function (f) {
    if (f.id === 'contact-form') return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = f.querySelector('input[type="email"]');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.focus();
        email.setAttribute('aria-invalid', 'true');
        return;
      }
      var plan = f.querySelector('input[name="plan"]');
      var planName = plan ? plan.value : 'professional';
      window.location.hash = '#pricing';
      if (announce) announce.textContent = '¡Listo! Revisa tu email para activar la prueba de ' + planName + '.';
    });
  });

  // ---- Subtle motion layer (reveal, progress, counters, loading) ----
  (function motion() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Header elevation + scroll progress
    var header = document.querySelector('.header');
    var progress = document.querySelector('.scroll-progress');
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        if (header) header.classList.toggle('scrolled', y > 8);
        if (progress) {
          progress.style.setProperty('--scroll', p.toFixed(4));
          progress.classList.toggle('is-active', y > 40 && p < 0.995);
        }
        ticking = false;
      });
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Scroll reveal: auto-target cards/sections, stagger siblings
    var targets = document.querySelectorAll(
      '.section-header, .feature-card, .step, .stat, .testimonial-card, .pricing-card, .faq-item, .cta-card, .contact-form, .demo-container, .logos-row'
    );
    if ('IntersectionObserver' in window && targets.length) {
      // Group stagger: siblings inside same grid share incremental delay
      document.querySelectorAll('.features-grid, .steps, .testimonials-grid, .pricing-grid, .demo-stats').forEach(function (grid) {
        Array.prototype.forEach.call(grid.children, function (child, i) {
          child.style.setProperty('--reveal-delay', Math.min(i * 70, 350) + 'ms');
        });
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      targets.forEach(function (el) {
        el.classList.add('reveal');
        io.observe(el);
      });
      // Chat demo: play staggered messages when hero visual enters
      var chat = document.querySelector('.chat-demo');
      if (chat) {
        var chatIO = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting) { chat.classList.add('play'); chatIO.disconnect(); }
          });
        }, { threshold: 0.3 });
        chatIO.observe(chat);
      }
    } else {
      var chatFallback = document.querySelector('.chat-demo');
      if (chatFallback) chatFallback.classList.add('play');
    }

    // Animated counters for .stat-value numbers (98%, <3s, 24/7, 99.9% → count where numeric)
    var counters = document.querySelectorAll('.stat-value');
    var animateNum = function (el) {
      var raw = el.textContent.trim();
      var m = raw.match(/(\d+(?:[.,]\d+)?)/);
      if (!m) return;
      var decimals = (m[1].split(/[.,]/)[1] || '').length;
      var target = parseFloat(m[1].replace(',', '.'));
      if (!isFinite(target)) return;
      var prefix = raw.slice(0, m.index);
      var suffix = raw.slice(m.index + m[0].length);
      var dur = 900, t0 = null;
      var step = function (t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - k, 3);
        var val = (target * eased).toFixed(decimals);
        el.textContent = prefix + val + suffix;
        if (k < 1) requestAnimationFrame(step);
        else el.classList.add('counted');
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window && counters.length) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) { animateNum(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }

    // Button loading feedback on demo forms (no backend yet): brief spinner → announce
    document.querySelectorAll('form[action^="/api/"]').forEach(function (f) {
      f.addEventListener('submit', function () {
        var btn = f.querySelector('button[type="submit"]');
        if (!btn || btn.classList.contains('is-loading')) return;
        var email = f.querySelector('input[type="email"]');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return;
        btn.classList.add('is-loading');
        btn.setAttribute('aria-busy', 'true');
        setTimeout(function () {
          btn.classList.remove('is-loading');
          btn.removeAttribute('aria-busy');
        }, 900);
      });
    });
  })();

  // WebMCP imperative: solo acciones dinámicas (declarative cubre el resto)
  try {
    if ('mcpActions' in navigator && navigator.mcpActions && typeof navigator.mcpActions.register === 'function') {
      navigator.mcpActions.register({
        id: 'check-availability',
        name: 'Check Availability',
        description: 'Consultar huecos disponibles en tiempo real para reservar. Indica rango de fechas.',
        parameters: {
          type: 'object',
          required: ['date_from', 'date_to'],
          properties: {
            date_from: { type: 'string', format: 'date', description: 'Fecha inicio YYYY-MM-DD' },
            date_to: { type: 'string', format: 'date', description: 'Fecha fin YYYY-MM-DD' }
          }
        },
        handler: async function (params) {
          var res = await fetch('/api/slots?from=' + encodeURIComponent(params.date_from) + '&to=' + encodeURIComponent(params.date_to));
          var data = await res.json().catch(function () { return { slots: [] }; });
          return { success: res.ok, slots: data.slots || [] };
        }
      });
    }
  } catch (err) { /* WebMCP opcional: la landing funciona sin él */ }
})();
