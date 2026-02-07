import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [followersList, setFollowersList] = useState([]);

    const [rank, setRank] = useState(0);

    useEffect(() => {
        document.title = `${username} - Quizify Profile`;
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/profile/${username}`);
            setProfileUser(res.data.user);
            setIsFollowing(res.data.check);
            setFollowersCount(res.data.user.followers.length);
            setRank(res.data.rank);
            setFollowersList(res.data.followersList);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            if (currentUser) {
                const res = await api.post(`/api/follow/${profileUser._id}`);
                setIsFollowing(res.data.check);
                setFollowersCount(res.data.followers);
                const res1 = await api.get(`/api/profile/${username}`);
                setFollowersList(res1.data.followersList);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <Loader />;
    if (!profileUser) return <h2 style={{ color: 'white', textAlign: 'center' }}>User not found</h2>;

    const isMe = currentUser && currentUser.username === profileUser.username;

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <div className="profile-card">
                    <div className="avatar-holder">
                        <img src={profileUser.profilePicture} alt="Profile" />
                    </div>
                    <div className="name">
                        {profileUser.username}
                        <br /><br />
                        <p>
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }}>
                                <i className="fas fa-users"></i> {followersCount} {followersCount === 1 ? "Follower" : "Followers"}
                            </a>
                        </p>
                    </div>

                    <div className="button">
                        {!isMe ? (
                            <>
                                <button className="prof-btn" onClick={handleFollow}>
                                    {isFollowing ? (
                                        <>Following <i className="fas fa-user-check"></i></>
                                    ) : (
                                        <>Follow <i className="fas fa-user-plus"></i></>
                                    )}
                                </button>
                                <Link to={`/1v1stats/${profileUser.username}`}>
                                    <button className="prof-btn" style={{ marginLeft: '5px' }}>1v1 Stats <i className="fa-solid fa-chart-pie"></i></button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/editprofile">
                                    <button className="prof-btn">Edit Profile <i className="fas fa-user-edit"></i></button>
                                </Link>
                                <Link to={`/1v1stats/${profileUser.username}`}>
                                    <button className="prof-btn" style={{ marginLeft: '5px' }}>1v1 Stats <i className="fa-solid fa-chart-pie"></i></button>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="ds-info">
                        <div>
                            <h4>Rank</h4>
                            <p>{rank}</p>
                        </div>
                        <div>
                            <h4>Score</h4>
                            <p>{profileUser.totalScore}</p>
                        </div>
                        <div>
                            <h4>XP</h4>
                            <p>{profileUser.xp}</p>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal" style={{ display: 'flex' }} onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Followers</h3>
                            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <div className="followers-list">
                            {followersList.map((f, i) => (
                                <div className="follower-item" key={i}>
                                    <img src={f.profilePicture} alt="Pic" />
                                    <Link to={`/profile/${f.username}`} onClick={() => setShowModal(false)}>{f.username}</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
