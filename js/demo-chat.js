/* ============================================================
   AgendaAI — Demo chat interactivo (modo mock, sin backend)
   Intercepta las llamadas del widget AppointmentWidget y simula
   al asistente de citas completamente en el navegador.
   Flujo: saludo → día → hora → confirmación → reserva.
   ============================================================ */
(function () {
  'use strict';

  if (window.__agendaDemoChat) return;
  window.__agendaDemoChat = true;

  var MOCK_BASE = '/mock-api';
  var sessions = Object.create(null);

  /* ---------------- Utilidades ---------------- */

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { var x = startOfDay(d); x.setDate(x.getDate() + n); return x; }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function uid() { return 'demo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function json(data, status) {
    return new Response(JSON.stringify(data), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function toMin(t) { var p = t.split(':'); return (+p[0]) * 60 + (+p[1]); }

  var DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function fmtLong(d) { return DAYS[d.getDay()] + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()]; }
  function fmtCap(d) {
    var s = fmtLong(d);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  var MSG = {
    welcome: '¡Hola! 👋 Soy el asistente de AgendaAI.\nPuedo reservarte una cita en segundos. ¿Agendamos una o prefieres ver los horarios disponibles?',
    askDate: '¡Claro! Te agendo la cita en un momento.\n¿Qué día te viene bien? Por ejemplo: «mañana», «martes» o «15 de octubre».',
    askDateShort: 'Necesito un día para buscar huecos 😄. Escríbelo así: «mañana», «el jueves» o «24/10».',
    askTime: function (free) { return '¿A qué hora? Huecos libres:\n• ' + free.join('\n• '); },
    schedule: 'Nuestro horario es de 9:00 a 18:30, y los sábados de 10:00 a 14:00 ⏰\n¿Qué hora dentro de ese horario te va bien?',
    past: function (d) { return 'Esa fecha ya pasó 😅. Elige un día a partir de ' + fmtCap(startOfDay(new Date())) + '.'; },
    confirm: function (d, t) { return 'Perfecto: ' + fmtCap(d) + ' a las ' + t + '.\n¿Confirmo la cita?'; },
    confirmAgain: function (d, t) { return '¿Confirmo la cita del ' + fmtCap(d) + ' a las ' + t + '?\nResponde «sí» o «no».'; },
    booked: function (d, t) {
      return '✅ ¡Cita confirmada!\n📅 ' + fmtCap(d) + ' — ' + t + '\nTe enviaré un recordatorio 24h antes (esto es una demo).\n¿Te ayudo con algo más?';
    },
    cancelled: function (d, t) {
      return 'He cancelado tu cita del ' + fmtCap(d) + ' a las ' + t + '.\nEl hueco vuelve a estar libre. ¿Te reservo otra?';
    },
    noBooking: 'No veo ninguna cita reservada en esta conversación.\n¿Quieres que reservemos una nueva o consulto los horarios?',
    discard: 'De acuerdo, descarto lo que estábamos preparando.\n¿Empezamos de nuevo o prefiero enseñarte la disponibilidad?',
    full: function (d, alts) {
      return fmtCap(d) + ' está completo 😅.\n' +
        (alts.length
          ? 'Tengo huecos el ' + alts.join(' y el ') + '.\n¿Te reservo alguno de esos días?'
          : 'Esta semana no queda nada libre. ¿La semana que viene?');
    },
    taken: function (t, d, near) {
      return 'A las ' + t + ' no queda libre el ' + fmtCap(d) + '.\nLo más cercano disponible: ' + near + '.\n¿Te va bien ese horario?';
    },
    help: 'Puedo ayudarte a:\n• Reservar una cita («quiero una cita el jueves a las 10»)\n• Ver huecos disponibles\n• Cancelar o reprogramar\n\n¿Por dónde empezamos?',
    thanks: '¡A ti! Aquí sigo por si quieres reservar otra cita 😊'
  };

  /* ---------------- Fechas en lenguaje natural ---------------- */

  var MONTH_RE = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre';

  function monthIndex(name) {
    var clean = name.toLowerCase().replace(/[^a-záéíóúñ]/g, '');
    var aliases = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, set: 8, oct: 9, nov: 10, dic: 11 };
    for (var i = 0; i < MONTHS.length; i++) {
      if (clean === MONTHS[i] || clean === MONTHS[i].slice(0, 3)) return i;
    }
    return aliases[clean] !== undefined ? aliases[clean] : -1;
  }

  function fixYear(d, now) {
    if (d < now) {
      var bumped = new Date(d);
      bumped.setFullYear(bumped.getFullYear() + 1);
      return bumped < now ? null : bumped;
    }
    return d;
  }

  function parseDate(msg, now) {
    now = startOfDay(now);
    var m;

    if (/\bhoy\b/i.test(msg)) return now;
    if (/\bpasado\s*ma[ñn]ana\b/i.test(msg)) return addDays(now, 2);
    if (/\bma[ñn]ana\b/i.test(msg)) return addDays(now, 1);

    // ISO: 2026-10-15
    m = msg.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (m) {
      var dIso = new Date(+m[1], +m[2] - 1, +m[3]);
      if (dIso.getMonth() === +m[2] - 1 && dIso.getDate() === +m[3]) return dIso;
    }

    // 15/10 o 15/10/2026
    m = msg.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (m) {
      var y = m[3] ? (String(m[3]).length === 2 ? 2000 + (+m[3]) : +m[3]) : now.getFullYear();
      var d = new Date(y, +m[2] - 1, +m[1]);
      if (d.getMonth() === +m[2] - 1 && d.getDate() === +m[1]) {
        return m[3] ? d : fixYear(d, now);
      }
    }

    // 15 de octubre
    m = msg.match(/\b(\d{1,2})\s*(?:de|del)\s+([a-záéíóúñ]+)/i);
    if (m) {
      var mi = monthIndex(m[2]);
      if (mi >= 0) {
        var d2 = new Date(now.getFullYear(), mi, +m[1]);
        if (d2.getMonth() === mi && d2.getDate() === +m[1]) return fixYear(d2, now);
      }
    }

    // Días de la semana → siguiente ocurrencia
    var weekdays = [
      ['domingo', 0], ['lunes', 1], ['martes', 2], ['mi[eé]rcoles', 3],
      ['jueves', 4], ['viernes', 5], ['s[aá]bado', 6]
    ];
    for (var i = 0; i < weekdays.length; i++) {
      if (new RegExp('\\b' + weekdays[i][0] + '\\b', 'i').test(msg)) {
        var diff = (weekdays[i][1] - now.getDay() + 7) % 7;
        if (diff === 0) diff = 7; // «martes» nunca es hoy: siempre el próximo
        return addDays(now, diff);
      }
    }

    // Semana que viene / próxima semana → lunes
    if (/\bsemana\s+que\s+viene\b|\bpr[oó]xima\s+semana\b/i.test(msg)) {
      var diffM = (1 - now.getDay() + 7) % 7;
      if (diffM === 0) diffM = 7;
      return addDays(now, diffM);
    }

    // Fin de semana → próximo sábado
    if (/\bfin\s+de\s+semana\b/i.test(msg)) {
      var diffS = (6 - now.getDay() + 7) % 7;
      if (diffS === 0) diffS = 7;
      return addDays(now, diffS);
    }

    return null;
  }

  /* ---------------- Horas ---------------- */

  function parseTime(msg, allowBare) {
    var m, h = null, min = 0, meridiem = null;

    // Con dos puntos / punto / h → 10:30, 10.30, 10h30
    m = msg.match(/\b(\d{1,2})[:.h](\d{2})\b/);
    if (m) { h = +m[1]; min = +m[2]; }
    if (h === null && (m = msg.match(/\b(\d{1,2})\s*(am|pm|a\.?\s?m\.?|p\.?\s?m\.?)\b/i))) {
      h = +m[1];
      meridiem = /p/i.test(m[2]) ? 'pm' : 'am';
    }
    if (h === null && (m = msg.match(/\b(?:a|por)\s+las?\s+(\d{1,2})\b/i))) h = +m[1];
    if (h === null && (m = msg.match(/\b(\d{1,2})\s*horas?\b/i))) h = +m[1];
    if (h === null && allowBare && (m = msg.match(/^\s*(\d{1,2})(?:[:.h](\d{2}))?\s*(am|pm)?\s*$/i))) {
      h = +m[1];
      if (m[2]) min = +m[2];
      if (m[3]) meridiem = /p/i.test(m[3]) ? 'pm' : 'am';
    }
    if (h === null) return null;

    if (meridiem === 'pm' && h < 12) h += 12;
    if (meridiem === 'am' && h === 12) h = 0;
    if (!meridiem && h >= 1 && h <= 7) h += 12; // «a las 5» = 17:00

    if (h > 23 || min > 59) return null;

    // Redondear a media hora más cercana
    var total = Math.round((h * 60 + min) / 30) * 30;
    if (total < 8 * 60 || total > 19 * 60) return { outOfRange: true };
    total = Math.max(9 * 60, Math.min(18 * 60 + 30, total));

    return { h: Math.floor(total / 60), m: total % 60 };
  }

  function timeStr(t) { return pad(t.h) + ':' + pad(t.m); }

  /* ---------------- Disponibilidad (determinística) ---------------- */

  function slotsFor(d) {
    var day = d.getDay();
    if (day === 0) return []; // domingo cerrado

    var from = day === 6 ? 10 : 9;
    var to = day === 6 ? 14 : 18;
    var today = startOfDay(new Date());
    var nowStr = pad(new Date().getHours()) + ':' + pad(new Date().getMinutes());
    var isPast = d < today;
    var isToday = d.getTime() === today.getTime();
    var out = [];

    for (var hh = from; hh <= to; hh++) {
      var mins = (day === 6 && hh === to) ? [0] : [0, 30];
      for (var k = 0; k < mins.length; k++) {
        var t = pad(hh) + ':' + pad(mins[k]);
        var booked = isPast || (isToday && t <= nowStr) || (hash(dateKey(d) + t) % 100) < 30;
        out.push({ time: t, booked: booked });
      }
    }

    // Asegurar al menos 3 huecos libres en días futuros (para la demo)
    if (d > today) {
      var free = out.filter(function (s) { return !s.booked; });
      for (var i = 0; i < out.length && free.length < 3; i++) {
        if (out[i].booked) { out[i].booked = false; free.push(out[i]); }
      }
    }
    return out;
  }

  function freeTimes(d) {
    return slotsFor(d).filter(function (s) { return !s.booked; }).map(function (s) { return s.time; });
  }

  function isFree(d, t) {
    var slot = slotsFor(d).filter(function (s) { return s.time === t; })[0];
    return Boolean(slot && !slot.booked);
  }

  function nearestFree(d, t) {
    var free = freeTimes(d);
    if (!free.length) return null;
    var target = toMin(t), best = null, bestDiff = Infinity;
    free.forEach(function (x) {
      var diff = Math.abs(toMin(x) - target);
      if (diff < bestDiff) { bestDiff = diff; best = x; }
    });
    return best;
  }

  function nextDaysWithSlots(from, count) {
    var res = [];
    for (var i = 1; i <= 9 && res.length < count; i++) {
      var d = addDays(from, i);
      if (freeTimes(d).length) res.push(fmtLong(d));
    }
    return res;
  }

  function availabilityMsg(now) {
    var lines = [], added = 0;
    for (var i = 0; i < 7 && added < 3; i++) {
      var d = addDays(now, i);
      var free = freeTimes(d);
      if (free.length) {
        lines.push('• ' + fmtCap(d) + ': ' + free.slice(0, 3).join(', '));
        added++;
      }
    }
    if (!added) {
      return { action: 'unavailable', message: 'La agenda está completa esta semana 😅. Vuelve a intentarlo el lunes.' };
    }
    return {
      action: 'available',
      message: 'Así está la disponibilidad:\n' + lines.join('\n') + '\n\nDime un día y una hora y te la reservo 😊'
    };
  }

  /* ---------------- Máquina de estados de la conversación ---------------- */

  function beginBooking(sess, d, requestedTime, now) {
    var today = startOfDay(now);
    if (d < today) return { action: 'request_info', message: MSG.past(d) };

    sess.date = d;
    sess.time = null;
    sess.pendingTime = null;

    var free = freeTimes(d);

    // El usuario dio día y hora de una vez («jueves a las 10»)
    if (requestedTime && free.indexOf(requestedTime) !== -1) {
      sess.time = requestedTime;
      sess.step = 'awaiting_confirm';
      return { action: 'request_info', message: MSG.confirm(d, requestedTime) };
    }

    if (!free.length) {
      sess.step = 'awaiting_date';
      var alts = nextDaysWithSlots(today, 2);
      return { action: 'unavailable', message: MSG.full(d, alts) };
    }

    sess.step = 'awaiting_time';
    var show = free.slice(0, 5);
    var extra = free.length > 5 ? '\n…y ' + (free.length - 5) + ' huecos más' : '';
    return {
      action: 'request_info',
      message: 'Tengo huecos el ' + fmtCap(d) + ':\n• ' + show.join('\n• ') + extra + '\n\n¿A qué hora te va mejor?'
    };
  }

  function pickTime(sess, d, t) {
    if (isFree(d, t)) {
      sess.time = t;
      sess.pendingTime = null;
      sess.step = 'awaiting_confirm';
      return { action: 'request_info', message: MSG.confirm(d, t) };
    }
    var near = nearestFree(d, t);
    if (!near) return beginBooking(sess, d, null, new Date());
    sess.pendingTime = near;
    sess.step = 'awaiting_time';
    return { action: 'unavailable', message: MSG.taken(t, d, near) };
  }

  function doBook(sess, now) {
    var d = sess.date, t = sess.time;
    sess.booking = { dateObj: d, time: t };
    sess.step = 'done';
    return {
      action: 'booked',
      message: MSG.booked(d, t),
      data: {
        title: 'Cita con AgendaAI (demo)',
        date: dateKey(d),
        time: t,
        start: dateKey(d) + 'T' + t + ':00',
        calendar: 'Google Calendar',
        demo: true
      }
    };
  }

  function respond(sess, raw) {
    var msg = String(raw || '').trim();
    var low = msg.toLowerCase();
    var now = new Date();

    var isCancel = /\b(cancel\w*|anul\w*|olvid\w*|descart\w*)\b/i.test(low);
    // Nota: se usa (?![a-záéíóúñ]) en vez de \b porque \b falla tras vocales acentuadas («sí», «día»)
    var isModify = /\b(reprogram\w*|modific\w*|cambi\w*|mover|otro\s+d[ií]a|otra\s+hora)(?![a-záéíóúñ])/i.test(low);
    var isAvail = /\b(dispon\w*|horario\w*|hueco\w*|libres?|agenda\w*|consult\w*|ver\b[^.]*cita)(?![a-záéíóúñ])/i.test(low);
    var isBook = /\b(agend\w*|reserv\w*|cita|turno|appointment|book)(?![a-záéíóúñ])/i.test(low);
    var isHello = /\b(hola|buenas|buenos\s+d[ií]as|buenas\s+tarde|buenas\s+noches|hey|qu[eé]\s+tal)(?![a-záéíóúñ])/i.test(low);
    var isThanks = /\b(gracias|grax|thx)(?![a-záéíóúñ])/i.test(low);
    var isYes = /^(s[ií]|si|confirmo|confirmar|vale|ok|de\s+acuerdo|dale|claro|yes|perfecto)(?![a-záéíóúñ])/i.test(low);
    var isNo = /^(no|nada|luego|despu[eé]s|mejor\s+no|todav[ií]a\s+no)(?![a-záéíóúñ])/i.test(low);

    // Cancelar: se atiende en cualquier punto de la conversación
    if (isCancel) {
      if (sess.booking) {
        var b = sess.booking;
        sess.booking = null;
        sess.step = 'start';
        sess.date = sess.time = sess.pendingTime = null;
        return { action: 'cancelled', message: MSG.cancelled(b.dateObj, b.time) };
      }
      if (sess.step !== 'start') {
        sess.step = 'start';
        sess.date = sess.time = sess.pendingTime = null;
        return { action: 'request_info', message: MSG.discard };
      }
      return { action: 'request_info', message: MSG.noBooking };
    }

    var D = parseDate(low, now);
    var T = parseTime(low, sess.step === 'awaiting_time');

    /* ---- Estado inicial ---- */
    if (sess.step === 'start') {
      // Reservar tiene prioridad sobre saludos: «hola, quiero una cita» entra al flujo
      if (isBook || D) {
        if (D) return beginBooking(sess, D, T ? timeStr(T) : null, now);
        sess.step = 'awaiting_date';
        return { action: 'request_info', message: MSG.askDate };
      }
      if (isHello) return { action: 'greeting', message: MSG.welcome };
      if (isThanks) return { action: 'greeting', message: MSG.thanks };
      if (isModify && !sess.booking) return availabilityMsg(now);
      if (isAvail) return availabilityMsg(now);
      if (isYes) {
        sess.step = 'awaiting_date';
        return { action: 'request_info', message: MSG.askDate };
      }
      return { action: 'request_info', message: MSG.help };
    }

    /* ---- Esperando el día ---- */
    if (sess.step === 'awaiting_date') {
      if (D) return beginBooking(sess, D, T ? timeStr(T) : null, now);
      if (isAvail) return availabilityMsg(now);
      if (isHello) return { action: 'greeting', message: MSG.welcome };
      return { action: 'request_info', message: MSG.askDateShort };
    }

    /* ---- Esperando la hora ---- */
    if (sess.step === 'awaiting_time') {
      if (D && dateKey(D) !== dateKey(sess.date)) return beginBooking(sess, D, null, now);

      if (isYes && sess.pendingTime) return pickTime(sess, sess.date, sess.pendingTime);
      if (isNo) {
        sess.pendingTime = null;
        sess.step = 'awaiting_date';
        return { action: 'request_info', message: MSG.askDate };
      }

      if (!T) {
        var free = freeTimes(sess.date);
        if (!free.length) return beginBooking(sess, sess.date, null, now);
        return { action: 'request_info', message: MSG.askTime(free) };
      }
      if (T.outOfRange) return { action: 'request_info', message: MSG.schedule };
      return pickTime(sess, sess.date, timeStr(T));
    }

    /* ---- Esperando confirmación ---- */
    if (sess.step === 'awaiting_confirm') {
      if (isYes) return doBook(sess, now);
      if (isNo) {
        sess.time = null;
        sess.pendingTime = null;
        sess.step = 'awaiting_time';
        var freeNo = freeTimes(sess.date);
        return { action: 'request_info', message: MSG.askTime(freeNo) };
      }
      if (T && !T.outOfRange) return pickTime(sess, sess.date, timeStr(T));
      if (D && dateKey(D) !== dateKey(sess.date)) return beginBooking(sess, D, null, now);
      return { action: 'request_info', message: MSG.confirmAgain(sess.date, sess.time) };
    }

    /* ---- Reserva hecha ---- */
    if (sess.step === 'done') {
      if (isBook || D) {
        if (D) return beginBooking(sess, D, T ? timeStr(T) : null, now);
        sess.step = 'awaiting_date';
        return { action: 'request_info', message: MSG.askDate };
      }
      if (isAvail) return availabilityMsg(now);
      if (isThanks) return { action: 'greeting', message: MSG.thanks };
      if (isModify) {
        sess.step = 'awaiting_date';
        return { action: 'request_info', message: '¿La reprogramamos? Dime el nuevo día y hora.' };
      }
      if (isYes) {
        sess.step = 'awaiting_date';
        return { action: 'request_info', message: MSG.askDate };
      }
      return { action: 'request_info', message: MSG.help };
    }

    sess.step = 'start';
    return { action: 'request_info', message: MSG.help };
  }

  function getSession(id) {
    if (id && sessions[id]) return sessions[id];
    var fresh = { id: uid(), step: 'start', date: null, time: null, pendingTime: null, booking: null };
    sessions[fresh.id] = fresh;
    return fresh;
  }

  /* ---------------- Capa mock sobre fetch ---------------- */

  function handleMock(input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var path = url.slice(MOCK_BASE.length).replace(/\?.*$/, '');
    var method = ((init && init.method) || 'GET').toUpperCase();
    var body = null;
    try { body = init && init.body ? JSON.parse(init.body) : null; } catch (e) { body = null; }

    if (path === '/session' && method === 'POST') {
      return delay(350).then(function () {
        var sess = getSession(body && body.session_id);
        return json({ session_id: sess.id, welcome_message: MSG.welcome });
      });
    }

    if (path === '/chat' && method === 'POST') {
      return delay(500 + Math.random() * 450).then(function () {
        var sess = getSession(body && body.session_id);
        var resp = respond(sess, body && body.message);
        return json({
          session_id: sess.id,
          message: resp.message,
          action: resp.action || 'request_info',
          data: resp.data || null
        });
      });
    }

    return delay(150).then(function () {
      return json({ detail: 'Endpoint de demo no disponible: ' + path }, 404);
    });
  }

  if (typeof window.fetch === 'function' && !window.__agendaMockFetch) {
    var nativeFetch = window.fetch.bind(window);
    window.__agendaMockFetch = nativeFetch;
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.indexOf(MOCK_BASE) === 0) return handleMock(input, init);
      return nativeFetch(input, init);
    };
  }

  /* ---------------- Detección de backend (bot real o mock) ---------------- */

  // Candidatos al backend "agenda" (python main.py --web-widget).
  // Se puede forzar con <script src="js/demo-chat.js" data-agenda-api="http://...">
  // Fuera de localhost no se sondea nada: en producción el bot vive en Telegram
  // y el widget arranca en modo demo sin esperar 1,5 s a un backend inexistente.
  var API_CANDIDATES = (function () {
    var s = document.querySelector('script[data-agenda-api]');
    var attr = s && s.getAttribute('data-agenda-api');
    if (attr) return [attr.replace(/\/+$/, '')];
    var host = window.location.hostname;
    var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '';
    return isLocal ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : [];
  })();

  function probe(base, timeoutMs) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeoutMs);
    var opts = ctrl ? { signal: ctrl.signal } : undefined;
    return fetch(base + '/health', opts)
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) return null;
        return r.json().then(function (d) {
          return d && d.status === 'healthy' ? base : null;
        });
      })
      .catch(function () { clearTimeout(timer); return null; });
  }

  function detectBackend() {
    return API_CANDIDATES.reduce(function (p, base) {
      return p.then(function (found) { return found ? found : probe(base, 1500); });
    }, Promise.resolve(null));
  }

  /* ---------------- Estado de la interfaz (badge de modo) ---------------- */

  var mode = 'checking';

  function setMode(next, detail) {
    mode = next;
    var el = document.getElementById('chat-mode');
    if (!el) return;
    el.className = 'chat-mode' + (next === 'live' ? ' is-live' : next === 'mock' ? ' is-mock' : '');
    if (next === 'checking') {
      el.textContent = 'Preparando la demo…';
      el.removeAttribute('title');
    } else if (next === 'live') {
      el.textContent = '🟢 En vivo: bot conectado (' + (detail || '') + ')';
      el.title = 'El chat habla con el bot real de AgendaAI.';
    } else {
      el.textContent = '🟡 Demo interactiva — no crea citas reales';
      el.title = 'Simulación del flujo de reservas en tu navegador.';
    }
  }

  /* ---------------- Inicialización del widget flotante ---------------- */

  var instance = null;
  var sessionReady = false;
  var degraded = false;
  var autoOpened = false;
  var userOpened = false;
  var io = null;

  function applyBrandVars() {
    var s = document.documentElement.style;
    s.setProperty('--appt-primary', '#812DF2');
    s.setProperty('--appt-primary-hover', '#6A1FD0');
    s.setProperty('--appt-primary-light', '#EFE1FF');
    s.setProperty('--appt-user-message', '#812DF2');
    s.setProperty('--appt-font-family', "'Poppins',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif");
  }

  function createWidget(apiUrl, assistantName) {
    return window.AppointmentWidget.initWidget({
      container: '#appointment-widget',
      apiUrl: apiUrl,
      autoOpen: false, // burbuja flotante visible desde el inicio; se abre al llegar al demo
      theme: 'light',
      position: 'bottom-right',
      primaryColor: '#812DF2',
      businessName: 'AgendaAI',
      assistantName: assistantName,
      onSessionCreate: function () { sessionReady = true; },
      onBookingComplete: function (data) {
        if (window.console) console.log('[demo-chat] Cita reservada:', data);
      },
      onError: function () {
        // El backend "en vivo" falló antes de crear sesión → degradar a mock
        if (mode === 'live' && !sessionReady && !degraded) degradeToMock();
      }
    });
  }

  function degradeToMock() {
    degraded = true;
    try { instance.destroy(); } catch (e) {}
    sessionReady = false;
    setMode('mock');
    instance = createWidget(MOCK_BASE, 'Asistente de reservas · demo simulado');
    window.AgendaDemoChat = instance;
  }

  function openOnce() {
    if (autoOpened || userOpened || !instance) return;
    // En móvil el panel ocupa toda la pantalla y roba el foco: solo apertura manual.
    if (window.matchMedia && window.matchMedia('(max-width:900px)').matches) return;
    autoOpened = true;
    instance.open();
  }

  function watchCard() {
    var card = document.querySelector('.live-chat-card');
    if (!card || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          openOnce();
        } else if (autoOpened && !userOpened && instance) {
          // No dejar el chat flotante tapando precios, FAQ o el footer.
          instance.close();
          autoOpened = false;
        }
      });
    }, { threshold: 0.3 });
    io.observe(card);
  }

  function initDemoChat() {
    var container = document.getElementById('appointment-widget');
    if (!container || !window.AppointmentWidget) return;

    applyBrandVars();
    setMode('checking');
    watchCard();

    var openBtn = document.getElementById('chat-open');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        userOpened = true;
        if (instance) instance.open();
      });
    }

    detectBackend().then(function (base) {
      if (base) {
        setMode('live', base.replace(/^https?:\/\//, ''));
        instance = createWidget(base, 'Asistente de reservas · en vivo');
      } else {
        setMode('mock');
        instance = createWidget(MOCK_BASE, 'Asistente de reservas · demo simulado');
      }
      window.AgendaDemoChat = instance;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemoChat);
  } else {
    initDemoChat();
  }
})();
