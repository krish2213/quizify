import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function Stats1v1() {
    const { username } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        document.title = `1v1 Stats - ${username}`;
        fetchStats();
    }, [username]);

    useEffect(() => {
        let mounted = true;

        if (stats && chartRef.current && stats.won + stats.lost + stats.draw > 0) {
            Promise.all([
                import('chart.js'),
                import('chartjs-plugin-datalabels')
            ]).then(([ChartModule, DataLabelsModule]) => {
                if (!mounted || !chartRef.current) return;

                const { Chart, DoughnutController, ArcElement, Tooltip, Legend } = ChartModule;
                const ChartDataLabels = DataLabelsModule.default;

                Chart.register(DoughnutController, ArcElement, Tooltip, Legend, ChartDataLabels);

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                    chartInstance.current = null;
                }

                const ctx = chartRef.current.getContext('2d');
                chartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Won', 'Draw', 'Lost'],
                        datasets: [{
                            data: [stats.won, stats.draw, stats.lost],
                            backgroundColor: ['green', 'gray', 'red'],
                            borderColor: ['black', 'black', 'black'],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        cutout: '60%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: 'white',
                                    font: {
                                        size: 12
                                    }
                                }
                            },
                            datalabels: {
                                color: 'white',
                                font: {
                                    weight: 'bold',
                                    size: 14
                                },
                                formatter: (value) => {
                                    return value > 0 ? value : '';
                                }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            }).catch(err => {
                console.error('Failed to load Chart.js:', err);
            });
        }

        return () => {
            mounted = false;
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [stats]);

    const fetchStats = async () => {
        try {
            const res = await api.get(`/api/1v1stats/${username}`);
            setStats(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <>
                <Navbar />
                <div style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
                    <h2>{error}</h2>
                    <Link to="/" style={{ color: 'var(--primary)' }}>Go Home</Link>
                </div>
            </>
        );
    }

    if (!stats) {
        return (
            <>
                <Navbar />
                <div style={{ textAlign: 'center', marginTop: '100px', color: 'white' }}>
                    <h2>No data available</h2>
                </div>
            </>
        );
    }

    const hasNoStats = stats.won === 0 && stats.lost === 0 && stats.draw === 0;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#101010' }}>
            <Navbar />
            <div style={{
                color: 'white',
                textAlign: 'center',
                paddingTop: '100px',
                paddingBottom: '40px'
            }}>
                {hasNoStats ? (
                    <div style={{
                        maxWidth: '360px',
                        margin: 'auto',
                        backgroundColor: '#16171A',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h2 style={{ marginBottom: '20px', color: '#7B16FF' }}>
                            1v1 Stats - {stats.username}
                        </h2>
                        <br />
                        <p style={{ fontSize: '18px', marginTop: '20px' }}>
                            No Stats Found!
                        </p>
                        <Link to="/challenge" style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#7B16FF',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '10px',
                            fontWeight: 'bold'
                        }}>
                            Start Challenging
                        </Link>
                    </div>
                ) : (
                    <>
                        <div style={{
                            maxWidth: '360px',
                            margin: 'auto',
                            backgroundColor: '#16171A',
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h2 style={{ marginBottom: '20px', color: '#7B16FF' }}>
                                1v1 Stats - {stats.username}
                            </h2>
                            <canvas ref={chartRef} style={{ maxHeight: '300px' }}></canvas>
                        </div>

                        {stats.recentform && stats.recentform.length > 0 && (
                            <div style={{ marginTop: '30px' }}>
                                <h3 style={{
                                    color: '#7B16FF',
                                    marginBottom: '12px',
                                    fontSize: '18px'
                                }}>
                                    Last 5 Results
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}>
                                    {stats.recentform.map((result, index) => {
                                        let content = '';
                                        let bgColor = '';

                                        if (result === 1) {
                                            content = '✔';
                                            bgColor = 'green';
                                        } else if (result === -1) {
                                            content = '✖';
                                            bgColor = 'red';
                                        } else {
                                            content = '━';
                                            bgColor = '#888';
                                        }

                                        return (
                                            <span
                                                key={index}
                                                style={{
                                                    fontSize: '20px',
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: bgColor,
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '900',
                                                    boxShadow: '0 0 8px rgba(255,255,255,0.3)'
                                                }}
                                            >
                                                {content}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
