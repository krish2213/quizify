import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <div className="navbar">
            <h2>QUIZIFY</h2>
            <div>
                {user ? (
                    <>
                        <Link id="home" to="/"><i className="fa-solid fa-house"></i> Home</Link>
                        <Link to="#" onClick={(e) => { e.preventDefault(); logout(); }}>
                            <i className="fa-solid fa-right-from-bracket"></i> Logout
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/login"><i className="fa fa-sign-in"></i> Login</Link>
                        <Link to="/register"><i className="fa fa-user"></i> Register</Link>
                    </>
                )}
            </div>
        </div>
    );
}
