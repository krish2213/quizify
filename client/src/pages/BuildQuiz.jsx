import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function BuildQuiz() {
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resultMsg, setResultMsg] = useState('');

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question: '',
                options: ['', '', '', ''],
                correct: 0
            }
        ]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questions.length === 0) return;

        setLoading(true);
        const payload = {
            topic,
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                correctoption: parseInt(q.correct)
            }))
        };

        try {
            const res = await api.post('/api/generatequiz', payload);
            if (res.data.number) {
                setResultMsg(`Your quiz code : ${res.data.number}`);
                setQuestions([]);
                setTopic('');
            } else {
                setResultMsg("Error generating quiz");
            }
        } catch (err) {
            console.error(err);
            setResultMsg("Error generating quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            {loading && <Loader />}
            <div className="build-quiz-wrapper">
                <div className="build-quiz-header">
                    <h1>Create Your Own Quiz</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="topic-group">
                        <input
                            type="text"
                            className="topic-input"
                            placeholder="Enter Quiz Topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>

                    <div className="questions-list">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="question-card">
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeQuestion(qIndex)}
                                    title="Remove Question"
                                >
                                    <i className="fa-solid fa-times"></i>
                                </button>

                                <input
                                    type="text"
                                    className="question-input"
                                    placeholder={`Question ${qIndex + 1}`}
                                    value={q.question}
                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                    required
                                />

                                <div className="options-grid">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="option-item">
                                            <input
                                                type="radio"
                                                className="option-radio"
                                                name={`correct-${qIndex}`}
                                                value={oIndex}
                                                checked={q.correct == oIndex}
                                                onChange={() => updateQuestion(qIndex, 'correct', oIndex)}
                                                required
                                            />
                                            <input
                                                type="text"
                                                className="option-text"
                                                placeholder={`Option ${oIndex + 1}`}
                                                value={opt}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="action-bar">
                        <button type="button" className="add-btn" onClick={addQuestion}>
                            <i className="fa-solid fa-plus"></i> Add Question
                        </button>

                        {questions.length > 0 && (
                            <button type="submit" className="create-btn">
                                <i className="fa-solid fa-check"></i> Create Quiz
                            </button>
                        )}
                    </div>

                    {resultMsg && (
                        <div className="success-msg">
                            <h2>{resultMsg}</h2>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}
