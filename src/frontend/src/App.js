import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Header from './components/Header';

function AppContent() {
  const location = useLocation();
  const hideHeaderRoutes = ['/'];
  const hideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path='/' element={<AuthPage />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
