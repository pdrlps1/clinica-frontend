import './App.css'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import PacientesPage from './pages/PacientesPage'
import MedicosPage from './pages/MedicosPage'
import ConsultasPage from './pages/ConsultasPage'
import ReceitasPage from './pages/ReceitasPage'

function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto max-w-6xl">
        <nav className="flex gap-4 p-4 border-b">
          <NavLink to="/pacientes" className={({ isActive }) => isActive ? 'font-semibold underline' : ''}>Pacientes</NavLink>
          <NavLink to="/medicos" className={({ isActive }) => isActive ? 'font-semibold underline' : ''}>Médicos</NavLink>
          <NavLink to="/consultas" className={({ isActive }) => isActive ? 'font-semibold underline' : ''}>Consultas</NavLink>
          <NavLink to="/receitas" className={({ isActive }) => isActive ? 'font-semibold underline' : ''}>Receitas</NavLink>
        </nav>
        <div>
          <Routes>
            <Route path="/" element={<PacientesPage />} />
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/medicos" element={<MedicosPage />} />
            <Route path="/consultas" element={<ConsultasPage />} />
            <Route path="/receitas" element={<ReceitasPage />} />
            <Route path="*" element={<div className="p-6">Página não encontrada. <Link to="/">Ir para início</Link></div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
