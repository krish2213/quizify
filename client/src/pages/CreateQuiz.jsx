import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function CreateQuiz() {
    const [topic, setTopic] = useState('');
    const [count, setCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [quizCode, setQuizCode] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = "CREATE QUIZ";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setQuizCode(null);
        setError('');

        try {
            const res = await api.post(`/api/generate-quiz`, { count, topic });
            if (res.data.success) {
                setQuizCode(res.data.number);
            } else {
                setError("Failed to generate quiz.");
            }
        } catch (err) {
            console.log(err);
            setError("An error occurred. AI might be busy.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            {loading && <Loader />}
            <br /><br /><br /><br />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px', width: '350px', textAlign: 'center' }}>
                    <label htmlFor="quiztopic">
                        <h2>Enter Quiz Topic : </h2>
                    </label>
                    <input
                        type="text"
                        id="quiztopic"
                        name="quiztopic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        autoFocus
                        required
                        placeholder="Enter Quiz Topic"
                        style={{ padding: '10px', marginTop: '5px', border: '1px solid var(--dark)', borderRadius: '5px', background: 'var(--darker)', color: 'var(--white)', fontSize: '1rem', outline: 'none' }}
                    />

                    <label htmlFor="qcount">
                        <h2>Number of Questions:</h2>
                    </label>
                    <div style={{ alignItems: 'center' }}>
                        <select
                            id="qcount"
                            name="qcount"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            required
                            style={{ padding: '10px', fontWeight: 'bold', fontSize: '15px' }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                    <br />
                    <button type="submit" style={{ padding: '10px', border: 'none', borderRadius: '5px', background: 'var(--primary)', color: 'var(--white)', cursor: 'pointer' }}>CREATE QUIZ</button>
                    <br />
                    {quizCode ? (
                        <p>Your Quiz code is : {quizCode}</p>
                    ) : (
                        <p><i>Note: AI can make mistakes</i></p>
                    )}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            </div>
        </>
    );
}
