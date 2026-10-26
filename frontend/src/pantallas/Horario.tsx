import { Link } from 'react-router'

// Todavía no está: la próxima pantalla. Por ahora solo comprueba que lo elegido
// sobrevive al cambio de ruta y que "atrás" vuelve a armar.
export default function Horario() {
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Elegí día y hora</h1>
      <p className="mt-4 text-gray-600">Próximamente.</p>
      <Link to="/armar" className="mt-4 inline-block text-pink-700 underline">
        ← Volver a armar
      </Link>
    </main>
  )
}
