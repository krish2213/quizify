import { useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function Warning() {
    useEffect(() => {
        document.title = "Warning!!!";
    }, []);

    return (
        <>
            <Navbar />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                padding: '20px'
            }}>
                <div style={{
                    background: '#16171A',
                    padding: '20px',
                    borderRadius: '10px',
                    width: '80%',
                    maxWidth: '600px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <h2 style={{ color: '#7B16FF', marginBottom: '20px' }}>
                        Tab Switching/Inactivity Detected
                    </h2>
                    <div style={{ marginBottom: '10px' }}>
                        <h2 style={{
                            fontSize: '1.2rem',
                            fontWeight: 'normal',
                            color: '#A3AFBF',
                            lineHeight: '1.6'
                        }}>
                            You have been logged out of the test due to tab switching or inactivity.
                            If this happens more than three times, your score will be set to 0.
                        </h2>
                    </div>
                </div>
            </div>
        </>
    );
}
