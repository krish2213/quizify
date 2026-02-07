import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const ViewQuizzes = () => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            document.title = `Quizzes - ${user.username}`;
            fetchQuizzes();
        }
    }, [user]);

    const fetchQuizzes = async () => {
        try {
            const res = await api.get(`/api/viewquizzes/${user._id}`);
            setQuizzes(res.data.quizzes || []);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching quizzes");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (code) => {
        const link = `https://quizify.azurewebsites.net/attendquiz?quizcode=${code}`;
        navigator.clipboard.writeText(link).then(() => {
            toast.success('Link copied to clipboard! Anyone with this link can attend Quiz');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast.error("Failed to copy link");
        });
    };

    if (loading) return <Loader />;

    return (
        <>
            <Navbar />
            <div className="navbar-spacer"></div>
            <br /><br /><br />
            <h1>Your Quizzes</h1>
            {quizzes.length === 0 ? (
                <div className="quiz-container">
                    <div className="quiz-header">
                        <h2>No Quizzes Found</h2>
                    </div>
                </div>
            ) : (
                quizzes.map((quiz, index) => (
                    <div key={quiz._id}>
                        <div className="quiz-container">
                            <div className="quiz-header">
                                <h2>{index + 1}. {quiz.topic}</h2>
                                <p><strong>Room Code:</strong> {quiz.number}</p>
                                <Link to={`/viewquiz/${quiz._id}`}>
                                    <button style={{ width: '30%' }}>View</button>
                                </Link>
                                <span onClick={() => copyToClipboard(quiz.number)}>
                                    <button style={{ width: '30%', marginLeft: '10px' }}>Share</button>
                                </span>
                            </div>
                        </div>
                        <br />
                    </div>
                ))
            )}
        </>
    );
};

export default ViewQuizzes;
