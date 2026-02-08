import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DailyChallenge = () => {
    useEffect(() => {
        document.title = "Daily Challenge";
    }, []);
    return (
        <>
            <Navbar />
            <div style={{
                color: 'white',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                paddingTop: '90px',
                paddingBottom: '40px'
            }}>
                <div className="container" style={{
                    width: '100%',
                    maxWidth: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '30px'
                }}>
                    {/* Daily Quiz Card */}
                    <div style={{
                        background: '#16171A',
                        borderRadius: '20px',
                        padding: '40px 20px',
                        width: '100%',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        textAlign: 'center',
                        transition: 'transform .2s ease'
                    }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            margin: '0 auto 20px auto',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            padding: '10px'
                        }}>
                            <img
                                src="https://res.cloudinary.com/di5q8uqqc/image/upload/v1756146015/quiz_qoaoxf.jpg"
                                alt="Quiz Icon"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                        <h2 style={{ margin: '15px 0 10px', color: '#7B16FF', fontSize: '24px', fontWeight: 'bold' }}>Daily Quiz</h2>
                        <p style={{ fontSize: '15px', marginBottom: '25px', color: '#ccc', lineHeight: '1.5' }}>
                            Test your knowledge with today's set of quiz questions!
                        </p>
                        <Link to="/dailyquiz">
                            <button style={{
                                background: '#7B16FF',
                                color: 'white',
                                padding: '12px 30px',
                                fontSize: '16px',
                                border: 'none',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all .2s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <i className="fa-solid fa-question-circle"></i>
                                Play Quiz
                            </button>
                        </Link>
                    </div>

                    {/* Sudoku Card */}
                    <div style={{
                        background: '#16171A',
                        borderRadius: '20px',
                        padding: '40px 20px',
                        width: '100%',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        textAlign: 'center',
                        transition: 'transform .2s ease'
                    }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            margin: '0 auto 20px auto',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            padding: '10px'
                        }}>
                            <img
                                src="https://res.cloudinary.com/di5q8uqqc/image/upload/v1756146004/sudoku_hyst00.png"
                                alt="Sudoku Icon"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <h2 style={{ margin: '15px 0 10px', color: '#7B16FF', fontSize: '24px', fontWeight: 'bold' }}>Mini Sudoku</h2>
                        <p style={{ fontSize: '15px', marginBottom: '25px', color: '#ccc', lineHeight: '1.5' }}>
                            Solve today's 6x6 Sudoku puzzle and challenge your logic!
                        </p>
                        <Link to="/sudoku">
                            <button style={{
                                background: '#7B16FF',
                                color: 'white',
                                padding: '12px 30px',
                                fontSize: '16px',
                                border: 'none',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all .2s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <i className="fa-solid fa-border-all"></i>
                                Play Sudoku
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DailyChallenge;
