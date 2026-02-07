import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

export default function EditProfile() {
    const { user, checkUser } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState(user?.username || '');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('username', username);
        if (image) {
            formData.append('image', image);
        }

        try {
            const res = await api.put('/api/editprofile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                await checkUser();
                navigate(`/profile/${res.data.user.username}`);
            } else {
                setError(res.data.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <>
            <Navbar />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                padding: '20px'
            }}>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        background: '#16171A',
                        padding: '30px',
                        borderRadius: '10px',
                        width: '100%',
                        maxWidth: '400px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}
                >
                    <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Edit your profile</h2>

                    {error && (
                        <div style={{
                            background: 'rgba(255, 0, 0, 0.2)',
                            color: '#ff4444',
                            padding: '10px',
                            borderRadius: '5px',
                            textAlign: 'center',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="username"
                            style={{
                                display: 'block',
                                marginBottom: '5px',
                                color: '#A3AFBF'
                            }}
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #A3AFBF',
                                background: '#16171A',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="image"
                            style={{
                                display: 'block',
                                marginBottom: '5px',
                                color: '#A3AFBF'
                            }}
                        >
                            Upload Image
                        </label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #A3AFBF',
                                background: '#16171A',
                                color: 'white'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: '#7B16FF',
                            color: 'white',
                            padding: '12px',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '10px',
                            transition: 'background 0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(123, 22, 255, 0.8)'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#7B16FF'}
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        className="profile-btn"
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'transparent',
                            color: '#A3AFBF',
                            padding: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '5px',
                            textDecoration: 'underline'
                        }}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </>
    );
}
