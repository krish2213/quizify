import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = "Reset Password";
        const verify = async () => {
            try {
                const res = await api.get(`/api/verify-reset-token?id=${id}&token=${token}`);
                if (res.data.success) {
                    setVerified(true);
                } else {
                    toast.error(res.data.message || 'Invalid or expired link.');
                    setError(res.data.message || 'Invalid or expired link.');
                }
            } catch (err) {
                toast.error('Verification failed.');
                setError('Verification failed.');
            } finally {
                setVerifying(false);
            }
        };
        if (id && token) {
            verify();
        } else {
            setError('Invalid link parameters.');
            setVerifying(false);
        }
    }, [id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await api.post(`/api/resetpassword?id=${id}`, { password });
            if (res.data.success) {
                toast.success(res.data.message);
                setMessage(res.data.message);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(res.data.message || 'Failed to reset password.');
                setError(res.data.message || 'Failed to reset password.');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.');
            setError('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) return <Loader />;

    if (!verified) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'white' }}>
            <h2>{error}</h2>
            <button onClick={() => navigate('/changepwd')} style={{ marginTop: '20px', padding: '10px 20px' }}>Request New Link</button>
        </div>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', width: '100%', padding: '20px 0' }}>
            <div className="login-container">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>New Password</h2>
                {message && <div style={{ color: '#00ff00', marginBottom: '10px', textAlign: 'center' }}>{message}</div>}
                {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="password">Enter New Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading} style={{ width: '60%', margin: '1rem auto', display: 'block', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
