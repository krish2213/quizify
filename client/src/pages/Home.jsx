import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Chatbot from '../components/Chatbot';

export default function Home() {
    const { user, logout } = useAuth();
    const [count, setCount] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        document.title = "Quizify";
        // PWA Install Prompt Logic
        const showInstallPrompt = () => {
            const hasShownPrompt = localStorage.getItem('pwaPromptShown');
            if (!hasShownPrompt) {
                const deferredPrompt = window.deferredPrompt;
                if (!deferredPrompt) return;

                const InstallToast = ({ closeToast }) => (
                    <div className="pwa-toast-content">
                        <span>Install Quizify for a better experience!</span>
                        <div className="pwa-toast-buttons">
                            <button
                                onClick={() => {
                                    deferredPrompt.prompt();
                                    deferredPrompt.userChoice.then((choiceResult) => {
                                        if (choiceResult.outcome === 'accepted') {
                                            console.log('User accepted the A2HS prompt');
                                        } else {
                                            console.log('User dismissed the A2HS prompt');
                                        }
                                        window.deferredPrompt = null;
                                    });
                                    localStorage.setItem('pwaPromptShown', 'true');
                                    closeToast();
                                }}
                                className="pwa-btn-install"
                            >
                                Install
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('pwaPromptShown', 'true');
                                    closeToast();
                                }}
                                className="pwa-btn-later"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                );

                toast(<InstallToast />, {
                    position: "bottom-center",
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false,
                    theme: "dark",
                    toastId: 'pwa-install-prompt'
                });
            }
        };

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            showInstallPrompt();
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        if (window.deferredPrompt) {
            showInstallPrompt();
        }
        if (searchParams.get('login') === 'success') {
            toast.success('Logged in successfully!');
            setSearchParams(params => {
                params.delete('login');
                return params;
            });
        }

        const fetchHomeStats = async () => {
            try {
                const res = await api.get('/api/home-stats');
                setCount(res.data.count || 0);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHomeStats();
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    if (!user) return null;
    return (
        <>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <img src="/logo.png" width="250" height="250" alt="Logo" />
                <h2>WELCOME TO QUIZIFY, SOLVE & EXPLORE NEW CHALLENGES EVERYDAY</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                    <Link to={`/profile/${user.username}`}>
                        <button className="profile-btn">
                            <i className="fa-solid fa-user"></i> Profile
                        </button>
                    </Link>
                    <Link to="/dailychallenge">
                        <button className="attendquiz-btn">
                            <i className="fa-solid fa-calendar-day"></i>&nbsp;Daily Challenge
                        </button>
                    </Link>
                    <Link to="/viewquizzes">
                        <button className="attendquiz-btn">
                            <i className="fa-solid fa-list-check"></i>&nbsp;Your Quizzes
                        </button>
                    </Link>
                    <Link to="/challenge">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button className="attendquiz-btn">
                                <i className="fa-solid fa-user"></i>&nbsp;&nbsp;1v1&nbsp;&nbsp;<i className="fa-solid fa-user"></i>
                            </button>
                            {count > 0 && (
                                <span className="badge">
                                    {count}
                                </span>
                            )}
                        </div>
                    </Link>
                    <Link to="/attendquiz">
                        <button className="attendquiz-btn">
                            <i className="fa-solid fa-q"></i>&nbsp;&nbsp;Attend Quiz
                        </button>
                    </Link>
                    <Link to="/buildquiz">
                        <button className="buildquiz">
                            <i className="fa-solid fa-plus"></i>&nbsp;
                            Create Quiz
                        </button>
                    </Link>
                    <Link to="/createquiz">
                        <button className="createquiz">
                            <i className="fa-solid fa-plus"></i>&nbsp;
                            Create Quiz using AI
                        </button>
                    </Link>
                    <Link to="/leaderboard?type=alltime">
                        <button className="leaderboard-btn">
                            <i className="fa-solid fa-trophy"></i> Leaderboard
                        </button>
                    </Link>
                    <Link to="/leaderboard?type=daily">
                        <button className="dailyleaderboard-btn">
                            <i className="fa-solid fa-medal"></i> Daily Leaderboard
                        </button>
                    </Link>
                    <button className="logout-btn" onClick={logout}>
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </div>
            </div>
            <Chatbot />
        </>
    );
}
