import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

export default function VerifyAccount() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await api.get(`/api/verify-token/${token}`);
                if (res.data.success) {
                    toast.success('Verified! Redirecting...');
                    setStatus('Verified! Redirecting...');
                    setTimeout(() => {
                        navigate('/setpwd', {
                            state: {
                                email: res.data.email,
                                username: res.data.username
                            }
                        });
                    }, 1500);
                } else {
                    toast.error(res.data.message || 'Verification failed');
                    setStatus(res.data.message || 'Verification failed');
                }
            } catch (err) {
                console.error(err);
                toast.error('An error occurred during verification.');
                setStatus('An error occurred during verification.');
            }
        };
        verify();
    }, [token, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2 style={{ color: 'white' }}>{status}</h2>
            <Loader />
        </div>
    );
}
