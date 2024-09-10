import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import Doorbells from './components/Products/Doorbells';
import Doorlocks from './components/Products/Doorlocks';
import Lightings from './components/Products/Lightings';
import Speakers from './components/Products/Speakers';
import Thermostats from './components/Products/Thermostats';
import Signin from './components/Auth/SignIn';
import Signup from './components/Auth/SignUp';
import Home from './routes/Home';
import './styles/globals.css';

function App() {
  return (
    <ClerkProvider publishableKey={process.env.REACT_APP_CLERK_FRONTEND_API}>
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/products/doorbells" element={<Doorbells />} />
          <Route path="/products/doorlocks" element={<Doorlocks />} />
          <Route path="/products/speakers" element={<Speakers />} />
          <Route path="/products/lightings" element={<Lightings />} />
          <Route path="/products/thermostats" element={<Thermostats />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          {/* Add other routes as necessary */}
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;
