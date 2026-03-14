import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { subscribeUserToPush } from '../utils/pushNotifications';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (user && !loading) {
            subscribeUserToPush().then(res => {
                if (res.success) {
                    console.log("Auto-subscription success during login", res.message);
                } else {
                    console.warn("Auto-subscription declined during login", res.message);
                }
            }).catch(err => {
                console.error("Auto-subscription error during login", err);
            });
        }
    }, [user, loading]);

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
            localStorage.removeItem('notificationPromptShown');
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
