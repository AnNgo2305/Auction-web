import { BrowserRouter } from 'react-router-dom';
import AuthRoutes from '@/routes/AuthRoute';
import AboutRoutes from '@/routes/AboutRoute';
import ProfileRoutes from '@/routes/ProfileRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthRoutes />
      <AboutRoutes />
      <ProfileRoutes />
    </BrowserRouter>
  );
}

export default App;
