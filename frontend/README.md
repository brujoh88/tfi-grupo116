# Frontend

Las pantallas de la clienta y el panel del salón, en **React con Vite**. Se
construyen en la tercera etapa (punto 4.2 de la [propuesta](../docs/propuesta.md)).

Es una aplicación separada de la API: se comunica con ella solo por HTTP y no
calcula nada del negocio —pregunta—. El porqué está en el
[ADR-001](../docs/adr/001-dos-aplicaciones-separadas.md).

Lo que va a tener, según el [listado de módulos](../docs/modulos.md):

- **Pantallas de la clienta**: armar el turno, elegir día y hora, confirmar, y el
  comprobante. Pensadas para el celular.
- **Panel del salón**: ver el día y abrir o cerrar horarios, detrás de la clave
  del salón.
