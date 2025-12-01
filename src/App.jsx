import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login/Login.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'

function Home() {

  return (
    <div className="page">

      <div style={{ width: 360 }}>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Link to="/login">Ir a Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}
