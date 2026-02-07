import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const DailyQuiz = () => {
    const { checkUser } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [solved, setSolved] = useState(false);
    const [score, setScore] = useState(0);
    const [caption, setCaption] = useState('');
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const navigate = useNavigate();


    useEffect(() => {
        fetchDailyQuiz();
    }, []);

    useEffect(() => {
        if (solved || !data)
            return;
        let tabSwitch = false;
        let navigateAway = false;

        const handleVisibilityChange = () => {
            if (document.hidden && !navigateAway) {
                tabSwitch = true;
            }
        };

        const handleFocus = async () => {
            if (tabSwitch && !navigateAway && !solved) {
                try {
                    const res = await api.post('/api/logout');
                    if (res.data.success) {
                        navigate('/warning');
                        setTimeout(() => checkUser(), 100);
                    }
                } catch (error) {
                    console.error('Tab switch logout error:', error);
                }
            }
            tabSwitch = false;
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [solved, data, navigate]);

    const fetchDailyQuiz = async () => {
        try {
            const res = await api.get('/api/show');
            if (res.data.solved) {
                setSolved(true);
                setData(res.data.data);
                setScore(res.data.score || 0);
                setCaption(res.data.caption);
            } else {
                setData(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (qIndex, value) => {
        setAnswers({ ...answers, [`question_${qIndex}`]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/show', answers);
            if (res.data.solved) {
                setSolved(true);
                setScore(res.data.score);
                setCaption(res.data.caption);
            }
        } catch (err) {
            console.error(err);
            toast.error('Error submitting quiz');
        }
    };

    const launchConfetti = () => {
        const duration = 10 * 1000;
        const end = Date.now() + duration;
        let animationId;

        (function frame() {
            if (window.confetti) {
                window.confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 30,
                    origin: { x: 0 }
                });
                window.confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 30,
                    origin: { x: 1 }
                });
            }
            if (Date.now() < end) {
                animationId = requestAnimationFrame(frame);
            }
        })();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    };

    useEffect(() => {
        let cleanup;
        if (solved && data?.questions?.length) {
            const percentage = score / data.questions.length;
            if (percentage >= 0.5) {
                cleanup = launchConfetti();
            }
        }
        return () => {
            if (cleanup) cleanup();
        };
    }, [solved, score, data]);

    if (loading) return <Loader />;

    if (solved) {
        return (
            <>
                <Navbar />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                    padding: '20px',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '1.5rem',
                        color: 'white'
                    }}>
                        {caption}
                    </h1>
                    {data?.questions?.length && (
                        <h2 style={{
                            fontSize: '2rem',
                            marginBottom: '2rem',
                            color: 'white'
                        }}>
                            Score: {score}/{data.questions.length}
                        </h2>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: '#7B16FF',
                            color: 'white',
                            padding: '15px 30px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            width: '90%',
                            maxWidth: '400px',
                            transition: 'background 0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(123, 22, 255, 0.8)'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#7B16FF'}
                    >
                        BACK TO HOME
                    </button>
                </div>
            </>
        );
    }

    if (!data) return (
        <>
            <Navbar />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                color: 'white'
            }}>
                <h3>No Daily Quiz Available Today</h3>
            </div>
        </>
    );


    const totalQuestions = data.questions.length;

    return (
        <>
            <Navbar />
            <div className="attending-wrapper">
                <div className="attending-card">
                    <div className="attending-header">
                        <h1 style={{ color: 'white', margin: 0 }}>Daily Quiz</h1>
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
                            <form onSubmit={handleSubmit}>
                                <div className="question-text">
                                    {currentQuestion + 1}. {data.questions[currentQuestion].question}
                                </div>

                                <div className="options-list">
                                    {data.questions[currentQuestion].options.map((opt, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className={`option-select-card ${answers[`question_${currentQuestion}`] === optIndex ? 'selected' : ''}`}
                                            onClick={() => handleChange(currentQuestion, optIndex)}
                                        >
                                            <div className="option-circle"></div>
                                            <span style={{ color: 'var(--white)', fontSize: '1.1rem' }}>{opt}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="nav-controls">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentQuestion(currentQuestion - 1)}
                                        className="nav-btn"
                                        disabled={currentQuestion === 0}
                                        style={{ opacity: currentQuestion === 0 ? 0 : 1 }}
                                    >
                                        <i className="fa fa-chevron-left"></i> Prev
                                    </button>

                                    {currentQuestion < totalQuestions - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                            className="nav-btn primary"
                                        >
                                            Next <i className="fa fa-chevron-right"></i>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="nav-btn primary"
                                        >
                                            <i className="fa fa-paper-plane"></i> Submit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DailyQuiz;
