import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ChangePassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Change Password";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await api.post('/api/changepwd', { email });
            if (res.data.success) {
                toast.success(res.data.message);
                setMessage(res.data.message);
            } else {
                toast.error(res.data.message || 'Failed to send reset link.');
                setError(res.data.message || 'Failed to send reset link.');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.');
            setError('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', width: '100%', padding: '20px 0' }}>
            <div className="login-container">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Reset Password</h2>
                {message && <div style={{ color: '#00ff00', marginBottom: '10px', textAlign: 'center' }}>{message}</div>}
                {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading} style={{ width: '60%', margin: '1rem auto', display: 'block', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <Link to="/login" style={{ color: '#ccc', textDecoration: 'none' }}>Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
