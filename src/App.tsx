import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
