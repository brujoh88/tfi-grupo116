# PDR-002: El turno se arma, no se elige

- **Estado**: Aceptado
- **Fecha**: 2026-08-18
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

En el salón, un turno no es "un servicio". Es un servicio base —soft gel,
esmaltado, kapping— al que la clienta le suma extras —francesita, diseño— y, si
viene con trabajo de otro lado, un retiro. Cada pieza tiene su precio y su
duración.

Hoy esa cuenta la hace quien contesta los mensajes. La pregunta era si el
sistema también la hace, o si la clienta elige un servicio cerrado y listo.

## Decisión

**El turno se arma**: servicio base, más los extras que elija, más el retiro si
corresponde. El precio y la duración salen de la suma, y **los horarios que se le
ofrecen dependen de cuánto dura lo que armó**.

Qué extras admite cada servicio lo dice el catálogo; el retiro es uno solo, o
ninguno.

## Consecuencias

**A favor**

- El sistema sabe cuánto dura de verdad cada turno. Un soft gel solo dura 1 h 30;
  con retiro y francesita, 2 h 15. Si el sistema creyera lo primero, le encajaría
  el turno siguiente encima, y la dueña tendría que corregirlo a mano: le
  devolveríamos el trabajo que le sacamos.
- La clienta ve el precio total antes de reservar, sin preguntar.

**En contra — asumido a conciencia**

- Calcular la disponibilidad deja de ser leer una grilla fija: hay que buscar
  dónde entra un turno de un largo que recién se conoce cuando la clienta
  termina de armarlo. Es lo que obliga a la grilla en franjas
  ([ADR-006](../adr/006-la-grilla-son-lugares-abiertos-por-franjas.md)) y a la
  restricción de no superposición
  ([ADR-007](../adr/007-un-horario-un-turno-sin-superposicion.md)).
- El catálogo tiene que guardar qué extras van con qué servicio, y eso lo carga
  el salón.

## Las alternativas consideradas

**Elegir un servicio simple y listo.** Se descartó porque deja afuera los extras y el retiro, que son justo lo
que cambia la duración.

**Cargar cada combinación como un servicio compuesto** —"soft gel con
francesita", "soft gel con retiro"…—. Funciona con pocas piezas, pero las
combinaciones se multiplican, y cambiar el precio de la francesita obliga a
tocar cada servicio que la incluye.

## Relacionadas

Cómo se calcula sin guardarse:
[ADR-005](../adr/005-el-turno-armado-se-calcula.md). Por qué el catálogo son
tres tablas: [ADR-002](../adr/002-catalogo-en-tres-tablas.md).
