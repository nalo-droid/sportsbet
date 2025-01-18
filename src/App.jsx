import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SportsBetting from './components/games/SportsBetting';
import Games from './pages/Games';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 py-4 px-6 mb-8">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-2xl font-bold">
              Betting Platform
            </a>
            <div className="flex gap-4">
              <a href="/" className="hover:text-blue-400">
                Home
              </a>
              <a href="/games" className="hover:text-blue-400">
                Games
              </a>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Games />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/sports-betting" element={<SportsBetting />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 py-6 mt-8">
          <div className="container mx-auto px-4 text-center text-gray-400">
            © 2024 Betting Platform. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 