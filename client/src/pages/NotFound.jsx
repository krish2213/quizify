import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    useEffect(() => {
        document.title = "404 - Page Not Found";
    }, []);

    return (
        <div style={{
            backgroundImage: 'url(/404.jpeg)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            width: '100vw',
            margin: 0,
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60vh',
                textAlign: 'center',
                flexDirection: 'column'
            }}>
                <Link
                    to="/"
                    style={{
                        fontSize: '1.5rem',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        color: '#7B16FF',
                        transition: 'color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#e74c3c'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#7B16FF'}
                >
                    <i className="fa-solid fa-house"></i> Go back to the homepage
                </Link>
            </div>
        </div>
    );
}
