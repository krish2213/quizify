import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [feedback, setFeedback] = useState({ username: '', email: '', general: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Register - Quizify";
    }, []);

    const checkUsername = async (username) => {
        if (username.length < 4) return;
        try {
            const res = await api.get(`/api/checkusername?username=${username}`);
            if (res.data.exists) {
                setFeedback(prev => ({ ...prev, username: 'Username already taken' }));
            } else {
                setFeedback(prev => ({ ...prev, username: '' }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const checkEmail = async (email) => {
        if (email.length < 6) return;
        try {
            const res = await api.get(`/api/checkemail?email=${email}`);
            if (res.data.exists) {
                setFeedback(prev => ({ ...prev, email: 'Email already registered' }));
            } else {
                setFeedback(prev => ({ ...prev, email: '' }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const debouncedCheckUsername = debounce(checkUsername, 500);
    const debouncedCheckEmail = debounce(checkEmail, 2000);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'username') {
            const usernamePattern = /^[a-z0-9_]+$/;
            if (!usernamePattern.test(value)) {
                setFeedback(prev => ({ ...prev, username: 'Allowed : a-z, 0-9, _ only' }));
            } else if (value.length < 4) {
                setFeedback(prev => ({ ...prev, username: 'Username must be at least 4 characters long' }));
            } else {
                setFeedback(prev => ({ ...prev, username: '' }));
                debouncedCheckUsername(value);
            }
        }

        if (name === 'email') {
            debouncedCheckEmail(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (feedback.username || feedback.email) return;

        setLoading(true);
        try {
            const res = await api.post('/api/register', formData);
            if (res.data.success) {
                toast.success('Verification link sent! Check your email.(Spam folder too)' || res.data.message);
                setTimeout(() => navigate('/login'), 5000);
            } else {
                toast.error(res.data.message || 'Registration failed.');
                setFeedback(prev => ({ ...prev, general: res.data.message }));
            }
        } catch (err) {
            toast.error('Registration failed. Try again.');
            setFeedback(prev => ({ ...prev, general: 'Registration failed. Try again.' }));
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
                            Sign Up with Google
                        </button>
                    </a>
                </div>
                <br />
                or
                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    {feedback.username && <div style={{ color: 'red', fontSize: '14px' }}>{feedback.username}</div>}

                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    {feedback.email && <div style={{ color: 'red', fontSize: '14px' }}>{feedback.email}</div>}

                    {feedback.general && <div style={{ color: 'red', fontSize: '14px' }}>{feedback.general}</div>}
                    <br />
                    <button type="submit" style={{ width: 'auto', margin: '1rem auto', display: 'block', whiteSpace: 'nowrap' }} disabled={!!feedback.username || !!feedback.email}>VERIFY & REGISTER</button>
                    <p>Already have an account? <Link to="/login" style={{ color: '#7B16FF', textDecoration: 'none' }}>Login</Link></p>
                </form>
            </div>
        </div>
    );
}
