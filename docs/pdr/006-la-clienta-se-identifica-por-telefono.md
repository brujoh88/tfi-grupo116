# PDR-006: La clienta se identifica por teléfono, sin registro y sin historial

- **Estado**: Aceptado
- **Fecha**: 2026-09-25
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

La clienta llega desde un link de Instagram, muchas veces desde el celular y
fuera de horario. Pedirle que se registre con usuario y contraseña para un turno
de uñas es la forma más rápida de que vuelva a mandar un mensaje.

El punto 2.3 de la propuesta ya fijó que **se identifica por teléfono, sin
registro**, y deja afuera la ficha e historial de la clienta. Al diseñar las
tablas de la reserva quedó la pregunta de dónde se guardan su nombre y su
teléfono.

## Decisión

**La clienta es una tabla propia, con nombre y teléfono**, y el teléfono es único
dentro del salón. Cada reserva apunta a su clienta.

**El historial no entra**: no se construye ninguna pantalla ni consulta de "mis
turnos". La tabla guarda lo mismo que se guardaría en cada reserva, sin nada más.

## Consecuencias

**A favor**

- Reservar no pide crear nada: nombre y teléfono, y listo.
- La clienta queda escrita una sola vez, no copiada en cada reserva.
- El día que el salón quiera la ficha, la tabla ya está; se suma lo que falte.

**En contra — asumido a conciencia**

- **El teléfono no prueba que quien reserva sea la dueña de ese número.**
  Cualquiera puede reservar a nombre de otro. Sin seña
  ([PDR-001](001-la-sena-queda-fuera-del-mvp.md)), eso es igual que hoy por
  mensaje.
- Una tabla de clientas es el primer paso de la ficha que el 2.3 deja afuera.
  El límite lo pone lo que **no** se construye: nada la consulta como historial.

## Las alternativas consideradas

**Nombre y teléfono adentro de cada reserva**, sin tabla de clientas. Es lo más
fiel al alcance. Se descartó porque la misma clienta quedaría escrita en cada
turno que saca, y los datos de una persona irían en tantos lugares como reservas
tenga.

**Registro con usuario y contraseña.** Lo descarta la propuesta desde el
principio: es la fricción que el proyecto quiere sacar.

## Qué se decidió después

- **El teléfono se normaliza con `libphonenumber-js`, la librería de
  referencia, más una regla propia** (23/10): sacar el 9 que va después del
  +54. Es el prefijo para llamar a un celular desde el exterior, y la librería
  lo conserva en unos formatos y en otros no. Se descartó escribir el parsing
  argentino entero, que habría que probar y defender paso por paso.
- **Si el mismo teléfono llega con otro nombre, gana el último.**
- **Una clienta puede tener turnos que se superponen en mesas distintas**: una
  mamá que reserva para ella y para su hija deja el mismo teléfono. Que dos
  turnos no se pisen en la misma mesa ya lo garantiza la base.
