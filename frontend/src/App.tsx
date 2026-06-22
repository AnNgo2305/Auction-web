import { BrowserRouter } from 'react-router-dom';
import AuthRoutes from '@/routes/auth.route.tsx';
import AboutRoutes from '@/routes/about.route.tsx';

function App() {
  return (
    <BrowserRouter>
      <AuthRoutes />
      <AboutRoutes />
    </BrowserRouter>
  );
}

export default App;
