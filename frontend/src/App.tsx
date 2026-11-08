import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import type { ArmarTurno, HorarioOfrecido, TurnoArmado } from './api/tipos.ts'
import Armar from './pantallas/Armar.tsx'
import Confirmar from './pantallas/Confirmar.tsx'
import Horario from './pantallas/Horario.tsx'

// Una ruta por pantalla, para que "atrás" en el celular vuelva al paso anterior
// en vez de sacar a la clienta del sitio.
export default function App() {
  // Lo que la clienta va eligiendo vive acá, arriba de las rutas: así no se
  // pierde al pasar de una pantalla a la otra.
  const [eleccion, setEleccion] = useState<ArmarTurno | null>(null)
  // El turno con el total que vio al armar: la reserva lo manda para comparar.
  const [armado, setArmado] = useState<TurnoArmado | null>(null)
  const [turno, setTurno] = useState<{ fecha: string; horario: HorarioOfrecido } | null>(null)

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/armar" replace />} />
      <Route
        path="/armar"
        element={<Armar eleccion={eleccion} alElegir={setEleccion} alSeguir={setArmado} />}
      />
      <Route
        path="/horario"
        element={
          // Si recarga acá, lo elegido se perdió: vuelve a armar.
          eleccion && armado ? (
            <Horario eleccion={eleccion} armado={armado} alElegir={setTurno} fechaElegida={turno?.fecha} />
          ) : (
            <Navigate to="/armar" replace />
          )
        }
      />
      <Route
        path="/confirmar"
        element={
          eleccion && armado && turno ? (
            <Confirmar eleccion={eleccion} armado={armado} fecha={turno.fecha} horario={turno.horario} />
          ) : (
            <Navigate to="/armar" replace />
          )
        }
      />
    </Routes>
  )
}
