import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { consultarDisponibilidad, ErrorDeLaApi } from '../api/api.ts'
import type { ArmarTurno, Disponibilidad, HorarioOfrecido, TurnoArmado } from '../api/tipos.ts'
import { duracion, hora, pesos } from '../formato.ts'

interface Props {
  eleccion: ArmarTurno
  armado: TurnoArmado
  fechaElegida?: string
  alElegir: (turno: { fecha: string; horario: HorarioOfrecido }) => void
}

export default function Horario({ eleccion, armado, fechaElegida, alElegir }: Props) {
  const [fecha, setFecha] = useState(fechaElegida ?? '')
  // La última respuesta, junto con el día al que corresponde (como en armar).
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const navegar = useNavigate()

  // Cada vez que cambia el día, se le pregunta a la API qué horarios quedan.
  // Qué días se pueden pedir (no el pasado, hasta 45 adelante) lo decide la API.
  useEffect(() => {
    if (!fecha) return
    let vigente = true
    consultarDisponibilidad({ ...eleccion, fecha })
      .then((disponibilidad) => vigente && setResultado({ para: fecha, disponibilidad }))
      .catch((e) => {
        if (!vigente) return
        const error = e instanceof ErrorDeLaApi ? e.message : 'No pudimos traer los horarios.'
        setResultado({ para: fecha, error })
      })
    return () => {
      vigente = false
    }
  }, [eleccion, fecha])

  const alDia = resultado?.para === fecha ? resultado : null

  return (
    <main className="mx-auto max-w-md p-4">
      <Link to="/armar" className="text-sm text-pink-700">← Cambiar lo que armé</Link>
      <h1 className="mt-2 text-2xl font-semibold">Elegí día y hora</h1>
      <p className="mt-1 text-gray-600">
        {armado.servicio.nombre} · {pesos(armado.precio)} · {duracion(armado.duracionMinutos)}
      </p>

      <label className="mt-6 block font-medium">
        Día
        <input
          type="date"
          className="mt-2 block w-full rounded-lg border border-gray-300 p-3"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </label>

      {fecha && !alDia && <p className="mt-4">Buscando horarios…</p>}
      {alDia?.error && <p className="mt-4 text-red-700">{alDia.error}</p>}
      {alDia?.disponibilidad && alDia.disponibilidad.horarios.length === 0 && (
        <p className="mt-4 text-gray-600">Ese día no quedan horarios. Probá con otro.</p>
      )}
      {alDia?.disponibilidad && alDia.disponibilidad.horarios.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {alDia.disponibilidad.horarios.map((horario) => (
            <li key={horario.inicio}>
              <button
                className="w-full rounded-lg border border-gray-300 p-3 hover:border-pink-600"
                onClick={() => {
                  alElegir({ fecha, horario })
                  navegar('/confirmar')
                }}
              >
                {hora(horario.inicio)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

interface Resultado {
  para: string
  disponibilidad?: Disponibilidad
  error?: string
}
