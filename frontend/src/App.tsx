import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import type { ArmarTurno } from './api/tipos.ts'
import Armar from './pantallas/Armar.tsx'
import Horario from './pantallas/Horario.tsx'

// Una ruta por pantalla, para que "atrás" en el celular vuelva al paso anterior
// en vez de sacar a la clienta del sitio.
export default function App() {
  // Lo que la clienta va eligiendo vive acá, arriba de las rutas: así no se
  // pierde al pasar de una pantalla a la otra.
  const [eleccion, setEleccion] = useState<ArmarTurno | null>(null)

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/armar" replace />} />
      <Route
        path="/armar"
        element={<Armar eleccion={eleccion} alElegir={setEleccion} />}
      />
      <Route path="/horario" element={<Horario />} />
    </Routes>
  )
}
