import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import api from '../api/axios';

export default function Attending() {
    const [quizData, setQuizData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [solved, setSolved] = useState(false);
    const [score, setScore] = useState(0);
    const [caption, setCaption] = useState('');
    const navigate = useNavigate();
    const { checkUser } = useAuth();

    useEffect(() => {
        fetchQuiz();
        let tabSwitch = false;
        let navigateAway = false;

        const handleVisibilityChange = () => {
            if (document.hidden && !navigateAway && !solved) {
                tabSwitch = true;
            }
        };

        const handleFocus = async () => {
            if (tabSwitch && !navigateAway && quizData && !solved) {
                try {
                    const res = await api.post('/api/quizlogout', { number: quizData.data.number });
                    if (res.data.success) {
                        navigate('/warning');
                        setTimeout(() => checkUser(), 100);
                    }
                } catch (error) {
                    console.error(error);
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
    }, [quizData?.data?.number]);

    const fetchQuiz = async () => {
        try {
            const res = await api.get('/api/attending');
            if (res.data.redirect) {
                navigate(res.data.redirect);
            } else if (res.data.solved) {
                setSolved(true);
                setScore(res.data.score);
                setCaption(res.data.caption);
                setQuizData(res.data);
            } else {
                setQuizData(res.data);
            }
        } catch (error) {
            console.error(error);
            navigate('/');
        } finally {
            setLoading(false);
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
        if (solved && quizData?.data?.questions?.length) {
            const percentage = score / quizData.data.questions.length;
            if (percentage >= 0.5) {
                cleanup = launchConfetti();
            }
        }

        return () => {
            if (cleanup) cleanup();
        };
    }, [solved, score, quizData]);

    const handleOptionChange = (questionIndex, optionIndex) => {
        setAnswers(prev => ({ ...prev, [`question_${questionIndex}`]: optionIndex }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const quizId = quizData?.data?.number;
            const updatedAnswers = answers;
            const res = await api.post(`/api/attending/${quizId}`, { answers: updatedAnswers });
            if (res.data.solved) {
                setSolved(true);
                setScore(res.data.score);
                setCaption(res.data.caption);
            }
        } catch (error) {
            console.error("Error submitting quiz", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !quizData) return <Loader />;

    const { data, author } = quizData;

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


    return (
        <>
            <Navbar />
            <div className="attending-wrapper">
                <div className="attending-card">
                    <div className="attending-header">
                        <h1 style={{ color: 'white', margin: 0, marginBottom: '5px' }}>{data.topic}</h1>
                        <h3 style={{ color: '#aaa', margin: 0, fontSize: '0.9rem' }}>Code: {data.number} • Created by {author}</h3>
                    </div>

                    <div className="quiz-layout">
                        <div className="question-navigator">
                            {data.questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`nav-item ${currentIndex === index ? 'active' : ''} ${answers[`question_${index}`] !== undefined ? 'answered' : ''}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <div className="question-display">
                            <form onSubmit={handleSubmit}>
                                {data.questions.map((question, index) => (
                                    <div
                                        key={index}
                                        id={`question_${index}`}
                                        style={{ display: index === currentIndex ? 'block' : 'none' }}
                                    >
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
                                                onClick={() => setCurrentIndex(index - 1)}
                                                className="nav-btn"
                                                disabled={index === 0}
                                                style={{ opacity: index === 0 ? 0 : 1 }}
                                            >
                                                <i className="fa fa-chevron-left"></i> Prev
                                            </button>

                                            {index < data.questions.length - 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentIndex(index + 1)}
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
                                    </div>
                                ))}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
