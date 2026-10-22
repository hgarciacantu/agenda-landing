# Brief — Reducir el aire entre secciones

## Repo
`D:\Proyectos\Proyectos\agenda-landing` — landing estática (HTML + CSS + JS vanilla, sin build).

## Problema medido
A 1440px cada `<section>` tiene **128px de padding arriba y 128px abajo** → 256px de aire entre secciones consecutivas.
El bloque `#cta` tiene valores propios: `96px` arriba y `112px` abajo.

Medición real tomada en el navegador (1440×1000):
`giros 128/128 · features 128/128 · how 128/128 · demo 128/128 · casos 128/128 · pricing 128/128 · faq 128/128 · cta 96/112 · contact 128/128`

## Cambios exactos (no otros)
En `css/styles.css`:

1. Token global (línea ~117):
```css
--section-y:clamp(72px,9vw,128px);
```
→
```css
--section-y:clamp(56px,6vw,88px);
```

2. Breakpoint 768px (dentro de `@media(max-width:768px)`):
```css
section{padding:72px 0}
```
→
```css
section{padding:52px 0}
```

3. Breakpoint 560px (dentro de `@media(max-width:560px)`):
```css
section{padding:64px 0}
```
→
```css
section{padding:44px 0}
```

4. Bloque `.cta` (línea ~1389):
```css
.cta{padding:clamp(72px,8vw,96px) 0 clamp(80px,9vw,112px);background:#fff}
```
→
```css
.cta{padding:clamp(56px,6vw,80px) 0 clamp(56px,7vw,88px);background:#fff}
```

## Reglas del repo (obligatorias)
1. **No instalar dependencias.**
2. **No revertir trabajo existente.** Hay cambios sin commitear en `css/styles.css`, `index.html`, `js/demo-chat.js` y `js/main.js`. No hagas `git checkout`, `git restore` ni `git stash`.
3. **No toques `index.html` ni ningún JS.** Este cambio es solo de CSS y solo de los 4 valores listados arriba.
4. **No cambies** `--section-y` en ningún otro lugar, ni añadas overrides nuevos por sección.
5. **No rompas selectores** ni el sistema de tokens.
6. No toques `.section-header{margin-bottom}` ni paddings internos de tarjetas: solo el ritmo vertical entre secciones.

## Verificación obligatoria antes de reportar
1. Levanta `python -m http.server 8080` en el repo.
2. A 1440px confirma que cada `<section>` mide **~86px de padding arriba y abajo** (el clamp con 6vw a 1440 = 86.4px) y que `#cta` quedó en ~80/~88.
3. Confirma que a 768px da 52px y a 560px da 44px.
4. Confirma que no hay scroll horizontal en 1440, 1024, 768, 480 y 375.
5. Confirma cero errores de consola.
6. Reporta los 4 valores antes/después medidos con `getComputedStyle`, no de memoria.
