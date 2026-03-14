import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
    useEffect(() => {
        document.title = "Page Not Found - Quizify";
    }, []);

    return (
        <div className="not-found-container">
            <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                <Link
                    to="/"
                    style={{
                        display: 'inline-block',
                        fontSize: '1.2rem',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        color: 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: '#7B16FF',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        transition: 'color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#e74c3c'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#7B16FF'}
                >
                    <i className="fa-solid fa-arrow-left"></i> Go back
                </Link>
            </div>
        </div>
    );
}
