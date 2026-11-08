import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}