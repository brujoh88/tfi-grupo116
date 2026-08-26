# ADR-003: De qué salón es un pedido lo contesta un solo lugar

- **Estado**: Aceptado
- **Fecha**: 2026-08-25
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El punto 2.3 de la propuesta declara que el alta de otros salones queda fuera del
MVP **pero que el diseño lo contemple desde la base de datos**. Cumpliendo eso,
todas las tablas del catálogo llevan `salonId` desde la primera migración, aunque
en el MVP esa columna valga siempre lo mismo.

Al construir el primer módulo que consulta esas tablas aparece la pregunta que la
columna no resuelve: cuando entra un `GET /catalogo`, **¿de qué salón es?**

Son dos preguntas distintas, y tratarlas como una sola fue el error a evitar:

1. **Que la consulta filtre por salón.** Es barato hoy: un `where`.
2. **De dónde sale ese id cuando existan varios salones.** Depende de cómo llegue
   la clienta —un subdominio, un link, la clave del panel—, y ninguna de esas
   piezas existe todavía.

## Decisión

**Se separan las dos.** La consulta **filtra por salón desde el primer día**. Y
la pregunta *"¿de qué salón es este pedido?"* la contesta **un único lugar**:
`SalonActualService`, un proveedor con un solo método, `id()`.

Hoy ese método devuelve el valor de **`SALON_ID`**, una variable de entorno del
despliegue, validada al arrancar: si falta o no es un entero positivo, la
aplicación **no levanta**. Es el mismo criterio con el que la clave del panel se
resolvió como variable de entorno del servidor.

El día que haya varios salones cambia **qué mira ese método** —el subdominio del
pedido, el link, o quién se autenticó en el panel—. La consulta, el resto de los
módulos y el esquema de la base no se tocan.

## Consecuencias

**A favor**

- La respuesta a *"¿y si hay dos salones?"* deja de ser "hoy no filtra" y pasa a
  ser **"filtra siempre; hoy el id lo fija el despliegue"**.
- Un error de configuración rompe **al desplegar**, no cuando entra la primera
  clienta. Leyendo la variable de entorno en cada módulo, un valor mal escrito
  daría `NaN` y la consulta devolvería una lista vacía en silencio.
- El cambio a varios salones toca **un archivo**, no uno por cada módulo que
  necesite saber de qué salón habla.
- La URL queda limpia: la clienta no ve un identificador interno.

**En contra — asumido a conciencia**

- Dos archivos y una variable de entorno más para algo que hoy devuelve siempre
  el mismo número. Lo que compran no son líneas: es **un lugar donde cambiar de
  opinión**.
- `SALON_ID` hay que declararla también en el despliegue, además de la conexión a
  la base.
- **Esto no construye el multi-salón**; deja el lugar donde entraría.

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|---|---|
| **No filtrar por salón todavía** y dejarlo como límite conocido | Si el `salonId` ya está en las tablas por la misma razón, la consulta también lo puede contemplar hoy. Filtrar es barato; lo que había que postergar era la otra pregunta |
| **El salón en la URL** (`/salones/:id/catalogo`) | Expone un identificador interno que la clienta no tiene por qué conocer, y obliga a la pantalla a arrastrar un parámetro que hoy vale siempre lo mismo |
| **Leer la variable de entorno en cada servicio** | Dos archivos menos y funciona igual hoy. Pierde la validación al arrancar, y el día del cambio hay que tocar cada módulo: basta olvidarse de uno para que siga contestando del salón viejo |
| **Construir el multi-salón por subdominio ahora** | El middleware son unas quince líneas; lo caro es el resto — dominio propio y DNS comodín, CORS con orígenes por salón, y resolución de nombres local para poder desarrollar. Y sobre todo: multi-salón **no es filtrar**, es que ninguna consulta de ningún módulo pueda leer datos de otro salón. Construir la parte visible sin el aislamiento es peor que no tenerla |

## El criterio de fondo

Se paga por adelantado lo **caro de cambiar después**, y se posterga lo **barato**:

| Decisión | Costo de agregarlo más tarde | Cuándo entra |
|---|---|---|
| `salonId` en las tablas | Una migración tocando todas las tablas y todas las consultas | **Ya** |
| De dónde sale ese id | Unas líneas en un solo archivo | Cuando exista el segundo salón |

## Qué queda abierto

- **Cómo se identifica el salón** cuando haya varios. La forma prevista es por
  subdominio, traducido a un identificador contra una columna nueva en `Salon`;
  las otras dos son el link y la clave del panel. Se decide cuando exista el caso.
- **El aislamiento real entre salones**: claves foráneas compuestas que arrastren
  el `salonId`, y que *toda* consulta de *todo* módulo filtre.
- Si el salón se resuelve antes de llegar al servicio, `id()` puede seguir siendo
  síncrono y los llamadores no cambian.
