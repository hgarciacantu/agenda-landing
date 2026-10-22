# Brief — Sección "Giros" (selector por industria) para agenda-landing

## Contexto
Repo: `D:\Proyectos\Proyectos\agenda-landing` — landing estática (HTML + CSS + JS vanilla, sin build).
Referencia visual/funcional: la sección "We help grow your ___" de agendapro.com.

**Objetivo:** reemplazar la franja estática `<section class="logos">` (líneas ~206–214 de `index.html`) por una sección interactiva `#giros` con 5 pestañas y contenido distinto por giro.

## Reglas del repo (obligatorias)
1. **No instalar dependencias.** Nada de frameworks, ni CDN nuevo, ni npm.
2. **No revertir trabajo existente.** Hay cambios sin commitear en `css/styles.css`, `index.html`, `js/demo-chat.js` y `js/main.js`. No hagas `git checkout`, `git restore` ni `git stash`.
3. **No romper ningún selector existente.** Se usan desde JS: `#chat-open`, `#appointment-widget`, `#agenda-grid`, `#agenda-slots`, `#agenda-tab-*`, `#nav-menu`, `.nav-toggle`, `#year`, etc. La página debe seguir funcionando igual.
4. **Usar el sistema de diseño existente** en `css/styles.css` (`:root` tiene todos los tokens). Usa `--action`, `--action-hover`, `--bg-lilac`, `--bg-soft`, `--ink`, `--ink-body`, `--ink-muted`, `--line`, `--line-strong`, `--lavender`, `--navy`, `--accent-*`. **No inventes colores nuevos.**
5. Usa las clases utilitarias y patrones ya presentes (`.container`, `.section-header`, `.section-subtitle`, `.highlight`, `.btn`, `.btn-primary`, radios y sombras existentes).
6. Un solo `h1` en la página: esta sección usa `h2` y `h3`.

## Estructura de la sección

```
<section id="giros" class="giros" aria-labelledby="giros-title">
  header:
    h2  → "Tu negocio no es igual a los demás. Tu agenda tampoco."
    p   → subtítulo de una línea
  .giros-tablist  (role="tablist" aria-label="Giros")
    5 botones role="tab"
  .giros-panels
    5 paneles role="tabpanel"
</section>
```

### Pestañas (los 5 giros)
1. Clínicas y consultorios
2. Salones de belleza
3. Gimnasios y estudios
4. Talleres mecánicos
5. Consultorías y despachos

Cada botón lleva un icono SVG inline (24×24, `stroke="currentColor"`, `aria-hidden="true"`), reutilizando el estilo `.feature-icon` o una variante propia.

### Cada panel debe tener
- `eyebrow`: nombre del giro
- `h3`: beneficio concreto, en segunda persona. Ejemplos de tono (adáptalos, no los copies literal si suenan forzados):
  - Clínica: "Deja de perder pacientes por no alcanzar a contestar"
  - Salón: "Que tu silla no quede vacía por una cita que se olvidó"
  - Gimnasio: "Llena tus clases sin perseguir a nadie por WhatsApp"
  - Taller: "Agenda servicios sin soltar la llave inglesa"
  - Consultoría: "Menos correos para agendar, más horas facturables"
- `p`: 2 líneas máximo, problema → solución
- 3 bullets (`ul`) con casos de uso concretos y realistas del giro (recordatorio 24 h antes, reagendado automático, anticipo para reservar, lista de espera, confirmación por WhatsApp, etc.)
- **Mock visual ligero, solo CSS y HTML** (sin imágenes nuevas): una tarjeta que simule una conversación de WhatsApp con 2–3 burbujas (mensaje del cliente + respuesta del bot + confirmación de cita). Usa los tokens de color. Debe verse bien en móvil.
- CTA de texto: enlace a `#demo` con la etiqueta "Probar con mi negocio" usando `.btn btn-primary`.

### Copy
Español de México, tono directo, sin promesas inventadas: **prohibido inventar porcentajes, número de clientes o métricas**. No afirmes "+82% de ingresos" ni cifras de AgendaPro. Solo describe lo que el producto hace.

## Accesibilidad (no negociable)
- `role="tablist"` en el contenedor, `role="tab"` + `aria-selected` + `aria-controls` en cada botón, `role="tabpanel"` + `aria-labelledby` + `hidden` en los paneles inactivos.
- Navegación con teclado: `←` `→` mueven el foco y activan, `Home`/`End` van a extremos. Patrón roving `tabindex` (solo el tab activo tiene `tabindex="0"`, los demás `-1`).
- El tab activo **no se distingue solo por color**: agrega borde inferior/relleno o peso tipográfico.
- Foco visible en todos los elementos interactivos (`:focus-visible` con outline de 2px y offset).
- Contraste AA mínimo en texto normal.
- Respeta `prefers-reduced-motion`: si animas el cambio de panel, desactívalo ahí.

## Responsive
- Desktop: tablist horizontal, paneles en 2 columnas (copy | mock).
- ≤768px: tablist con scroll horizontal (`overflow-x:auto`, `scrollbar-width:none`, `-webkit-overflow-scrolling:touch`, `scroll-snap`), paneles en una columna, el mock debajo del copy.
- ≤480px: paddings reducidos, tipografía ya definida por el sistema.

## JS
- Archivo nuevo `js/giros.js`, IIFE, sin globals, `'use strict'`.
- Cárgalo con `defer` en `index.html`, antes de `js/main.js`.
- Si el JS falla o está deshabilitado, **se debe ver el primer panel** (no dejar todo oculto): renderiza el estado inicial en el HTML con el primer tab activo y los demás con `hidden`.
- Sincroniza con el hash de la URL si es trivial (`#giros-salon` abre ese giro); no es obligatorio.

## Integración con lo existente
- La sección va **donde estaba `.logos`**, entre el hero y `#features`.
- Agrega el enlace `<a href="#giros" class="nav-link">Giros</a>` en el menú principal, entre "Características" y "Demo". Agrega también "Giros" en el `<nav class="footer-column" aria-label="Producto">`.
- `js/main.js` tiene un `IntersectionObserver` con una lista de selectores que se revelan al hacer scroll; incluye los contenedores nuevos (`.giros-card` o equivalente) en esa lista para que respeten el patrón de animación existente.
- Elimina el CSS de `.logos` solo si ya nada lo usa; si dudas, déjalo.

## Entrega esperada
Archivos:
- `index.html` (sección + script + nav)
- `css/styles.css` (estilos de la sección)
- `js/giros.js` (nuevo)
- `js/main.js` (solo si hay que tocar el observer)

## Verificación antes de reportar (obligatoria)
1. Levanta un servidor local (`python -m http.server 8080` en el repo) y abre `http://localhost:8080`.
2. Confirma con tus propios ojos/código que: las 5 pestañas cambian el panel, las flechas del teclado funcionan, el foco es visible y **no hay errores en la consola**.
3. Confirma que el chat de demo, el widget de agenda, el menú móvil y el scroll siguen funcionando.
4. Reporta: archivos cambiados, qué verificaste y cómo, y cualquier cosa que dejaste pendiente.
