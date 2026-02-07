import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Sudoku = () => {
    const [puzzle, setPuzzle] = useState(null);
    const [solution, setSolution] = useState(null);
    const [userInputs, setUserInputs] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [solved, setSolved] = useState(false);
    const [caption, setCaption] = useState('');
    const [wrongCells, setWrongCells] = useState(new Set());

    useEffect(() => {
        fetchSudoku();
    }, []);

    const fetchSudoku = async () => {
        try {
            const res = await api.get('/api/sudoku');
            if (res.data.solved) {
                setSolved(true);
                setCaption(res.data.caption);
            } else {
                setPuzzle(res.data.puzzle);
                setSolution(res.data.solution);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load Sudoku');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (r, c, value) => {
        if (!/^[1-6]?$/.test(value)) return;

        setUserInputs(prev => ({
            ...prev,
            [`${r}-${c}`]: value
        }));

        if (wrongCells.has(`${r}-${c}`)) {
            const newWrong = new Set(wrongCells);
            newWrong.delete(`${r}-${c}`);
            setWrongCells(newWrong);
        }
    };

    const checkSolution = async () => {
        let isCorrect = true;
        const newWrongCells = new Set();
        const inputs = { ...userInputs };

        if (!solution) return;

        solution.forEach((row, r) => {
            row.forEach((solVal, c) => {
                const puzzleVal = puzzle[r][c];
                if (puzzleVal === 0) {
                    const userVal = inputs[`${r}-${c}`];
                    if (userVal !== solVal.toString()) {
                        isCorrect = false;
                        newWrongCells.add(`${r}-${c}`);
                    }
                }
            });
        });

        setWrongCells(newWrongCells);

        if (isCorrect) {
            let allFilled = true;
            puzzle.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val === 0 && !inputs[`${r}-${c}`]) {
                        allFilled = false;
                    }
                });
            });

            if (!allFilled) {
                toast.warning("Please fill all cells!");
                return;
            }

            try {
                const res = await api.post('/api/sudoku', { solved: true });
                if (res.data.solved) {
                    setSolved(true);
                    setCaption(res.data.caption);
                    toast.success("Correct Solution! 🎉🎉");
                }
            } catch (err) {
                console.error(err);
                toast.error("Error submitting solution");
            }
        } else {
            toast.error("Some cells are incorrect ❌");
            setTimeout(() => {
                setWrongCells(new Set());
            }, 5000);
        }
    };

    // Launch confetti effect
    const launchConfetti = () => {
        const duration = 10 * 1000; // 10 seconds
        const end = Date.now() + duration;
        let animationId;

        (function frame() {
            if (window.confetti) {
                // Left side confetti
                window.confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 30,
                    origin: { x: 0 }
                });
                // Right side confetti
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
        if (solved) {
            cleanup = launchConfetti();
        }
        return () => {
            if (cleanup) cleanup();
        };
    }, [solved]);


    if (loading) return <Loader />;

    if (error) return (
        <>
            <Navbar />
            <div className="state-message">
                <h3>{error}</h3>
                <Link to="/">
                    <button className="nav-btn primary">Go Home</button>
                </Link>
            </div>
        </>
    );

    if (solved) {
        return (
            <>
                <Navbar />
                <div className="state-message">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        {caption || "Solved!"}
                    </h1>
                    <Link to="/">
                        <button className="nav-btn primary">BACK TO HOME</button>
                    </Link>
                </div>
            </>
        );
    }

    if (!puzzle) return (
        <>
            <Navbar />
            <div className="state-message">
                <h3>No Sudoku Found</h3>
                <Link to="/">
                    <button className="nav-btn primary">Go Home</button>
                </Link>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="sudoku-wrapper">
                <div className="sudoku-card">
                    <div className="sudoku-header">
                        <h1>Mini Sudoku</h1>
                    </div>

                    <div className="sudoku-board">
                        {puzzle.map((row, r) => (
                            row.map((val, c) => {
                                const isPrefilled = val !== 0;
                                const cellId = `${r}-${c}`;
                                const isWrong = wrongCells.has(cellId);

                                return (
                                    <input
                                        key={cellId}
                                        type="text"
                                        maxLength="1"
                                        value={isPrefilled ? val : userInputs[cellId] || ''}
                                        disabled={isPrefilled}
                                        onChange={(e) => handleInputChange(r, c, e.target.value)}
                                        className={`sudoku-cell ${isPrefilled ? 'prefilled' : ''} ${isWrong ? 'wrong' : ''}`}
                                    />
                                );
                            })
                        ))}
                    </div>

                    <button
                        onClick={checkSolution}
                        className="check-btn"
                    >
                        Check Solution
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sudoku;
