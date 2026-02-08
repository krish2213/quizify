import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const UpdateQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        fetchQuizData();
    }, [id]);

    const fetchQuizData = async () => {
        try {
            const res = await api.get(`/api/viewquiz/${id}`);
            if (res.data && res.data.quizzes && res.data.quizzes.length > 0) {
                setQuizData(res.data.quizzes[0]);
                setQuestions(res.data.quizzes[0].questions.map(q => ({
                    question: q.question,
                    options: [...q.options],
                    correctoption: q.correctoption
                })));
            } else {
                toast.error("Quiz not found");
                navigate('/viewquizzes');
            }
        } catch (err) {
            console.error(err);
            toast.error("Error fetching quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionChange = (index, value) => {
        const updated = [...questions];
        updated[index].question = value;
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const handleCorrectChange = (qIndex, oIndex) => {
        const updated = [...questions];
        updated[qIndex].correctoption = oIndex;
        setQuestions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put(`/api/viewquiz/${id}`, { questions });
            if (res.data.success) {
                toast.success("Quiz updated successfully!");
                navigate(`/viewquiz/${id}`);
            } else {
                toast.error("Failed to update quiz");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error updating quiz");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!quizData) return <div>Quiz not found</div>;

    return (
        <>
            <Navbar />
            <div className="build-quiz-wrapper">
                <div className="build-quiz-header">
                    <h1>Edit Quiz: {quizData.number}</h1>
                </div>

                <div className="topic-group">
                    <h2 style={{ color: 'var(--white)', marginBottom: '10px' }}>Topic: {quizData.topic}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="questions-list">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="question-card">
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--primary)' }}>
                                    <strong>Question {qIndex + 1}</strong>
                                </label>
                                <input
                                    type="text"
                                    className="question-input"
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                    required
                                />

                                <div className="options-grid">
                                    {q.options.map((option, optIndex) => (
                                        <div key={optIndex} className="option-item">
                                            <input
                                                type="radio"
                                                className="option-radio"
                                                name={`correct-${qIndex}`}
                                                checked={optIndex === q.correctoption}
                                                onChange={() => handleCorrectChange(qIndex, optIndex)}
                                            />
                                            <input
                                                type="text"
                                                className="option-text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="action-bar">
                        <button type="submit" className="create-btn">
                            <i className="fa-solid fa-save"></i> Update Quiz
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UpdateQuiz;
