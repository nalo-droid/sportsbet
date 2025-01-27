import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SportsBetting from './components/SportsBetting'; 
import Register from './components/Register';
import Login from './components/Login';
import Admin from './components/Admin';
import Mytransactions from './components/Mytransactions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/sports-betting" element={<SportsBetting />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/my-transactions" element={<Mytransactions />} />
      </Routes>
    </Router>
  );
}

export default App; 