import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import './Challenge.css';

export default function Challenge() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [topic, setTopic] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        document.title = "1v1 Quiz";
        api.get('/api/challenge').then(res => {
            setCount(res.data.count);
        });
    }, []);

    const handleSearch = async (val) => {
        setSearch(val);
        if (val.length < 1) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await api.get(`/api/search-users?q=${val}`);
            setSuggestions(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const selectUser = (username) => {
        setSearch(username);
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/challenge', { username: search, topic: topic }, { timeout: 60000 });
            console.log("Full Axios Response:", res);
            if (res.data && res.data.success) {
                navigate('/challenges');
                toast.success("Challenge Created!");
            } else {
                console.error("Failure response data:", res.data);
                toast.error("Creation Failed: " + (res.data.error || "Unknown Error"));
            }
        } catch (e) {
            console.error("Challenge creation error object:", e);
            console.error("Server response:", e.response.data);
            toast.error(e.response.data.error || "Failed to create challenge: Server Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            {loading && <Loader />}
            <div className="challenge-wrapper">
                <form onSubmit={handleSubmit} className="challenge-form">
                    <h1>Challenge (1v1)</h1>
                    <div className="match-label">
                        <i className="fa-solid fa-user"></i>&nbsp;You
                        <span className="vs-badge">VS</span>
                        <div className="opponent-input-group">
                            <i className="fa-solid fa-user" style={{ marginRight: '10px' }}></i>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="username"
                                autoComplete="off"
                                required
                                className="opponent-input"
                            />
                            {suggestions.length > 0 && (
                                <div className="suggestions-box">
                                    {suggestions.map((u, i) => (
                                        <div key={i} onClick={() => selectUser(u.username)} className="suggestion-item">
                                            {u.username}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <label htmlFor="topic" style={{ width: '100%', textAlign: 'left' }}>Enter Quiz Topic:</label>
                    <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="JavaScript" required style={{ width: '100%' }} />
                    <button type="submit" className="create-btn">CREATE</button>
                </form>
                <div className="view-challenges-container">
                    <Link to="/challenges">
                        <button className="view-challenges-btn">VIEW CHALLENGES</button>
                    </Link>
                    {count > 0 && (
                        <span className="badge">
                            {count}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
}
