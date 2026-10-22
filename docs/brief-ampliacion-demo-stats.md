# Brief — Ampliación de la sección `demo-stats` (demo)

## Contexto
Repo: `D:\Proyectos\Procciones\agenda-landing` — landing estática (HTML + CSS + JS vanilla, sin build).
Último run de OpenCode implementó la sección `#giros` (selector por industria). Ahora toca ampliar la sección `demo-stats`, que está dentro de `#demo`.

## Estado actual
`demo-stats` tiene 4 stats fijos, estáticos, hardcodeados en HTML:

| value | label |
|-------|-------|
| 24/7  | Atención sin horarios |
| 3     | Mensajes para reservar |
| 2     | Canales: WhatsApp y web |
| 0     | Registros para probar la demo |

La clase `.stat` ya tiene CSS (`.stat`, `.stat-value`, `.stat-label`, responsive, `:hover`, `pop` animation en `.stat-value.counted`).

## Lo que se pide
**Ampliar `demo-stats` de 4 a 8 stats**, manteniendo el mismo diseño y los mismos tokens de color. Los 4 nuevos deben ser:

| value | label | qué mide |
|-------|-------|----------|
| <3s   | Tiempo medio por reserva | latencia del flujo |
| 100%  | Confirmación automática | sin intervención manual |
| 2     | Canales: WhatsApp y web | mismo que el actual, pero se duplica como "multicanal" |
| 0     | Registros para probar la demo | mismo que el actual |

Ojo: **no inventes métricas**. El brief de la landing prohíbe porcentajes, números de clientes o cifras de AgendaPro. Los 4 nuevos deben ser igual de verificables que los 4 antiguos: son propiedades del producto, no resultados prometidos.

## Criterio de aceptación
- 8 `.stat` dentro de `.demo-stats`, responsive (4 por fila en desktop, 2 en ≤1100px, 1 en ≤480px — usar los breakpoints ya existentes)
- Los 4 nuevos con la misma estructura HTML que los 4 viejos (`.stat` > `.stat-value` + `.stat-label`)
- Sin CSS nuevo que rompa los selectores existentes de `.stat`/`.stat-value`/`.stat-label`
- Sin IDs duplicados, sin `h1` adicional, sin dependencias nuevas
- Sin tocar `js/demo-chat.js`, `js/widget.js` ni el flujo de la agenda
- Sin revertir los cambios sin commitear de la última pasada (`css/styles.css`, `index.html`, `js/demo-chat.js`, `js/main.js`)

## Reglas del repo (obligatorias)
1. **No instalar dependencias.** Nada de frameworks, ni CDN nuevo, ni npm.
2. **No revertir trabajo existente.** Hay cambios sin commitear en `css/styles.css`, `index.html`, `js/demo-chat.js` y `js/main.js`. No hagas `git checkout`, `git restore` ni `git stash`.
3. **No romper ningún selector existente.** Se usan desde JS: `#chat-open`, `#appointment-widget`, `#agenda-grid`, `#agenda-slots`, `#agenda-tab-*`, `#nav-menu`, `.nav-toggle`, `#year`, etc. La página debe seguir funcionando igual.
4. **Usar el sistema de diseño existente** en `css/styles.css` (`:root` tiene todos los tokens). Usa `--action`, `--action-hover`, `--bg-lilac`, `--bg-soft`, `--ink`, `--ink-body`, `--ink-muted`, `--line`, `--line-strong`, `--lavender`, `--navy`, `--accent-*`. **No inventes colores nuevos.**
5. Un solo `h1` en la página.

## Entrega esperada
Archivos:
- `index.html` (solo la sección `demo-stats`)
- `css/styles.css` (solo los estilos de `.demo-stats` y responsive si hace falta)

## Verificación antes de reportar (obligatoria)
1. Levanta un servidor local (`python -m http.server 8080` en el repo) y abre `http://localhost:8080`.
2. Confirma con tus propios ojos/código que: los 8 stats se ven, son responsive (4/2/1 por fila), y no hay errores en la consola.
3. Confirma que el chat de demo, el widget de agenda, el menú móvil y el scroll siguen funcionando.
4. Reporta: archivos cambiados, qué verificaste y cómo, y cualquier cosa que dejaste pendiente.