# ADR-005: El turno armado se calcula, no se guarda

- **Estado**: Aceptado
- **Fecha**: 2026-09-09
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El punto 2.3 de la propuesta define el turno como servicio base + extras +
retiro, con el precio y la duración saliendo de la suma. Al construir
`TurnosModule` aparece la pregunta: cuando la clienta arma su turno y todavía no
eligió horario, **¿eso se guarda en algún lado?**

Guardarlo sería lo natural si el turno fuera una entidad del negocio. Pero entre
que se arma y que se reserva puede no pasar nada: la clienta ve el precio, le
parece caro y cierra la pantalla.

## Decisión

**`TurnosModule` no es dueño de ninguna tabla.** Recibe los ids de lo elegido, le
pide el catálogo a `CatalogoService`, valida la combinación y devuelve precio y
duración. No importa `PrismaModule`.

La composición se persiste **recién al reservar**, con los precios congelados de
ese momento, y esa tabla pertenece a `ReservasModule`.

## Consecuencias

**A favor**

- No se acumulan borradores que nadie confirmó, ni hace falta decidir quién los
  limpia ni cuándo.
- Un módulo menos tocando la base: `TurnosModule` se prueba sin Postgres, con un
  doble del catálogo, y esa prueba no esconde nada porque no hay consulta que
  verificar.
- El esquema de la base no crece con tablas cuyo contenido es descartable.

**En contra — asumido a conciencia**

- La composición viaja dos veces: al armar y al confirmar. La pantalla manda los
  ids otra vez.
- `ReservasModule` **tiene que recalcular** el precio en vez de recibirlo, porque
  lo que llega del navegador no es confiable. Es la regla de que las pantallas
  preguntan y no recalculan, aplicada del lado del servidor.

## La alternativa considerada

**Guardar el turno como borrador**: una fila `Turno` con sus ítems creada al
armar, que la reserva referencia por id. Sumaba una tabla al entregable de
esquema del 27/09 y evitaba reenviar la composición.

Se descartó porque el problema que resuelve —reenviar tres ids— es más barato que
el que crea: `TurnosModule` pasaría a depender de Prisma, y habría que definir
cuándo caduca un borrador y quién lo borra. Un turno que nadie reservó no es un
hecho del negocio: es una consulta que ya se contestó.

## Qué queda abierto

- **Cuándo se congela el precio.** Hoy la respuesta es "al reservar". Si el salón
  cambia un precio entre que la clienta arma y confirma, el total que ve al
  confirmar puede no ser el que vio al armar. Se decide al construir
  `ReservasModule`.
