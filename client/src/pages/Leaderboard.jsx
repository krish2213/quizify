import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function Leaderboard() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'alltime';
    const page = parseInt(searchParams.get('page')) || 1;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [updatedAt, setUpdatedAt] = useState('');

    useEffect(() => {
        document.title = "Leaderboard - Quizify";
        fetchLeaderboard();
    }, [type, page]);

    const [limit, setLimit] = useState(10);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/leaderboard?type=${type}&page=${page}`);
            setData(res.data.data);
            setTotalPages(res.data.totalPages);
            setUpdatedAt(res.data.updatedAt);
            setLimit(res.data.limit || 10);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            {loading && <Loader />}
            <br /><br /><br />
            <h4 style={{ textAlign: 'center', color: 'white' }}><i>🕒Updated : {updatedAt}</i></h4>
            <div className="l-wrapper" style={{ margin: '0 auto', maxWidth: '750px' }}>
                <div className="c-card">
                    <div className="c-card__header">
                        <h2>{type === 'daily' ? '📅 Daily' : '🏆 All Time'} Leaderboard</h2>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Username</th>
                                    <th>{type === 'daily' ? 'Score' : 'Total Score'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((item, index) => {
                                        const rank = limit * (page - 1) + index + 1;
                                        let rankDisplay;
                                        if (rank === 1) rankDisplay = <span style={{ fontSize: '24px', paddingLeft: '10px' }}>🥇</span>;
                                        else if (rank === 2) rankDisplay = <span style={{ fontSize: '24px', paddingLeft: '10px' }}>🥈</span>;
                                        else if (rank === 3) rankDisplay = <span style={{ fontSize: '24px', paddingLeft: '10px' }}>🥉</span>;
                                        else rankDisplay = <span style={{ paddingLeft: '21px' }}>{rank}</span>;

                                        return (
                                            <tr key={item._id}>
                                                <td>{rankDisplay}</td>
                                                <td className="username">
                                                    <img className="profile-pic" src={item.profilePicture} alt="Profile" />
                                                    <Link to={`/profile/${item.username}`} style={{ textDecoration: 'none', color: '#7B16FF' }}>
                                                        {item.username}
                                                    </Link>
                                                </td>
                                                <td>{type === 'daily' ? item.score : item.totalScore}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No data available in leaderboard.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', padding: '20px', gap: '5px' }}>
                            {page > 1 ? (
                                <Link to={`?type=${type}&page=${page - 1}`} className="page-link" style={{ padding: '8px 16px', border: '1px solid var(--primary)', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>❮</Link>
                            ) : (
                                <span style={{ padding: '8px 16px', border: '1px solid gray', color: 'gray', borderRadius: '5px' }}>❮</span>
                            )}

                            <Link to={`?type=${type}&page=${page}`} style={{ padding: '8px 16px', border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>{page}</Link>

                            {page < totalPages ? (
                                <Link to={`?type=${type}&page=${page + 1}`} className="page-link" style={{ padding: '8px 16px', border: '1px solid var(--primary)', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>❯</Link>
                            ) : (
                                <span style={{ padding: '8px 16px', border: '1px solid gray', color: 'gray', borderRadius: '5px' }}>❯</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
