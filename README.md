<div style="display: flex; justify-content:center;align-items: center;">
  <img src="/public/logo.png" width="200" height="200" />
</div>

Take Daily Quiz, AI-powered or user-created quizzes, climb the leaderboards, and enjoy fair play with strict session management. Create, share, and challenge friends while following others to discover exciting new quizzes! 🎯🏆

## ✨ Features
- 📲 **Progressive Web App (PWA):** Users can install the app to their device with a custom install prompt for a native app-like experience.
- 🔐 **User Authentication:** Users register via email, and accounts are created after verification.
- 📩 **Welcome Mail:** A welcome email is sent upon successful registration.
- 🧠 **AI-Generated & User-Created Quizzes:** Users can take AI-generated quizzes or quizzes created by others using shared quiz codes.
- ❌ **Quiz Attempt Rules:** Users cannot retake the Daily Quiz on the same day; only one attempt is allowed.
- 🔄 **Strict Session Management Policy:**
  - **Daily Quiz (DQ):** Switching tabs more than 3 times will immediately end the quiz attempt and set the score to 0.
  - **User-Created Quizzes:** If the user switches tabs more than 2 times, the attempt will be marked as cheated. The score (regardless of correctness) will be shown to the quiz creator with a cheating flag.
- ✍️ **Quiz Creation & Sharing:** Users can create unlimited quizzes using AI or manual input and share quiz codes.
- 🏆 **Leaderboard:** Daily and overall leaderboards track top performers.
- ⏰ **Scheduling:** Leaderboard updates automatically at **12:24 AM** every day.
- 🔓 **Logout Feature:** Secure user logout functionality.
- 👥 **Follow Feature:** Users can follow others to keep track of their daily quizzes and scores.

## 🚀 Live Demo
- [https://quizify.azurewebsites.net/](https://quizify.azurewebsites.net/)

## 🛠 Technologies Used
- 🎨 **Frontend:** HTML, CSS, JavaScript
- ⚙️ **Backend:** Node.js (Express)
- 🗄 **Database:** MongoDB
- 🔑 **Authentication:** JWT / OAuth
- 📧 **Email Service:** Nodemailer
- ⏳ **Scheduling:** Nodecron
- ☁️ **Image Storage:** Cloudinary
- 🧠 **AI Integration:** GroqCloud API
- 🚀 **Deployment:** Microsoft Azure

## 🤝 Contributing
Contributions are welcome! 
🎉 Feel free to fork the repository and submit a pull request. 💡