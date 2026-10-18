# Anexo de Encargo de Tratamiento de Datos Personales

> **BORRADOR para revisión. No publicar sin validar con asesoría legal.**
> Se firma junto con la orden de servicio entre el consultorio y Agenda IA.

**Entre:**
- **[NOMBRE DEL CONSULTORIO / PROFESIONAL]**, RFC [RFC], con domicilio en [DOMICILIO] — en adelante **"el Responsable"**.
- **[RAZÓN SOCIAL]**, RFC [RFC], con domicilio en [DOMICILIO], operador de **Agenda IA** — en adelante **"el Encargado"**.

## 1. Objeto

El Responsable contrata el servicio Agenda IA para gestionar citas de sus pacientes. Para prestarlo, el Encargado tratará datos personales por cuenta del Responsable, en los términos del artículo 3, fracción IX y demás aplicables de la LFPDPPP y su Reglamento.

## 2. Datos objeto del encargo

- Nombre del paciente.
- Teléfono y, en su caso, correo electrónico.
- Fecha, hora y servicio de la cita.
- Contenido de la conversación necesaria para agendar.
- Estatus de la cita (confirmada, cancelada, reprogramada).

**Queda expresamente excluido** el tratamiento de datos personales sensibles. El Encargado tiene configurado el Servicio para **no solicitar** motivo de consulta, diagnóstico, padecimientos, medicamentos ni resultados de estudios. El Responsable se obliga a instruir a su personal y a sus pacientes en el mismo sentido.

## 3. Finalidad e instrucciones

El Encargado tratará los datos **únicamente** para: (i) agendar, confirmar, reprogramar y cancelar citas; (ii) enviar recordatorios; (iii) generar el registro de la cita en el calendario del Responsable; y (iv) atender soporte sobre esas citas.

El Encargado no usará los datos para fines propios, no los cederá a terceros con fines comerciales y no los usará para entrenar modelos de inteligencia artificial.

## 4. Subencargados autorizados

El Responsable autoriza el uso de los siguientes subencargados, necesarios para operar el Servicio:

| Subencargado | Función |
|---|---|
| Meta Platforms (WhatsApp Business API) a través de [PROVEEDOR] | Entrega de mensajes |
| Google LLC | Sincronización de calendario |
| [PROVEEDOR DE MODELOS DE LENGUAJE] | Interpretación del lenguaje del mensaje |
| [PROVEEDOR DE INFRAESTRUCTURA] | Alojamiento del servicio |

El Encargado informará cualquier cambio relevante en esta lista. Algunos subencargados pueden procesar datos **fuera de México**; el Encargado mantiene con ellos las obligaciones de confidencialidad y seguridad equivalentes.

## 5. Medidas de seguridad

El Encargado implementa, como mínimo:

- Control de acceso por credenciales individuales y principio de mínimo privilegio.
- Cifrado en tránsito (HTTPS/TLS).
- Separación lógica de datos por negocio contratante.
- Respaldos periódicos con retención limitada.
- Registro de accesos y bitácoras de operación.
- Borrado o anonimización al término del encargo.

## 6. Derechos de los titulares

Si un paciente ejerce sus derechos ARCO ante el Responsable, este podrá solicitar al Encargado la información o las acciones necesarias. El Encargado responderá en un plazo de **5 días hábiles** y ejecutará las acciones que el Responsable le instruya por escrito.

## 7. Incidentes de seguridad

Ante una vulneración de seguridad que afecte datos personales bajo este encargo, el Encargado notificará al Responsable **sin dilación** y a más tardar dentro de **72 horas** de tener conocimiento, indicando naturaleza del incidente, datos afectados, medidas adoptadas y acciones recomendadas.

## 8. Confidencialidad

El Encargado y su personal guardarán confidencialidad sobre los datos, obligación que subsiste aun después de terminada la relación.

## 9. Devolución y supresión

Al terminar el servicio, el Encargado entregará al Responsable un respaldo de sus citas en formato abierto (CSV o JSON) dentro de **10 días hábiles** y eliminará los datos de sus sistemas en un plazo de **30 días naturales**, salvo aquellos que deba conservar por obligación legal o fiscal.

## 10. Duración

Este anexo está vigente mientras exista la prestación del servicio y se rige por la ley mexicana.

## 11. Responsabilidad

Cada parte responde por el tratamiento que le corresponde. El Responsable responde por la licitud de la obtención de los datos y por contar con el aviso de privacidad frente a sus pacientes. El Encargado responde por el tratamiento que realice fuera de las instrucciones aquí pactadas.

---

**Firmas**

Responsable: ______________________  Fecha: __________

Encargado: _______________________  Fecha: __________
