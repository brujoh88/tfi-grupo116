import { useEffect, useState } from 'react'
import { abrirHorario, ErrorDeLaApi, verDia } from '../api/api.ts'
import type { DiaDelPanel } from '../api/tipos.ts'
import { dia, hora } from '../formato.ts'

// La clave vive mientras la pestaña esté abierta: al cerrarla, se vuelve a pedir.
const GUARDADA = 'clave-panel'

export default function Panel() {
  const [clave, setClave] = useState<string | null>(() => leerClave())

  if (!clave) return <Entrar alEntrar={(c) => { guardarClave(c); setClave(c) }} />
  return <Dia clave={clave} alSalir={() => { guardarClave(null); setClave(null) }} />
}

/** Pide la clave y la prueba contra la API antes de dejar pasar. */
function Entrar({ alEntrar }: { alEntrar: (clave: string) => void }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await verDia(hoy(), clave)
      alEntrar(clave)
    } catch (e) {
      setError(e instanceof ErrorDeLaApi ? e.message : 'No pudimos entrar. Probá de nuevo.')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Panel del salón</h1>
      <form onSubmit={entrar} className="mt-6 space-y-4">
        <label className="block font-medium">
          Clave
          <input type="password" className={campo} value={clave} required
            onChange={(e) => setClave(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <p className="text-red-700">{error}</p>}
        <button className={boton}>Entrar</button>
      </form>
    </main>
  )
}

function Dia({ clave, alSalir }: { clave: string; alSalir: () => void }) {
  const [fecha, setFecha] = useState(hoy())
  const [diaDelSalon, setDiaDelSalon] = useState<DiaDelPanel | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Cada vez que cambia el día, se le pide a la API cómo está.
  useEffect(() => {
    let vigente = true
    verDia(fecha, clave)
      .then((d) => vigente && setDiaDelSalon(d))
      .catch((e) => {
        if (!vigente) return
        if (e instanceof ErrorDeLaApi && e.estado === 401) return alSalir()
        setError(e instanceof ErrorDeLaApi ? e.message : 'No pudimos traer el día.')
      })
    return () => {
      vigente = false
    }
  }, [fecha, clave, alSalir])

  const alDia = diaDelSalon?.fecha === fecha ? diaDelSalon : null

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Panel del salón</h1>
        <button className="text-sm text-pink-700" onClick={alSalir}>Salir</button>
      </div>

      <label className="mt-4 block font-medium">
        Día
        <input type="date" className={campo} value={fecha} onChange={(e) => { setError(null); setFecha(e.target.value) }} />
      </label>
      <p className="mt-2 text-gray-600 first-letter:uppercase">{fecha && dia(fecha)}</p>

      {error && <p className="mt-4 text-red-700">{error}</p>}
      {fecha && !alDia && !error && <p className="mt-4">Cargando…</p>}

      {alDia && (
        <>
          <ul className="mt-4 space-y-3">
            {alDia.lugares.map((lugar) => (
              <li key={lugar.id} className="rounded-lg border border-gray-300 p-3">
                <p className="font-medium">{lugar.nombre}</p>
                <p className="text-sm text-gray-600">
                  {lugar.tramos.length === 0
                    ? 'Cerrado'
                    : 'Abierto ' + lugar.tramos.map((t) => `${hora(t.desde)} a ${hora(t.hasta)}`).join(', ')}
                </p>
                {lugar.reservas.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {lugar.reservas.map((r) => (
                      <li key={r.id} className="text-sm">
                        <span className="font-medium">{hora(r.inicio)}–{hora(r.fin)}</span>{' '}
                        {r.clienta} · <a className="text-pink-700" href={`tel:${r.telefono}`}>{r.telefono}</a>
                        <br />
                        <span className="text-gray-600">
                          {[r.servicio, ...r.extras, ...(r.retiro ? [r.retiro] : [])].join(' + ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <Abrir fecha={fecha} clave={clave} lugares={alDia.lugares}
            alAbrir={(d) => setDiaDelSalon(d)} />
        </>
      )}
    </main>
  )
}

/** Abrir un horario que la plantilla no tiene: lo que el sistema anterior no dejaba. */
function Abrir({ fecha, clave, lugares, alAbrir }: {
  fecha: string
  clave: string
  lugares: { id: number; nombre: string }[]
  alAbrir: (dia: DiaDelPanel) => void
}) {
  const [lugarId, setLugarId] = useState(lugares[0]?.id ?? 0)
  const [desde, setDesde] = useState('19:00')
  const [hasta, setHasta] = useState('21:00')
  const [estado, setEstado] = useState<{ ok?: string; error?: string }>({})

  async function abrir(e: React.FormEvent) {
    e.preventDefault()
    try {
      alAbrir(await abrirHorario({ fecha, lugarId, desde: aMinutos(desde), hasta: aMinutos(hasta) }, clave))
      setEstado({ ok: `Listo: ya se puede reservar de ${desde} a ${hasta}.` })
    } catch (e) {
      setEstado({ error: e instanceof ErrorDeLaApi ? e.message : 'No pudimos abrir el horario.' })
    }
  }

  return (
    <form onSubmit={abrir} className="mt-6 space-y-3 rounded-lg border border-pink-600 bg-pink-50 p-3">
      <p className="font-medium">Abrir un horario este día</p>
      <select className={campo} value={lugarId} onChange={(e) => setLugarId(Number(e.target.value))}>
        {lugares.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
      </select>
      <div className="flex gap-2">
        <label className="flex-1">Desde<input type="time" step={1800} className={campo} value={desde}
          onChange={(e) => setDesde(e.target.value)} required /></label>
        <label className="flex-1">Hasta<input type="time" step={1800} className={campo} value={hasta}
          onChange={(e) => setHasta(e.target.value)} required /></label>
      </div>
      {estado.ok && <p className="text-green-700">{estado.ok}</p>}
      {estado.error && <p className="text-red-700">{estado.error}</p>}
      <button className={boton}>Abrir</button>
    </form>
  )
}

const campo = 'mt-1 block w-full rounded-lg border border-gray-300 bg-white p-3'
const boton = 'w-full rounded-lg bg-pink-600 p-3 font-medium text-white'

/** "19:30" → 1170, como los guarda la API. */
function aMinutos(texto: string): number {
  const [hh, mm] = texto.split(':').map(Number)
  return hh * 60 + mm
}

/** Hoy en el reloj del celular, como `2026-11-09`. */
function hoy(): string {
  return new Date().toLocaleDateString('en-CA')
}

// El navegador puede negar el almacenamiento (modo privado): ahí se pide siempre.
function leerClave(): string | null {
  try {
    return sessionStorage.getItem(GUARDADA)
  } catch {
    return null
  }
}

function guardarClave(clave: string | null) {
  try {
    if (clave) sessionStorage.setItem(GUARDADA, clave)
    else sessionStorage.removeItem(GUARDADA)
  } catch {
    // Sin almacenamiento, la clave dura lo que dure la pantalla.
  }
}
