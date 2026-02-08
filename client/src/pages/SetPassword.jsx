import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

export default function SetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { email, username } = location.state || {};

    useEffect(() => {
        document.title = "Set Password";
        if (!email || !username) {
            navigate('/register');
        }
    }, [email, username, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/api/setpwd', {
                email,
                username,
                password
            });

            if (res.data.success) {
                toast.success('Account created! Please login.');
                navigate('/login');
            } else {
                if (res.data.message) {
                    toast.error(res.data.message);
                    setError(res.data.message);
                } else {
                    toast.success('Account created! Please login.');
                    navigate('/login');
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred during registration.');
            setError('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!email || !username) return null;

    if (loading) return <Loader />;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', width: '100%', padding: '20px 0' }}>
            <div className="login-container">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Set Password</h2>
                <p style={{ textAlign: 'center', color: '#ccc', marginBottom: '20px' }}>
                    Welcome <b>{username}</b>! Set a password to finish registration.
                </p>
                {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" style={{ width: '60%', margin: '1rem auto', display: 'block' }}>
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}
