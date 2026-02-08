import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await api.get('/api/current_user');
            setUser(res.data.user);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const res = await api.post('/api/login', credentials);
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/api/logoutt');
        } catch (error) {
            console.error("Logout API failed:", error);
        } finally {
            localStorage.removeItem('pwaPromptShown');
            setUser(null);
            localStorage.setItem('logoutToast', 'true');
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
