import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar }     from './components/Sidebar';
import Dashboard       from './pages/Dashboard';
import Rules           from './pages/Rules';
import Analysis        from './pages/Analysis';
import Automata        from './pages/Automata';
import Simulator       from './pages/Simulator';
import Optimization    from './pages/Optimization';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"          element={<Dashboard />}   />
            <Route path="/rules"     element={<Rules />}       />
            <Route path="/analysis"  element={<Analysis />}    />
            <Route path="/automata"  element={<Automata />}    />
            <Route path="/simulator" element={<Simulator />}   />
            <Route path="/optimize"  element={<Optimization />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
