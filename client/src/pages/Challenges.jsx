import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function Challenges() {
    const { user: currentUser } = useAuth();
    const [challenges1, setChallenges1] = useState([]);
    const [challenges2, setChallenges2] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Challenges";
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const res = await api.get('/api/challenges');
            setChallenges1(res.data.challenges1 || []);
            setChallenges2(res.data.challenges2 || []);
        } catch (error) {
            console.error("Failed to fetch challenges", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <>
            <Navbar />
            <div style={{ paddingTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', paddingBottom: '50px' }}>
                {/* Live Challenges section */}
                {challenges1.length > 0 && (
                    <>
                        <div className="expired-badge" style={{ color: '#fff', padding: '5px 15px', borderRadius: '5px', fontSize: '20px', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>LIVE CHALLENGES</div>
                        {challenges1.map((c) => (
                            <div key={c._id} className="challenge-card" style={{ background: '#222', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', marginBottom: '20px', position: 'relative' }}>
                                <div className="vs-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                                    <div className="user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}>
                                        <div className="avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '8px', overflow: 'hidden', border: '2px solid #333' }}>
                                            <Link to={`/profile/${c.from.username}`}>
                                                <img src={c.from.profilePicture} alt={c.from.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </Link>
                                        </div>
                                        <div className="username" style={{ fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                                            <Link to={`/profile/${c.from.username}`} style={{ color: '#7B16FF', textDecoration: 'none' }}>
                                                {c.from.username === currentUser?.username ? 'You' : c.from.username}
                                            </Link>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#ccc', marginTop: '2px' }}>{c.from.xp} XP</div>
                                    </div>
                                    <div className="vs-text" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#7B16FF' }}>VS</div>
                                    <div className="user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}>
                                        <div className="avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '8px', overflow: 'hidden', border: '2px solid #333' }}>
                                            <Link to={`/profile/${c.to.username}`}>
                                                <img src={c.to.profilePicture} alt={c.to.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </Link>
                                        </div>
                                        <div className="username" style={{ fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                                            <Link to={`/profile/${c.to.username}`} style={{ color: '#7B16FF', textDecoration: 'none' }}>
                                                {c.to.username === currentUser?.username ? 'You' : c.to.username}
                                            </Link>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#ccc', marginTop: '2px' }}>{c.to.xp} XP</div>
                                    </div>
                                </div>
                                <Link to={`/playchallenge/${c._id}`}>
                                    <button className="play-btn" style={{ marginTop: '20px', backgroundColor: '#7B16FF', color: 'white', border: 'none', padding: '10px 0', width: '100%', fontSize: '1rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(123, 22, 255, 0.3)' }}>Play Now</button>
                                </Link>
                            </div>
                        ))}
                        <br />
                    </>
                )}

                {/* Past Challenges section */}
                {challenges2.length > 0 && (
                    <>
                        <br />
                        <div className="expired-badge" style={{ color: '#fff', padding: '5px 15px', borderRadius: '5px', fontSize: '20px', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>PAST CHALLENGES</div>
                        {challenges2.map((c) => {
                            let myScore = '-';
                            let opponentScore = '-';
                            let resultText = '';

                            if (c.userAttempts.length === 2) {
                                c.userAttempts.forEach((attempt) => {
                                    if (attempt.user === currentUser._id || attempt.user._id === currentUser._id) {
                                        myScore = attempt.score;
                                    } else {
                                        opponentScore = attempt.score;
                                    }
                                });

                                if (myScore > opponentScore) {
                                    resultText = "You Won (+5XP)";
                                } else if (myScore < opponentScore) {
                                    resultText = "You Lost (-5XP)";
                                } else {
                                    resultText = "Draw";
                                }
                            } else {
                                resultText = "Waiting for Opponent";
                            }

                            return (
                                <div key={c._id} className="challenge-card" style={{ background: '#222', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', marginBottom: '20px' }}>
                                    <div className="expired-badge" style={{
                                        color: 'white',
                                        backgroundColor: resultText.includes('Won') ? '#2e7d32' : (resultText.includes('Lost') ? '#c62828' : '#444'),
                                        padding: '5px 15px', borderRadius: '15px', fontSize: '14px', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}>
                                        {resultText}
                                    </div>
                                    <div className="vs-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                                        <div className="user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}>
                                            <div className="avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '8px', overflow: 'hidden', border: '2px solid #333' }}>
                                                <Link to={`/profile/${c.from.username}`}>
                                                    <img src={c.from.profilePicture} alt={c.from.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </Link>
                                            </div>
                                            <div className="username" style={{ fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                                                <Link to={`/profile/${c.from.username}`} style={{ color: c.from.username === currentUser.username ? '#7B16FF' : 'white', textDecoration: 'none' }}>
                                                    {c.from.username === currentUser.username ? 'You' : c.from.username}
                                                </Link>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#ccc', marginTop: '2px' }}>{c.from.xp} XP</div>
                                        </div>
                                        <div className="vs-text" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#7B16FF', margin: '0 5px' }}>
                                            {c.userAttempts.length === 2 ? `${myScore} : ${opponentScore}` : "VS"}
                                        </div>
                                        <div className="user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}>
                                            <div className="avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '8px', overflow: 'hidden', border: '2px solid #333' }}>
                                                <Link to={`/profile/${c.to.username}`}>
                                                    <img src={c.to.profilePicture} alt={c.to.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </Link>
                                            </div>
                                            <div className="username" style={{ fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                                                <Link to={`/profile/${c.to.username}`} style={{ color: c.to.username === currentUser.username ? '#7B16FF' : 'white', textDecoration: 'none' }}>
                                                    {c.to.username === currentUser.username ? 'You' : c.to.username}
                                                </Link>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#ccc', marginTop: '2px' }}>{c.to.xp} XP</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <br />
                    </>
                )}

                {challenges1.length === 0 && challenges2.length === 0 && (
                    <>
                        <br />
                        <h2>No Challenges Found</h2>
                        <Link to="/challenge">
                            <button className="play-btn" style={{ marginTop: '20px', backgroundColor: '#7B16FF', color: 'white', border: 'none', padding: '10px 25px', fontSize: '1rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>Start Challenging</button>
                        </Link>
                    </>
                )}
            </div>
        </>
    );
}
