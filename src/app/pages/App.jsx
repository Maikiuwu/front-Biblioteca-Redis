import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js';

import Login from './Login.jsx';
import Books from './Books.jsx';
import Register from './Register.jsx';
import Home from './Home.jsx';
import NotFound from './NotFound.jsx';

const publicRoutes = ['/login', '/register', '/books'];

function App() {

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            if (!session && !publicRoutes.includes(location.pathname)) {
                navigate('/login');
            } else if (session) {
                navigate('/home');
            } 
        },)
    }, [navigate, location]);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/books" element={<Books />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;