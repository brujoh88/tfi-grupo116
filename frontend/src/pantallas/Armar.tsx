import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { armarTurno, ErrorDeLaApi, pedirCatalogo } from '../api/api.ts'
import type { ArmarTurno, Catalogo, TurnoArmado } from '../api/tipos.ts'
import { duracion, pesos } from '../formato.ts'

interface Props {
  eleccion: ArmarTurno | null
  alElegir: (eleccion: ArmarTurno) => void
}

export default function Armar({ eleccion, alElegir }: Props) {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [error, setError] = useState<string | null>(null)
  // La última respuesta del armado, junto con la elección a la que corresponde.
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const navegar = useNavigate()

  // El catálogo se pide una sola vez, al abrir la pantalla.
  useEffect(() => {
    pedirCatalogo()
      .then(setCatalogo)
      .catch(() => setError('No pudimos cargar los servicios. Probá de nuevo.'))
  }, [])

  // El total en vivo: cada vez que cambia lo elegido, se le pregunta a la API.
  // La pantalla no suma precios (regla 5).
  useEffect(() => {
    if (!eleccion) return

    // Si María toca dos cosas rápido, la respuesta de la primera puede llegar
    // después que la de la segunda. Al cambiar la elección, la vieja se ignora.
    let vigente = true
    armarTurno(eleccion)
      .then((turno) => vigente && setResultado({ para: eleccion, turno }))
      .catch((e) => {
        if (!vigente) return
        const error = e instanceof ErrorDeLaApi ? e.message : 'No pudimos calcular el total.'
        setResultado({ para: eleccion, error })
      })
    return () => {
      vigente = false
    }
  }, [eleccion])

  // Mientras llega la respuesta de la elección nueva, no se muestra la vieja.
  const alDia = resultado?.para === eleccion ? resultado : null
  const armado = alDia?.turno
  const errorDelArmado = alDia?.error

  if (error) return <Pantalla><p className="text-red-700">{error}</p></Pantalla>
  if (!catalogo) return <Pantalla><p>Cargando…</p></Pantalla>

  const servicio = catalogo.servicios.find((s) => s.id === eleccion?.servicioId)

  return (
    <Pantalla>
      <h2 className="mt-6 mb-2 font-medium">1. ¿Qué te hacés?</h2>
      <ul className="space-y-2">
        {catalogo.servicios.map((servicio) => (
          <li key={servicio.id}>
            <label className={opcion}>
              <input
                type="radio"
                name="servicio"
                checked={eleccion?.servicioId === servicio.id}
                // Cambiar de servicio arranca de cero: los extras de uno no
                // tienen por qué valer para el otro.
                onChange={() => alElegir({ servicioId: servicio.id, extraIds: [] })}
              />
              <span className="flex-1">{servicio.nombre}</span>
              <span className="text-sm text-gray-600">
                {pesos(servicio.precio)} · {duracion(servicio.duracionMinutos)}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {servicio && servicio.extras.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 font-medium">2. ¿Le sumás algo?</h2>
          <ul className="space-y-2">
            {servicio.extras.map((extra) => (
              <li key={extra.id}>
                <label className={opcion}>
                  <input
                    type="checkbox"
                    checked={eleccion!.extraIds.includes(extra.id)}
                    onChange={() => alElegir({ ...eleccion!, extraIds: alternar(eleccion!.extraIds, extra.id) })}
                  />
                  <span className="flex-1">{extra.nombre}</span>
                  <span className="text-sm text-gray-600">+{pesos(extra.precio)}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      {servicio && (
        <>
          <h2 className="mt-6 mb-2 font-medium">3. ¿Venís con algo puesto?</h2>
          <ul className="space-y-2">
            {[null, ...catalogo.retiros].map((retiro) => (
              <li key={retiro?.id ?? 'ninguno'}>
                <label className={opcion}>
                  <input
                    type="radio"
                    name="retiro"
                    checked={eleccion!.retiroId === retiro?.id}
                    onChange={() => alElegir({ ...eleccion!, retiroId: retiro?.id })}
                  />
                  <span className="flex-1">{retiro ? retiro.nombre : 'No, vengo sin nada'}</span>
                  {retiro && <span className="text-sm text-gray-600">+{pesos(retiro.precio)}</span>}
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      {eleccion && (
        <footer className="sticky bottom-0 mt-6 border-t border-gray-300 bg-white py-4">
          {errorDelArmado && <p className="mb-2 text-red-700">{errorDelArmado}</p>}
          <p className="mb-3 text-lg">
            {armado
              ? `Total ${pesos(armado.precio)} · ${duracion(armado.duracionMinutos)}`
              : 'Calculando…'}
          </p>
          <button
            className="w-full rounded-lg bg-pink-600 p-3 font-medium text-white disabled:opacity-50"
            disabled={!armado}
            onClick={() => navegar('/horario')}
          >
            Elegir día y hora →
          </button>
        </footer>
      )}
    </Pantalla>
  )
}

interface Resultado {
  para: ArmarTurno
  turno?: TurnoArmado
  error?: string
}

const opcion =
  'flex items-center gap-3 rounded-lg border border-gray-300 p-3 has-checked:border-pink-600 has-checked:bg-pink-50'

/** Saca el id si estaba, lo agrega si no. */
function alternar(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Armá tu turno</h1>
      {children}
    </main>
  )
}
