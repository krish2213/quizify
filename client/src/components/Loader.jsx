export default function Loader() {
    return (
        <div id="universal-loader" className="loader-overlay" style={{ display: 'flex' }}>
            <div className="loader-content">
                <img src="/logo.png" alt="Quizify Logo" className="loader-logo" />
                <div className="loader-spinner"></div>
                <p className="loader-text">Loading...</p>
            </div>
        </div>
    );
}
