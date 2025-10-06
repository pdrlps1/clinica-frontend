import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/app-layout'
import DashboardPage from './pages/DashboardPage'
import PacientesPage from './pages/PacientesPage'
import MedicosPage from './pages/MedicosPage'
import ConsultasPage from './pages/ConsultasPage'
import ReceitasPage from './pages/ReceitasPage'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          <Route path="/medicos" element={<MedicosPage />} />
          <Route path="/consultas" element={<ConsultasPage />} />
          <Route path="/receitas" element={<ReceitasPage />} />
          <Route path="*" element={<div className="p-6">Página não encontrada.</div>} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
