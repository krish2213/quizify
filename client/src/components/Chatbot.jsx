import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Chatbot() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            setMessages([{
                sender: 'bot',
                text: `Hey ${user.username}!😊 I'm QBot. You can ask me things like "go to my profile", "open today's quiz", to help you navigate Quizify. I'm here to make your experience easier and more fun!`
            }]);
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);
    const toggleSize = () => setIsMaximized(!isMaximized);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post('/api/chat', { messages: input });
            const reply = res.data.reply;
            const lowerReply = reply.trim().toLowerCase();
            let navigating = false;

            if (lowerReply === "daily quiz") {
                navigate('/dailychallenge');
                navigating = true;
            } else if (lowerReply === "ai quiz") {
                navigate('/createquiz');
                navigating = true;
            } else if (lowerReply === "user quiz") {
                navigate('/buildquiz');
                navigating = true;
            } else if (lowerReply === "daily leaderboard") {
                navigate('/leaderboard?type=daily');
                navigating = true;
            } else if (lowerReply === "all time leaderboard") {
                navigate('/leaderboard?type=alltime');
                navigating = true;
            } else if (lowerReply === "profile") {
                navigate(`/profile/${user.username}`);
                navigating = true;
            } else if (lowerReply === "userquizzes") {
                navigate('/viewquizzes');
                navigating = true;
            }

            const botText = navigating ? `going to ${reply}...` : reply;
            setMessages(prev => [...prev, { sender: 'bot', text: botText }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Oops! Something went wrong." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <button
                className="chatbot-toggle-btn"
                onClick={toggleChat}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#7B16FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    fontSize: '28px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}
            >
                🤖
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: isMaximized ? '0' : '80px',
                    right: isMaximized ? '0' : '20px',
                    left: window.innerWidth <= 768 ? '0' : 'auto',
                    width: window.innerWidth <= 768 ? '100%' : '320px',
                    height: isMaximized ? '100vh' : (window.innerWidth <= 768 ? '70vh' : '400px'),
                    background: 'white',
                    color: 'black',
                    borderRadius: window.innerWidth <= 768 ? '0' : '16px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 10000,
                    fontFamily: 'Arial, sans-serif',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 15px',
                        backgroundColor: '#7B16FF',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '18px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            QBot <img src="/logo.png" width="30" height="30" alt="logo" style={{ verticalAlign: 'middle' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center' }} onClick={toggleSize} title={isMaximized ? "Minimize" : "Maximize"}>
                                <i className={`fas fa-${isMaximized ? 'compress' : 'expand'}`}></i>
                            </span>
                            <span style={{ cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center' }} onClick={toggleChat} title="Close">
                                <i className="fas fa-times"></i>
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        padding: '15px',
                        backgroundColor: '#fafafa',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    backgroundColor: msg.sender === 'user' ? '#7B16FF' : '#f1f0f0', // User purple, bot gray
                                    color: msg.sender === 'user' ? 'white' : 'black',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    maxWidth: '80%',
                                    wordBreak: 'break-word',
                                    fontSize: '14px',
                                    textAlign: 'left'
                                }}>
                                    <b>{msg.sender === 'bot' ? 'QBot: ' : 'You: '}</b>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ fontStyle: 'italic', color: '#999', fontSize: '12px', textAlign: 'left' }}>
                                QBot is typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        borderTop: '1px solid #eee',
                        padding: '0',
                        display: 'flex',
                        height: '60px',
                        background: 'white'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                padding: '0 15px',
                                fontSize: '16px',
                                background: 'white',
                                color: 'black',
                                margin: 0,
                                borderRadius: 0,
                                height: '100%'
                            }}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={sendMessage}
                            style={{
                                width: '60px',
                                border: 'none',
                                background: '#7B16FF',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '20px',
                                margin: 0,
                                borderRadius: 0,
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
