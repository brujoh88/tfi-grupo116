# ADR-007: "Un horario, un turno" es una restricción de no superposición

- **Estado**: Aceptado
- **Fecha**: 2026-09-25
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

La propuesta sostiene desde el principio un invariante que no puede romperse:
**un horario es de un solo turno**, aunque dos clientas aprieten "reservar" en el
mismo segundo. La sección 3 dice que se defiende "con una restricción de
unicidad en la base, no con una verificación previa en el código".

Eso servía con horarios fijos. Con el turno armado (ADR-005) y la grilla en
franjas (ADR-006), cada turno dura lo que armó la clienta, y la unicidad deja de
alcanzar: en la misma mesa, 10:00–12:15 y 11:00–12:00 **empiezan a horas
distintas y se pisan igual**. Lo que hay que impedir no es el mismo inicio, sino
la superposición.

## Decisión

**La base rechaza dos reservas de la misma mesa, el mismo día, cuyos horarios se
superpongan.** Es una restricción `EXCLUDE` de Postgres sobre la mesa, la fecha y
el rango `[inicio, fin)`, con la extensión `btree_gist`. El rango es cerrado al
principio y abierto al final: un turno que termina a las 11 y otro que empieza a
las 11 no se superponen.

Cuando dos clientas reservan a la vez, la base recibe las escrituras de a una: la
segunda **espera** a que la primera se confirme y ahí rebota. El módulo de
reservas traduce ese rechazo en "ese horario se acaba de ocupar".

Las reservas guardan además a la clienta —una tabla propia, identificada por
teléfono dentro del salón, sin historial—, lo que armó con el **precio de cada
ítem copiado** al momento de reservar, y el día y las horas como la grilla:
fecha sin hora, inicio y fin en minutos desde la medianoche. La duración no se
guarda aparte: es fin menos inicio.

## Consecuencias

**A favor**

- La regla del negocio se escribe **una vez y en la base**. Ningún camino del
  código —ni uno futuro, ni una carga a mano— puede dejar dos turnos encimados.
- Se comprobó con dos transacciones simultáneas: queda una sola reserva.
- Refina la sección 3 de la propuesta sin cambiar su idea: el invariante sigue
  en la base y no en una verificación previa.

**En contra — asumido a conciencia**

- Como los `CHECK` de la grilla, **no se ve en `schema.prisma`**: va a mano en la
  migración, y el esquema lo avisa con un comentario.
- Suma una extensión de Postgres. Neon, donde se despliega, la ofrece.
- No hay estado de "cancelada", porque cancelar no está en el MVP. Cuando entre,
  la restricción tiene que pasar a mirar solo las reservas vigentes.

## Las alternativas consideradas

**Bloques de 15 minutos con unicidad común.** Cada reserva guarda una fila por
bloque que ocupa, y un `UNIQUE` impide que dos tomen el mismo. Es la unicidad de
la propuesta al pie de la letra. Se descartó porque un turno de 2 h 15 son 9
filas, y todo el sistema queda atado a bloques de 15 minutos.

**El código con un candado.** Bloquear la mesa mientras se pregunta si está
libre y se guarda. Funciona, pero el invariante queda en el código: basta un
camino que se olvide del candado para romperlo. Contradice la regla 4 de
`docs/arquitectura.md`.

**Preguntar y después guardar, sin candado.** Es lo primero que se escribe y no
funciona: las dos clientas preguntan a la vez, las dos reciben "libre" y las dos
guardan.

## Qué queda abierto

- **Normalizar el teléfono** para que "11 5555-1234" y "+54 9 11 5555 1234" sean
  la misma clienta. Es del módulo, pero condiciona la unicidad.
- **Qué pasa con las reservas de un horario que la dueña cierra** (ADR-006).
- **Cuándo se congela el precio** (ADR-005): la copia se hace al reservar.
