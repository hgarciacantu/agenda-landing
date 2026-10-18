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

  // Demo dialog removal: #chat-open ahora abre el widget flotante (js/demo-chat.js)

  // Sin formularios propios: el único canal de conversión es el bot de Telegram.
  // (Los antiguos /api/trial, /api/subscribe, /api/leads y /api/sales no tienen backend.)

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

    // Sin formularios que simular: el CTA principal abre el bot de Telegram.
  })();

  // ============ Agenda Widget Demo (mimo zen) ============
  (function agendaDemo() {
    var grid = document.getElementById('agenda-days');
    var titleEl = document.getElementById('agenda-title');
    var slotsPanel = document.getElementById('agenda-slots');
    var slotsList = document.getElementById('agenda-slots-list');
    var slotsDate = document.getElementById('agenda-slots-date');
    var slotsClose = document.getElementById('agenda-slots-close');
    var slotsEmpty = document.getElementById('agenda-slots-empty');
    var prevBtn = document.getElementById('agenda-prev');
    var nextBtn = document.getElementById('agenda-next');
    var viewBtns = document.querySelectorAll('.agenda-view-btn');
    var tabPanel = document.getElementById('agenda-view-panel');

    if (!grid || !titleEl) return;

    var state = {
      currentDate: new Date(),
      view: 'week',
      selectedDay: null,
      selectedSlot: null
    };

    // Índices alineados con Date.getDay() (0 = domingo)
    var dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    function formatDate(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function parseDate(s) {
      var parts = s.split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    function isToday(d) {
      var t = new Date();
      return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    }

    function isPast(d) {
      var t = new Date();
      t.setHours(0, 0, 0, 0);
      return d < t;
    }

    function generateSlots(dateStr) {
      var base = parseDate(dateStr);
      var dayOfWeek = base.getDay();
      var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      var isPastDay = isPast(base);

      var allSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
      ];

      if (isWeekend) {
        allSlots = allSlots.slice(4, 16);
      }

      var bookedTimes = ['10:00', '11:30', '14:00', '16:30', '18:00'];
      var rng = new PseudoRandom(dateStr);
      var slots = allSlots.map(function (time) {
        var isBooked = bookedTimes.includes(time) || (rng.next() < 0.15 && !isPastDay);
        return {
          time: time,
          status: isPastDay ? 'past' : (isBooked ? 'booked' : 'available'),
          label: time
        };
      });

      return slots;
    }

    function PseudoRandom(seed) {
      var h = 0;
      for (var i = 0; i < seed.length; i++) {
        h = ((h << 5) - h) + seed.charCodeAt(i);
        h |= 0;
      }
      this.state = Math.abs(h) || 1;
    }
    PseudoRandom.prototype.next = function () {
      this.state = (this.state * 1664525 + 1013904223) % 4294967296;
      return this.state / 4294967296;
    };

    function renderTitle() {
      var d = state.currentDate;
      if (state.view === 'month') {
        titleEl.textContent = monthNames[d.getMonth()] + ' ' + d.getFullYear();
      } else if (state.view === 'week') {
        var start = new Date(d);
        start.setDate(d.getDate() - d.getDay() + 1);
        var end = new Date(start);
        end.setDate(start.getDate() + 6);
        titleEl.textContent = start.getDate() + ' - ' + end.getDate() + ' ' + monthNames[end.getMonth()] + ' ' + end.getFullYear();
      } else {
        titleEl.textContent = dayNames[d.getDay()] + ' ' + d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
      }
    }

    function renderGrid() {
      grid.innerHTML = '';
      var d = new Date(state.currentDate);
      var days = [];

      if (state.view === 'month') {
        d.setDate(1);
        var firstDay = d.getDay();
        var offset = firstDay === 0 ? 6 : firstDay - 1;
        var prevMonth = new Date(d);
        prevMonth.setMonth(d.getMonth() - 1);
        var daysInPrev = new Date(d.getFullYear(), d.getMonth(), 0).getDate();

        for (var i = offset - 1; i >= 0; i--) {
          var pd = new Date(prevMonth);
          pd.setDate(daysInPrev - i);
          days.push({ date: pd, empty: true });
        }

        var daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        for (var i = 1; i <= daysInMonth; i++) {
          var cd = new Date(d.getFullYear(), d.getMonth(), i);
          days.push({ date: cd, empty: false });
        }

        var nextMonth = new Date(d);
        nextMonth.setMonth(d.getMonth() + 1);
        while (days.length < 42) {
          var nd = new Date(nextMonth);
          nd.setDate(days.length - daysInMonth - offset + 1);
          days.push({ date: nd, empty: true });
        }
      } else if (state.view === 'week') {
        var start = new Date(d);
        start.setDate(d.getDate() - d.getDay() + 1);
        for (var i = 0; i < 7; i++) {
          var wd = new Date(start);
          wd.setDate(start.getDate() + i);
          days.push({ date: wd, empty: false });
        }
      } else {
        days.push({ date: new Date(d), empty: false });
      }

      var row = null;
      days.forEach(function (day, index) {
        // Filas ARIA de 7 celdas (mes/semana) o 1 celda (día) para una jerarquía grid > row > gridcell válida
        if (index % 7 === 0) {
          row = document.createElement('div');
          row.setAttribute('role', 'row');
          grid.appendChild(row);
        }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'agenda-day';
        btn.setAttribute('role', 'gridcell');
        btn.setAttribute('aria-label', dayNames[day.date.getDay()] + ' ' + day.date.getDate());

        var isSelected = Boolean(state.selectedDay) && formatDate(day.date) === formatDate(state.selectedDay);
        btn.setAttribute('aria-selected', String(isSelected));

        if (day.empty) {
          btn.classList.add('empty');
          btn.textContent = '';
        } else {
          btn.textContent = day.date.getDate();
          if (isToday(day.date)) btn.classList.add('today');
          if (isPast(day.date)) btn.classList.add('past');
          if (isSelected) {
            btn.classList.add('selected');
          }
          var slots = generateSlots(formatDate(day.date));
          if (slots.some(function (s) { return s.status === 'available'; })) {
            btn.classList.add('has-slots');
          }
          btn.dataset.date = formatDate(day.date);
          btn.addEventListener('click', function () {
            if (!day.empty && !isPast(day.date)) openSlots(day.date);
          });
        }
        row.appendChild(btn);
      });
    }

    function openSlots(date) {
      state.selectedDay = date;
      state.selectedSlot = null;
      var dateStr = formatDate(date);
      var slots = generateSlots(dateStr);

      slotsDate.textContent = dayNames[date.getDay()] + ', ' + date.getDate() + ' de ' + monthNames[date.getMonth()];
      slotsList.innerHTML = '';

      var hasAvailable = slots.some(function (s) { return s.status === 'available'; });
      slotsEmpty.hidden = hasAvailable;

      slots.forEach(function (slot) {
        var li = document.createElement('li');
        li.className = 'agenda-slot ' + slot.status;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.dataset.time = slot.time;

        li.innerHTML =
          '<span class="agenda-slot-time">' + slot.time + '</span>' +
          '<span class="agenda-slot-status ' + slot.status + '">' +
            (slot.status === 'available' ? 'Disponible' : slot.status === 'booked' ? 'Reservado' : 'Pasado') +
          '</span>';

        if (slot.status === 'available') {
          li.tabIndex = 0;
          li.addEventListener('click', function () {
            selectSlot(li, slot);
          });
          li.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
              e.preventDefault();
              selectSlot(li, slot);
            }
          });
        } else {
          li.setAttribute('aria-disabled', 'true');
        }
        slotsList.appendChild(li);
      });

      renderGrid();
      slotsPanel.hidden = false;
      slotsPanel.focus();
    }

    function selectSlot(el, slot) {
      var prev = slotsList.querySelector('.agenda-slot.selected');
      if (prev) {
        prev.classList.remove('selected');
        prev.setAttribute('aria-selected', 'false');
        var status = prev.querySelector('.agenda-slot-status');
        if (status) {
          status.className = 'agenda-slot-status available';
          status.textContent = 'Disponible';
        }
      }
      el.classList.add('selected');
      el.setAttribute('aria-selected', 'true');
      var statusEl = el.querySelector('.agenda-slot-status');
      if (statusEl) {
        statusEl.className = 'agenda-slot-status selected';
        statusEl.textContent = 'Seleccionado';
      }
      state.selectedSlot = slot;
    }

    function closeSlots() {
      slotsPanel.hidden = true;
      state.selectedDay = null;
      state.selectedSlot = null;
      renderGrid();
    }

    function navigate(delta) {
      var d = new Date(state.currentDate);
      if (state.view === 'month') {
        d.setMonth(d.getMonth() + delta);
      } else if (state.view === 'week') {
        d.setDate(d.getDate() + delta * 7);
      } else {
        d.setDate(d.getDate() + delta);
      }
      state.currentDate = d;
      closeSlots();
      renderTitle();
      renderGrid();
    }

    function setView(view) {
      state.view = view;
      viewBtns.forEach(function (btn) {
        var active = btn.dataset.view === view;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
        if (active && tabPanel && btn.id) tabPanel.setAttribute('aria-labelledby', btn.id);
      });
      closeSlots();
      renderTitle();
      renderGrid();
    }

    prevBtn.addEventListener('click', function () { navigate(-1); });
    nextBtn.addEventListener('click', function () { navigate(1); });
    slotsClose.addEventListener('click', closeSlots);
    viewBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { setView(btn.dataset.view); });
      // Navegación por teclado del tablist (WAI-ARIA Tabs pattern)
      btn.addEventListener('keydown', function (e) {
        var list = Array.prototype.slice.call(viewBtns);
        var i = list.indexOf(btn);
        var next = null;
        if (e.key === 'ArrowRight') next = list[(i + 1) % list.length];
        else if (e.key === 'ArrowLeft') next = list[(i - 1 + list.length) % list.length];
        else if (e.key === 'Home') next = list[0];
        else if (e.key === 'End') next = list[list.length - 1];
        if (next) {
          e.preventDefault();
          next.focus();
          setView(next.dataset.view);
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !slotsPanel.hidden) {
        closeSlots();
      }
    });

    renderTitle();
    renderGrid();
  })();

  // WebMCP: la acción imperativa "check-availability" se retiró porque apuntaba a
  // /api/slots (sin backend). Las acciones declarativas de la página siguen activas.

  // Analítica: un evento por clic en CTA (data-cta). Si Vercel Analytics no está
  // habilitado, el guard de typeof evita errores en consola.
  document.addEventListener('click', function (e) {
    var el = e.target instanceof Element ? e.target.closest('[data-cta]') : null;
    if (!el) return;
    try {
      if (typeof window.va === 'function') {
        window.va('event', { name: 'cta_click', data: { cta: el.dataset.cta } });
      }
    } catch (_) {}
  }, true);
})();
