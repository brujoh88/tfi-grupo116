# Listado de módulos

Los módulos funcionales del sistema: qué hace cada uno para el salón o para la
clienta, su prioridad y en qué entrega se construye. Cómo se traducen en módulos
de la API y cómo dependen entre sí está en [`arquitectura.md`](arquitectura.md).

Salen del alcance del MVP (punto 2.3 de la [propuesta](propuesta.md)). Las horas,
del punto 4.3.

## Prioridad

- **Esencial**: sin esto no hay sistema de turnos. No se recorta.
- **Alta**: se construye entera; si el tiempo no alcanza, se achica según el plan
  de contingencia (punto 4.5 de la propuesta), pero no desaparece.
- **Media**: necesaria para la entrega, pero con un sustituto si hace falta.

## Los módulos

| # | Módulo | Qué hace | Prioridad | Entrega | Horas | Estado |
|---|---|---|---|---|---:|---|
| 1 | **Catálogo** | Los servicios del salón con su precio y su duración, los extras que se le pueden sumar a cada uno y los retiros | Esencial | 2.ª | 10 | Hecho |
| 2 | **Armado del turno** | La clienta elige servicio, extras y retiro; el sistema calcula cuánto sale y cuánto dura | Esencial | 2.ª | 12 | Hecho |
| 3 | **Grilla y excepciones** | Qué lugar del salón hace qué servicios, qué días y a qué horas, más los horarios que la dueña abre o cierra un día puntual | Esencial | 2.ª | 7 | Hecho |
| 4 | **Disponibilidad** | En qué horarios entra completo el turno que armó la clienta, según la grilla del día y los turnos ya tomados. Es el corazón del sistema | Esencial | 3.ª | 16 | Previsto |
| 5 | **Reserva** | La clienta toma un horario identificándose con su teléfono, sin registro. Un horario es de un solo turno, garantizado por la base de datos | Esencial | 3.ª | 9 | Esquema hecho |
| 6 | **Pantallas de la clienta** | Cuatro pantallas para el celular: armar el turno, elegir día y hora, confirmar, y el comprobante | Alta | 3.ª | 20 | Previsto |
| 7 | **Panel del salón** | La dueña ve su día y abre o cierra horarios puntuales | Alta | 3.ª | 8 | Previsto |
| 8 | **Clave de acceso al panel** | Protege el panel con una clave única del salón, sin usuarios ni roles | Media | 3.ª | 3 | Previsto |
| 9 | **Despliegue en la nube** | La API, las pantallas y la base funcionando online | Esencial | 3.ª | 8 | Previsto |

**Lo que se recorta primero si falta tiempo**, en este orden (punto 4.5):

1. Los extras cosméticos del módulo 2: quedan solo los retiros, que cambian la
   duración del turno.
2. El comprobante del módulo 6 pasa a ser un aviso en la pantalla de
   confirmación.
3. El panel (módulo 7) deja de cerrar horarios y solo los abre. Abrir horarios
   fuera de la grilla es el diferenciador del proyecto, y no se recorta.

## Lo que no es un módulo del MVP

Declarado en el punto 2.3 de la propuesta, con su porqué: el cobro de la seña con
Mercado Pago, la retención temporal del horario, los avisos por WhatsApp, la ficha
e historial de la clienta, la fidelización, el alta de otros salones, usuarios y
roles en el panel, la grilla por temporada, y mover turnos, asistencia y
facturación desde el panel.
