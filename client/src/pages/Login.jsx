import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        document.title = "Login - Quizify";
        const errorParam = searchParams.get('error');
        if (errorParam) {
            toast.error(errorParam === 'google_auth_failed' ? 'Google Authentication Failed' : 'Login Failed');
            setSearchParams(params => {
                params.delete('error');
                return params;
            });
        }
        if (localStorage.getItem('logoutToast') === 'true') {
            toast.success('Logged out successfully!');
            localStorage.removeItem('logoutToast');
        }
    }, [searchParams, setSearchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(formData);
            toast.success(`Welcome ${formData.username}!`);
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Invalid username or password');
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', width: '100%', padding: '20px 0' }}>
            <div className="login-container">
                <h1>QUIZIFY</h1>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <a href={`${import.meta.env.VITE_BACKEND_URL}/auth/google`} style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'flex' }}>
                            <img src="https://sm.pcmag.com/pcmag_me/review/g/google-doc/google-docs-sheets-and-slides_f6we.png"
                                alt="Google Logo" style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                            Sign In with Google
                        </button>
                    </a>
                </div>
                <br />
                or

                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">Username </label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        autoFocus
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPwd ? "text" : "password"}
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <i
                            className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}
                            id="togglePassword"
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                            onClick={() => setShowPwd(!showPwd)}
                        ></i>
                    </div>

                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                    <span style={{ fontSize: '16px', textAlign: 'right', display: 'block', marginTop: '5px' }}>
                        <Link to="/changepwd" style={{ color: '#7B16FF', textDecoration: 'none' }}>
                            Forgot Password/Username?
                        </Link>
                    </span>

                    <button type="submit" style={{ width: '60%', margin: '1rem auto', display: 'block' }}>LOGIN</button>

                    <p>Don't have an account? <Link to="/register" style={{ color: '#7B16FF', textDecoration: 'none' }}>Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
