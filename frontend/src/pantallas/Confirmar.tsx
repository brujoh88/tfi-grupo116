import { useState } from 'react'
import { Link } from 'react-router'
import { ErrorDeLaApi, reservar } from '../api/api.ts'
import type { ArmarTurno, Comprobante, HorarioOfrecido, TurnoArmado } from '../api/tipos.ts'
import { dia, duracion, hora, pesos } from '../formato.ts'

interface Props {
  eleccion: ArmarTurno
  armado: TurnoArmado
  fecha: string
  horario: HorarioOfrecido
}

export default function Confirmar({ eleccion, armado, fecha, horario }: Props) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<{ estado: number; mensaje: string } | null>(null)
  const [comprobante, setComprobante] = useState<Comprobante | null>(null)

  async function confirmar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      // El total es el que María vio: la API lo recalcula y, si cambió, no
      // reserva (PDR-004). El teléfono va como lo escribió: lo normaliza la API.
      setComprobante(
        await reservar({ ...eleccion, fecha, inicio: horario.inicio, nombre, telefono, total: armado.precio }),
      )
    } catch (e) {
      setError(
        e instanceof ErrorDeLaApi
          ? { estado: e.estado, mensaje: e.message }
          : { estado: 0, mensaje: 'No pudimos reservar. Probá de nuevo.' },
      )
    } finally {
      setEnviando(false)
    }
  }

  // El comprobante es un aviso en esta misma pantalla (plan de contingencia).
  // Los precios son los que quedaron guardados en la reserva.
  if (comprobante) {
    return (
      <main className="mx-auto max-w-md p-4">
        <div className="rounded-lg border border-green-600 bg-green-50 p-4">
          <h1 className="text-2xl font-semibold">¡Listo, {comprobante.nombre}!</h1>
          <p className="mt-2">Tu turno quedó reservado. Reserva n.º {comprobante.id}.</p>
          <p className="mt-4 font-medium first-letter:uppercase">
            {dia(comprobante.fecha)}, {hora(comprobante.inicio)} a {hora(comprobante.fin)}
          </p>
          <Detalle turno={comprobante} />
          <p className="mt-4 text-sm text-gray-600">Sacale una captura a esta pantalla.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <Link to="/horario" className="text-sm text-pink-700">← Cambiar día u hora</Link>
      <h1 className="mt-2 text-2xl font-semibold">Confirmá tu turno</h1>
      <p className="mt-4 font-medium first-letter:uppercase">
        {dia(fecha)}, {hora(horario.inicio)} a {hora(horario.fin)} · {duracion(armado.duracionMinutos)}
      </p>
      <Detalle turno={armado} />

      <form onSubmit={confirmar} className="mt-6 space-y-4">
        <label className="block font-medium">
          Tu nombre
          <input className="mt-2 block w-full rounded-lg border border-gray-300 p-3" value={nombre}
            onChange={(e) => setNombre(e.target.value)} required autoComplete="name" />
        </label>
        <label className="block font-medium">
          Tu teléfono
          <input className="mt-2 block w-full rounded-lg border border-gray-300 p-3" value={telefono}
            onChange={(e) => setTelefono(e.target.value)} required type="tel" autoComplete="tel" />
        </label>

        {error && (
          <div className="text-red-700">
            <p>{error.mensaje}</p>
            {/* 409: el precio cambió o el horario se ocupó. Cada uno vuelve a su paso. */}
            {error.estado === 409 && error.mensaje.startsWith('El precio') && (
              <Link to="/armar" className="underline">Volver a ver el total</Link>
            )}
            {error.estado === 409 && !error.mensaje.startsWith('El precio') && (
              <Link to="/horario" className="underline">Elegir otro horario</Link>
            )}
          </div>
        )}

        <button className="w-full rounded-lg bg-pink-600 p-3 font-medium text-white disabled:opacity-50"
          disabled={enviando}>
          {enviando ? 'Reservando…' : `Reservar · ${pesos(armado.precio)}`}
        </button>
      </form>
    </main>
  )
}

function Detalle({ turno }: { turno: Pick<TurnoArmado, 'servicio' | 'extras' | 'retiro' | 'precio'> }) {
  const items = [turno.servicio, ...turno.extras, ...(turno.retiro ? [turno.retiro] : [])]
  return (
    <ul className="mt-2 space-y-1 text-gray-700">
      {items.map((item) => (
        <li key={`${item.nombre}`} className="flex justify-between">
          <span>{item.nombre}</span>
          <span>{pesos(item.precio)}</span>
        </li>
      ))}
      <li className="flex justify-between border-t border-gray-300 pt-1 font-medium">
        <span>Total</span>
        <span>{pesos(turno.precio)}</span>
      </li>
    </ul>
  )
}
