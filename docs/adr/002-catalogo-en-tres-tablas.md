# ADR-002: El catálogo son tres tablas separadas, no una con un campo de tipo

- **Estado**: Aceptado
- **Fecha**: 2026-08-25
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

En este sistema el turno **se arma**: es un servicio base, más los extras que la
clienta elija, más el retiro si corresponde. El precio y la duración salen de la
suma, y de esa duración depende qué horarios se le pueden ofrecer. El catálogo es
de donde salen esos números, así que es la primera tabla del esquema y de la que
dependen el armado y la disponibilidad.

Las restricciones con las que se decide:

- **Servicio, extra y retiro se comportan igual** para la única pregunta que el
  sistema les hace: cuánto suman de plata y de minutos.
- **Se diferencian en cómo entran al armado**: el base es uno y obligatorio, los
  extras van de cero a varios, el retiro es cero o uno.
- **Un turno mal armado le devuelve trabajo a la dueña.** Si el sistema acepta una
  combinación que no existe, alguien tiene que corregirla a mano por WhatsApp —
  que es justo lo que el proyecto vino a eliminar.
- **El catálogo no tiene ABM en el MVP**: el panel abre y cierra horarios y nada
  más. Los datos se cargan con un seed.

## Decisión

Cinco tablas:

| Tabla | Qué guarda |
|---|---|
| `Salon` | El salón. En el MVP tiene una fila |
| `Servicio` | Los servicios base, con precio y duración |
| `Extra` | Los extras, con precio y duración. Cada uno una sola vez |
| `Retiro` | Los retiros, con precio y duración |
| `ServicioExtra` | Qué extra se puede sumar a qué servicio: una fila por combinación permitida |

**La razón de fondo: la base de datos impide guardar un turno mal armado.**
`servicioBaseId` apunta a la tabla `Servicio` y no **puede** apuntar a un retiro —
la clave foránea lo hace imposible. Con una sola tabla y un campo de tipo, un
turno con el retiro puesto en el lugar del servicio base sería un estado que la
base acepta, y evitarlo dependería de una validación en código que alguien se
puede olvidar de llamar. Es la primera decisión de diseño del ADR-001 aplicada al
catálogo: el invariante lo garantiza la base, no el código.

Y cuatro decisiones de modelado que quedan cerradas acá:

1. **El precio es `Int` en pesos enteros y la duración `Int` en minutos.** Un
   número de punto flotante acumula error al sumar base + extras + retiro. Un
   decimal habilita centavos que este negocio no usa y obliga a convertir un
   objeto en cada respuesta de la API.
2. **Del catálogo no se borra nada: hay una columna `activo`.** Borrar obliga a
   elegir entre que la base lo impida —porque hay turnos que lo referencian— o que
   el borrado se lleve puestos esos turnos.
3. **El `salonId` está desde la primera tabla**, aunque el alta de otros salones
   quede fuera del MVP. Agregarlo después sería una migración sobre todas las
   tablas y todas las consultas.
4. **La unicidad de nombre es por salón** (`salonId` + `nombre`), no global: el
   límite es del salón, no del sistema.

## Consecuencias

**A favor**

- La base rechaza el turno con el retiro en el lugar del servicio base, y rechaza
  la combinación permitida cargada dos veces.
- El precio de un extra vive en un solo lugar, aunque ese extra sirva para varios
  servicios.
- Sacar algo del catálogo no puede romper los turnos que ya lo usaron.

**En contra — asumido a conciencia**

- **`Turno` va a necesitar tres relaciones en vez de una**: el servicio base, la
  lista de extras y el retiro. La complejidad no se queda en el catálogo.
- **Sumar precio y duración deja de ser una sola consulta.** Se mitiga
  normalizando: el servicio convierte lo elegido en una lista de precio y
  duración, y suma esa lista. La regla de la suma sigue viviendo en un solo lugar.
- **Un cuarto tipo de cosa costaría una tabla nueva.** Se acepta porque no se
  espera: un adicional nuevo —un recargo por uñas largas— es una fila más en
  `Extra`, no un tipo nuevo.
- **El día que un precio del salón tenga centavos, no entra.**

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|---|---|
| **Una sola tabla de catálogo con un campo de tipo** (BASE, EXTRA, RETIRO) | Dejaba la suma en una consulta y hacía barato agregar un tipo nuevo. Se descartó porque permite que un turno guarde un retiro en el lugar del servicio base: el estado inválido pasa a depender de una validación en código |
| **Un `servicioId` adentro de `Extra`** | El precio de un extra no cambia según el servicio, así que obligaba a cargar la francesita una vez por servicio, con el mismo precio escrito en varias filas. Al cambiarlo, se cambia en una |
| **Una lista de ids de servicio adentro de `Extra`** (arreglo) | Expresaba bien la relación, pero **no existe clave foránea sobre los elementos de un arreglo**: la base no puede verificar que cada id exista ni impedir que borrar un servicio deje ids colgados. Es la única forma de referencia que la base no vigila, y contradecía la premisa con la que se eligió el diseño |
| **No modelar la compatibilidad** y aceptar cualquier combinación | Era gratis, pero deja que la clienta arme un turno que no existe. El sistema pierde el argumento con el que se justifica: que la dueña deje de corregir turnos a mano |

## Qué queda abierto

- **Nada impide vincular un servicio de un salón con un extra de otro.** La base
  verifica que ambos existan, no que sean del mismo salón. En el MVP hay un solo
  salón, así que el estado inválido no se puede construir. Se resuelve con claves
  foráneas compuestas que arrastren el `salonId`, junto con el mismo problema en
  `Turno`.
- **Los identificadores son números correlativos, o sea enumerables.** En el
  catálogo no importa —los servicios son públicos—, pero en `Turno` sí: enumerar
  turnos es ver los de otras clientas. Se decide al modelar esa tabla.
- **Cómo se estructuran las carpetas dentro de la API**, que el ADR-001 dejó
  abierto para este momento, sigue sin decidirse: se define al construir
  `CatalogoModule`.
