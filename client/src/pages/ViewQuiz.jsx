import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

const ViewQuiz = () => {
    const { id } = useParams();
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizData();
    }, [id]);

    const fetchQuizData = async () => {
        try {
            const res = await api.get(`/api/viewquiz/${id}`);
            setQuizData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!quizData || !quizData.quizzes || quizData.quizzes.length === 0) return <div>Quiz not found</div>;

    const quiz = quizData.quizzes[0];
    const { usernames, scores, logouts } = quizData;

    return (
        <>
            <Navbar />
            <div className="build-quiz-wrapper">
                <div className="build-quiz-header">
                    <h1>Room Code: {quiz.number}</h1>
                </div>

                <div className="topic-group">
                    <h2 style={{ color: 'var(--white)' }}>Topic: {quiz.topic}</h2>
                </div>

                <div className="questions-list">
                    {quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="question-card">
                            <h3 style={{ marginBottom: '15px', color: 'var(--white)' }}>
                                {qIndex + 1}. {q.question}
                            </h3>
                            <div className="options-grid">
                                {q.options.map((option, optIndex) => (
                                    <div key={optIndex} className={`option-item ${optIndex === q.correctoption ? 'correct-flash' : ''}`} style={optIndex === q.correctoption ? { border: '1px solid #4ade80' } : {}}>
                                        <input
                                            type="radio"
                                            className="option-radio"
                                            name={`question-${qIndex}`}
                                            checked={optIndex === q.correctoption}
                                            disabled
                                        />
                                        <span className="option-text" style={{ cursor: 'default', color: optIndex === q.correctoption ? '#4ade80' : 'inherit' }}>
                                            {option}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="action-bar">
                    <Link to={`/updatequiz/${quiz._id}`}>
                        <button className="create-btn">
                            <i className="fa-solid fa-edit"></i> Edit Quiz
                        </button>
                    </Link>
                </div>

                <div className="attendance-container" style={{ background: 'var(--surface)', marginTop: '40px' }}>
                    <h3>Users Attended and Their Scores</h3>
                    <h5 style={{ color: '#ff4444' }}>* RED COLOR INDICATES CHEATING</h5>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usernames && usernames.length > 0 ? (
                                    usernames.map((name, i) => (
                                        <tr key={i} style={logouts[i] >= 2 ? { backgroundColor: 'rgba(255, 68, 68, 0.2)', color: '#ff4444' } : {}}>
                                            <td>{name}</td>
                                            <td>{scores[i]}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">No attempts yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewQuiz;
