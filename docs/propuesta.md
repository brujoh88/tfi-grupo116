# Propuesta de proyecto

**Trabajo Final Integrador — Grupo 116**
Gustavo Tiseira y Nicolás Viruel · Tutor: Santiago Fonzo
Repositorio: https://github.com/brujoh88/tfi-grupo116

Sistema de turnos para un salón de estética.

---

## 1. El problema

### Contexto

El salón atiende hasta unas 25 personas por día entre cejas, pestañas y manicuría. Los turnos se dan **a mano, por mensaje**: la clienta escribe por DM de Instagram o por WhatsApp, alguien del salón le contesta qué horarios quedan, y el turno se anota.

La disponibilidad se publica como **una imagen que hay que actualizar a mano**
cada vez que algo cambia. Como la imagen envejece apenas se toma un turno, la
clienta igual pregunta, y el circuito vuelve a empezar.

El problema y el circuito de trabajo fueron relevados con la dueña del salón en
agosto de 2026.

### A quiénes afecta

| Actor | Qué hace hoy | Qué necesita |
|---|---|---|
| **La dueña** | Contesta los mensajes, arma la agenda, mantiene la imagen de horarios y decide cuándo abrir turnos extra | Dejar de contestar para dar turnos, sin perder el control de su agenda |
| **Las manicuras** | Atienden los turnos que les arma la dueña | Ver su día |
| **Las clientas** | Escriben, esperan respuesta, negocian el horario por chat | Ver qué hay libre y reservar, en el momento en que se les ocurre |

### El impacto

La dueña calcula **media hora por día** solamente en contestar mensajes para dar
turnos. A eso se suma mantener la imagen de disponibilidad actualizada.

Los mensajes no llegan en horario comercial: llegan **de madrugada**, pidiendo
turno para la mañana siguiente. Toda respuesta que no sea inmediata es una
clienta esperando, y la respuesta nunca puede ser inmediata porque del otro lado
hay una persona que está trabajando o durmiendo.

> El problema no es "falta una app". El problema es que **dar un turno depende de
> que una persona esté disponible para contestar**, y esa persona es la misma que
> está atendiendo.

### ¿Admite una solución tecnológica?

Sí, y es acotado: el salón ya sabe qué horarios ofrece y bajo qué reglas. Lo que
no tiene es un lugar donde esas reglas se apliquen solas mientras nadie mira.

### Validación del problema

| Pregunta | Respuesta |
|---|---|
| ¿Ocurre ahora o es hipotético? | Ocurre hoy, todos los días |
| ¿Los afectados lo reconocen? | Sí. Es el motivo por el que buscaron una herramienta antes que nosotros |
| ¿Existe una solución parcial? ¿Por qué no alcanza? | **Sí: tuvieron Fresha y lo dejaron.** Por dos motivos concretos: pagaban una mensualidad, y no las dejaba abrir horarios de uñas fuera de la grilla fija — que es justo como la dueña llena los huecos de la agenda |
| ¿Es factible con nuestro tiempo y recursos? | Sí, con el alcance recortado que se define en la sección 2 |
| ¿Existe algo similar en el mercado? | Sí (Fresha, Booksy, AgendaPro). La diferenciación está en la sección 2.4 |

---

## 2. La solución propuesta

### 2.1 Qué hace

Una aplicación web a la que la clienta entra **desde el link de Instagram, sin
instalar ni registrarse nada**. Elige el servicio, arma su turno, ve los horarios
en los que ese turno entra de verdad, y reserva. Del otro lado, la dueña ve su
día y puede abrir o cerrar horarios puntuales desde el celular.

### 2.2 Qué valor agrega

No es la agenda de papel puesta en una pantalla. Concretamente:

- **Reduce un costo**: la media hora diaria de contestar mensajes para dar turnos.
- **Habilita algo hoy imposible**: que una clienta reserve a las tres de la
  mañana y el turno quede tomado, sin que nadie conteste.
- **Elimina una tarea entera**: la imagen de disponibilidad deja de existir,
  porque la disponibilidad se calcula.

### 2.3 Alcance del MVP

**Entra:**

1. **Catálogo** — servicios con su precio y su duración, extras y retiros.
2. **Armado del turno** — el turno es servicio base + extras + retiro; el precio
   y la duración salen de la suma.
3. **Grilla** — qué recurso (camilla, manicura) atiende qué, qué días y a qué
   horas. Es dato editable, no código.
4. **Disponibilidad** — qué horarios quedan libres **según lo que la clienta
   armó**, contando las excepciones del día.
5. **Reserva** — la clienta se identifica por teléfono, sin registro. Un horario
   es de un solo turno, garantizado por la base de datos.
6. **Pantallas de la clienta** — cuatro pantallas, pensadas para el celular:
   armar el turno, elegir día y horario, confirmar, y el comprobante.
7. **Panel del salón** — entrar con la clave del salón, ver el día, abrir o
   cerrar un horario puntual.
8. **Despliegue en la nube** — la aplicación funcionando online.

**No entra** (declarado, no olvidado):

| Queda afuera | Por qué |
|---|---|
| **Cobro de la seña con Mercado Pago** | Resuelve el ausentismo, que es otro problema. Además la cuenta del salón es de un tercero: es la única dependencia externa que podría bloquearnos. Queda como evolución del producto |
| **Retención temporal del horario** | Existe para sostener un pago en curso. Sin cobro no hace falta: la reserva se completa y se confirma en el mismo momento |
| **Avisos automáticos por WhatsApp** | La API oficial se paga por conversación y requiere aprobación de Meta |
| **Ficha e historial de la clienta** | El salón sigue funcionando sin eso |
| **Fidelización** | Hoy se resuelve con tarjetas en mano |
| **Alta de otros salones** | El diseño lo contempla desde la base de datos, pero el módulo no se construye |
| **Usuarios y roles en el panel** | Administra una sola persona. Se resuelve con una clave única del salón |
| **Grilla con vigencia por temporada** | Los cambios estacionales se resuelven con las excepciones del panel |
| **Mover turnos, asistencia y facturación en el panel** | El panel del MVP hace una sola cosa |

### 2.4 Diferenciación

| Competidor | Tipo | Por qué no alcanza |
|---|---|---|
| **Fresha** | Directo | Lo usaron y lo dejaron: mensualidad, y grilla fija que no permite abrir horarios fuera de plantilla |
| **Booksy, AgendaPro** | Directos | Mismo modelo de suscripción mensual, pensados para el salón grande |
| **El DM de Instagram + la imagen de horarios** | Indirecto — y es el que realmente hay que vencer | Es gratis y todos lo saben usar. Pierde solo si reservar por la app es más rápido que escribir un mensaje |

Nuestro diferenciador es lo que hizo fracasar a Fresha en este salón: **la dueña
puede abrir horarios que la grilla no tiene**, el domingo a la noche, desde el
teléfono, cuando ve la mañana vacía.

---

## 3. Stack tecnológico

| Pieza | Elección |
|---|---|
| Backend | **NestJS** con TypeScript |
| Base de datos | **PostgreSQL** con Prisma |
| Frontend | **React** con Vite |
| Control de versiones | GitHub |
| Entorno de desarrollo | Docker Compose |
| Despliegue del frontend | **Vercel** |
| Despliegue del backend | **Railway** |
| Base de datos gestionada | **Neon** |

### Por qué

**NestJS.** Los dos venimos trabajando con estas tecnologías y queremos
profundizar en Nest durante el proyecto: es un objetivo de aprendizaje declarado,
no una elección por moda. Su estructura de módulos ordena el trabajo cuando somos
dos personas sobre el mismo código. No partimos de cero: partimos de un nivel
inicial y profundizamos, que es distinto de aprender una herramienta nueva
mientras corre el plazo.

**PostgreSQL, relacional y no documental.** El dato tiene estructura estable y
las relaciones importan: un turno referencia un servicio, unos extras, un recurso
y una clienta, y el precio y la duración se calculan sumando esas partes. Sobre
todo, hay un invariante que no puede romperse — **un horario es de un solo
turno** — y dos clientas pueden apretar "reservar" en el mismo segundo. Eso se
defiende con una restricción de unicidad en la base, no con una verificación
previa en el código.

**React con Vite, y no Next.** Evaluamos Next, pero como el backend está en Nest
no íbamos a usar su lado servidor: era pagar la parte más compleja del framework
sin aprovecharla. React con Vite hace una sola cosa, es una curva de aprendizaje
menos, y es la tecnología de frontend que vemos en la carrera.

**Web y no aplicación nativa.** La clienta llega de un link de Instagram de
madrugada. No va a instalar nada.

**Vercel, Railway y Neon.** Los tres se configuran desde el repositorio y no nos
obligan a administrar un servidor, que es tiempo que no tenemos. Railway mantiene
el proceso de la API vivo, que es lo que Nest necesita y lo que un hosting
estático no puede dar. Neon ofrece PostgreSQL gestionado en su plan gratuito.

**Docker Compose para desarrollar.** La base de datos corre en un contenedor
local, así el desarrollo no depende de la conexión ni toca la base de producción.

### Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| **Next.js full-stack, una sola aplicación** | Menos infraestructura, pero deja afuera Nest, que es nuestro objetivo de aprendizaje, y no impone una estructura para las reglas de negocio |
| **Base de datos documental (Firebase / MongoDB)** | El modelo es relacional y el invariante de "un horario, un turno" se defiende mucho mejor con una restricción de base |
| **Aplicación móvil nativa** | Nadie instala una app para sacar un turno |
| **Seguir con Fresha** | Es la solución parcial que ya se probó y falló, por los motivos de la sección 1 |
| **Desarrollar directo contra la base en la nube** | Ahorra el armado del entorno, pero ata el desarrollo a tener conexión y arriesga tocar los datos de producción |

### Riesgos de esta elección

- **Dos aplicaciones cuestan más que una**: dos despliegues, CORS y el acceso al
  panel cruzando de una a la otra. Lo asumimos a conciencia, porque la separación
  es parte de lo que queremos aprender y de lo que vamos a defender.
- **React es la tecnología que menos manejamos** de las tres. Se le reserva
  tiempo explícito en el plan y se arranca por las pantallas más simples.

---

## 4. Plan de trabajo

### 4.1 Objetivos y su medición

**Objetivo general.** Que el salón deje de dar turnos a mano: que la clienta
reserve sola desde el celular, y que el salón administre su agenda sin depender
de contestar mensajes.

**Objetivos específicos.** Cada uno declara cómo se verifica y **cuándo**, porque
no todos se pueden dar por cumplidos el mismo día.

**Se verifican en la entrega del 14/11.** Dependen solo de que el sistema esté
construido y desplegado.

1. **Una clienta reserva un turno de punta a punta sin que nadie del salón
   intervenga.**
   *Se verifica con una reserva real hecha fuera del horario de atención, sin
   que nadie del salón conteste nada.*
2. **Ningún turno tomado por la aplicación obliga a reacomodar la agenda a
   mano.**
   *Se verifica sobre el sistema desplegado: tomando en una misma franja todos
   los turnos que la grilla permite, ninguno queda superpuesto con otro ni pasa
   del horario de cierre.*
3. **La dueña abre o cierra un horario puntual desde el celular sin ayuda de
   nadie.**
   *Se le pide que abra un horario y lo hace sin que ninguno de los dos le
   indique cómo.*

**Se miden con el sistema en uso.** Son objetivos de adopción: dependen de que el
salón cambie lo que hace hoy, no de que nosotros terminemos de construir. Se
miden **al mes de que el salón opere el sistema**, que es después de la entrega.

4. **La dueña deja de contestar mensajes para dar un turno.**
   *Ningún turno se acuerda por mensaje: los que llegan se responden con el
   enlace. La línea de base es la media hora diaria que dedica hoy.*
5. **La imagen de disponibilidad deja de publicarse.**
   *No se publica ninguna imagen nueva de disponibilidad en la cuenta del salón.*

La entrega del 14/11 prueba que **el sistema hace lo que tiene que hacer**. Que el
salón cambie su forma de trabajar necesita uso, y se declara así en lugar de dar
por cumplido en noviembre algo que recién puede medirse después.

Estos objetivos dicen **qué tiene que cambiar en el salón**. Qué tiene que hacer
el sistema para que eso pase —los requerimientos y las reglas de negocio— está
declarado en el punto 2.3, y el plan para construirlo, en 4.2 y 4.3.

### 4.2 Etapas y entregables

| # | Etapa | Período | Qué se entrega | Horas |
|---|---|---|---|---:|
| 1 | Propuesta y repositorio | 18/08 – **30/08** | Esta propuesta y el repositorio declarado. Esqueleto del proyecto funcionando | ~18 |
| 2 | Diseño y módulos | 31/08 – **27/09** | Esquema de base de datos y listado de módulos en el repositorio. Catálogo, armado del turno y grilla | ~40 |
| 3 | Desarrollo y entrega final | 28/09 – **14/11** | Disponibilidad, reserva, pantallas de la clienta, panel, despliegue en la nube, informe escrito y video | ~69 |

La etapa 2 es la que otorga la condición de regularidad.

**El video se graba en español, con subtítulos en inglés.** La cátedra lo pide
preferentemente en inglés, no de forma obligatoria. Ninguno de los dos habla
inglés, y preferimos una explicación clara del trabajo antes que una lectura
forzada en un idioma que no manejamos.

### 4.3 Estimación de horas

Los dos integrantes trabajan sobre el mismo código, con una capacidad conjunta de
**10 horas semanales de trabajo efectivo**. Del 18/08 al 14/11 hay 12 semanas y
media: **125 horas disponibles**.

| Pieza | Horas |
|---|---:|
| Esqueleto del proyecto (Nest, Prisma, Docker) | 6 |
| Catálogo | 10 |
| Armado del turno | 12 |
| Grilla y excepciones | 7 |
| Disponibilidad | 16 |
| Reserva | 9 |
| Clave de acceso al panel | 3 |
| Arranque de React y componentes base | 6 |
| Pantallas de la clienta (4) | 20 |
| Pantalla del panel | 8 |
| Despliegue | 8 |
| Informe, video y documentación de las entregas | 22 |
| **Total estimado** | **127** |

**El plan se pasa 2 horas del tiempo disponible y no tiene margen.** Se declara
así a propósito, en lugar de ajustar las estimaciones hacia abajo para que la
cuenta cierre. El desvío se absorbe con el plan de contingencia del punto 4.5.

### 4.4 Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **React es la tecnología que menos manejamos** | Las pantallas tardan más de lo estimado | Las horas de frontend se estimaron al alza. Se arranca por la pantalla más simple y se deja el comprobante para el final |
| **Margen de horas nulo** | Cualquier imprevisto empuja la entrega final | Plan de contingencia priorizado (4.5), revisado a mediados de octubre |
| **Las otras materias compiten por las mismas horas** | Semanas de menos producción alrededor de los parciales | El trabajo se ordena para que las piezas críticas queden cerradas antes de fin de octubre |
| **El plan de la cuenta de Railway puede no cubrir hasta noviembre** | La API queda caída | Render como alternativa, asumiendo que duerme el servicio a los 15 minutos |
| **Dos aplicaciones implican más configuración** | El despliegue se complica si se deja para el final | El despliegue se hace temprano, en la etapa 2, con el esqueleto todavía vacío |
| **La base gratuita de Neon se suspende por inactividad** | El primer acceso del día tarda unos segundos | Se accede a la aplicación antes de cualquier demostración |

### 4.5 Plan de contingencia

Si a mediados de octubre el avance está por detrás del plan, se recorta en este
orden:

1. **Los extras cosméticos** (francesitas, diseños). Quedan solo los retiros, que
   son los que modifican la duración del turno. El armado sigue existiendo.
2. **La pantalla de comprobante** pasa a ser un aviso dentro de la pantalla de
   confirmación.
3. **El panel deja de permitir cerrar horarios** y solo permite abrirlos. Cerrar
   tiene sustituto —la dueña puede tomar ella misma ese turno—; abrir horarios
   fuera de la grilla no tiene ninguno, y es el diferenciador del proyecto.

---

## 5. Repositorio

Todo el proyecto vive en **https://github.com/brujoh88/tfi-grupo116**: código,
esquema de base de datos, documentación e informes.