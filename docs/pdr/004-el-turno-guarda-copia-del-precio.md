# PDR-004: El turno guarda copia del precio; el catálogo no se versiona

- **Estado**: Aceptado
- **Fecha**: 2026-08-25
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El salón actualiza los precios seguido. Una clienta reserva en octubre un soft
gel a $15.000, y en noviembre la dueña lo sube a $17.000. ¿Cuánto dice el
comprobante de octubre?

Si la reserva consultara el catálogo para mostrar el precio, diría $17.000: un
cambio de precio **reescribiría el pasado**.

## Decisión

**Al reservar, cada ítem del turno se queda con una copia de su precio** de ese
momento: el servicio, cada extra y el retiro. **El catálogo guarda un solo precio
por servicio, el vigente**, sin historia.

## Consecuencias

**A favor**

- El comprobante dice lo que se cobró, cambie lo que cambie el catálogo después.
- Las reservas guardadas dejan leer qué se cobró en cada mes sin una tabla de
  precios con fechas.
- **Es reversible.** Como cada reserva guarda lo suyo, agregar versionado más
  adelante no rompe nada de lo guardado.

**En contra — asumido a conciencia**

- El precio de un servicio en un mes en que nadie lo pidió no se puede
  reconstruir.
- Un mismo precio queda escrito en el catálogo y en cada reserva. No es una
  duplicación de la regla: son dos hechos distintos, lo que vale hoy y lo que se
  cobró aquel día.

## Las alternativas consideradas

**Versionar los precios del catálogo**, guardando desde cuándo rige cada uno.
Permite reconstruir la lista de precios de cualquier fecha. Se descartó porque
**la copia hace falta igual**: aunque haya versiones, el comprobante necesita
saber cuál se aplicó. La pregunta real era si, además de la copia, hacía falta
versionar, y la evolución de precios no está en el alcance del MVP.

## Qué se decidió después

- **El precio se congela al confirmar, contra el que vio la clienta**
  (23/10). La pantalla manda el total que mostró; la API recalcula el armado y,
  si no coincide, no reserva y contesta que el precio cambió. Así nunca se
  guarda un precio distinto del que la clienta confirmó, y el que se guarda lo
  calcula siempre la API. Se descartó guardar el del catálogo sin comparar —la
  clienta se enteraría en el comprobante— y respetar el precio del momento de
  armar, que obligaría a guardar el armado
  ([ADR-005](../adr/005-el-turno-armado-se-calcula.md)).
