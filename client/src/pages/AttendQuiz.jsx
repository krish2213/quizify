import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import './AttendQuiz.css';

export default function AttendQuiz() {
    useEffect(() => {
        document.title = "Attend Quiz";
    }, []);

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/attendquiz', { quizcode: code });
            navigate('/attending');
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 404) {
                toast.error("Invalid Quiz Code!");
            } else {
                toast.error("Error joining quiz");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            {loading && <Loader />}
            <div className="attend-wrapper">
                <form onSubmit={handleSubmit} className="attend-form">
                    <h2>Enter Quiz Code</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            id="quizcode"
                            name="quizcode"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ex: 1224"
                            autoFocus
                            required
                            className="attend-input"
                        />
                    </div>
                    <button type="submit" className="attend-btn">ATTEND QUIZ</button>
                </form>
            </div>
        </>
    );
}

