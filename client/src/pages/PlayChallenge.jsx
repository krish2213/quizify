import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

export default function PlayChallenge() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await api.get(`/api/playchallenge/${id}`);
                if (res.data.redirect) {
                    navigate(res.data.redirect);
                    return;
                }
                setData(res.data.data);

                // Timer Logic
                const k = `quizStartTime_${id}`;
                let s = localStorage.getItem(k);
                if (!s) {
                    s = Date.now().toString();
                    localStorage.setItem(k, s);
                }
                const elapsed = Math.floor((Date.now() - parseInt(s)) / 1000);
                const remaining = 70 - elapsed;

                if (remaining <= 0) {
                    toast.info("⏰ Time's up! You score is 0");
                    handleSubmit(true);
                } else {
                    setTimeLeft(remaining);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id, navigate]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            toast.info("⏰ Time's up! Challenge ended!!");
            handleSubmit(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleOptionChange = (qIndex, optionIndex) => {
        setAnswers(prev => ({ ...prev, [`question_${qIndex}`]: optionIndex }));
    };

    const handleSubmit = async (forceObj = false) => {
        const k = `quizStartTime_${id}`;
        localStorage.removeItem(k);
        setLoading(true);
        try {
            const res = await api.post(`/api/playchallenge/${id}`, answers);
            navigate('/challenges');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!data) return <div>Data not found</div>;


    if (!data) return <div>Data not found</div>;

    return (
        <>
            <Navbar />
            <div className="attending-wrapper">
                <div className="attending-card">
                    <div className="attending-header">
                        <h1 style={{ color: 'white', margin: 0 }}>{data.topic}</h1>
                        <div id="timer" style={{
                            fontSize: '1.2rem',
                            color: timeLeft <= 20 ? '#ff4444' : 'var(--primary)',
                            marginTop: '10px',
                            fontWeight: 'bold',
                            background: 'rgba(0,0,0,0.3)',
                            display: 'inline-block',
                            padding: '5px 15px',
                            borderRadius: '20px'
                        }}>
                            <i className="fa-solid fa-clock"></i> {timeLeft}s left
                        </div>
                    </div>

                    <div className="quiz-layout">
                        <div className="question-navigator">
                            {data.questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestion(index)}
                                    className={`nav-item ${currentQuestion === index ? 'active' : ''} ${answers[`question_${index}`] !== undefined ? 'answered' : ''}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <div className="question-display">
                            {data.questions.map((question, index) => (
                                <div key={index} style={{ display: index === currentQuestion ? 'block' : 'none' }}>
                                    <div className="question-text">
                                        {index + 1}. {question.question}
                                    </div>

                                    <div className="options-list">
                                        {question.options.map((option, i) => (
                                            <div
                                                key={i}
                                                className={`option-select-card ${answers[`question_${index}`] == i ? 'selected' : ''}`}
                                                onClick={() => handleOptionChange(index, i)}
                                            >
                                                <div className="option-circle"></div>
                                                <span style={{ color: 'var(--white)', fontSize: '1.1rem' }}>{option}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="nav-controls">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentQuestion(index - 1)}
                                            className="nav-btn"
                                            disabled={index === 0}
                                            style={{ opacity: index === 0 ? 0 : 1 }}
                                        >
                                            <i className="fa fa-chevron-left"></i> Prev
                                        </button>

                                        {index < data.questions.length - 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentQuestion(index + 1)}
                                                className="nav-btn primary"
                                            >
                                                Next <i className="fa fa-chevron-right"></i>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSubmit()}
                                                className="nav-btn primary"
                                            >
                                                <i className="fa fa-paper-plane"></i> Submit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
