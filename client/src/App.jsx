import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AttendQuiz from './pages/AttendQuiz';
import Attending from './pages/Attending';
import CreateQuiz from './pages/CreateQuiz';
import BuildQuiz from './pages/BuildQuiz';
import Loader from './components/Loader';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Challenge from './pages/Challenge';
import Challenges from './pages/Challenges';
import PlayChallenge from './pages/PlayChallenge';
import DailyChallenge from './pages/DailyChallenge';
import DailyQuiz from './pages/DailyQuiz';
import Sudoku from './pages/Sudoku';
import ViewQuizzes from './pages/ViewQuizzes';
import ViewQuiz from './pages/ViewQuiz';
import UpdateQuiz from './pages/UpdateQuiz';
import Stats1v1 from './pages/Stats1v1';
import EditProfile from './pages/EditProfile';
import VerifyAccount from './pages/VerifyAccount';
import SetPassword from './pages/SetPassword';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';
import Warning from './pages/Warning';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/verifyaccount/:token" element={
          <PublicRoute>
            <VerifyAccount />
          </PublicRoute>
        } />
        <Route path="/setpwd" element={
          <PublicRoute>
            <SetPassword />
          </PublicRoute>
        } />
        <Route path="/changepwd" element={
          <PublicRoute>
            <ChangePassword />
          </PublicRoute>
        } />
        <Route path="/resetpassword" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/attendquiz" element={
          <ProtectedRoute>
            <AttendQuiz />
          </ProtectedRoute>
        } />
        <Route path="/attending" element={
          <ProtectedRoute>
            <Attending />
          </ProtectedRoute>
        } />
        <Route path="/createquiz" element={
          <ProtectedRoute>
            <CreateQuiz />
          </ProtectedRoute>
        } />
        <Route path="/buildquiz" element={
          <ProtectedRoute>
            <BuildQuiz />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/editprofile" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />
        <Route path="/challenge" element={
          <ProtectedRoute>
            <Challenge />
          </ProtectedRoute>
        } />
        <Route path="/challenges" element={
          <ProtectedRoute>
            <Challenges />
          </ProtectedRoute>
        } />
        <Route path="/playchallenge/:id" element={
          <ProtectedRoute>
            <PlayChallenge />
          </ProtectedRoute>
        } />
        <Route path="/dailychallenge" element={
          <ProtectedRoute>
            <DailyChallenge />
          </ProtectedRoute>
        } />
        <Route path="/dailyquiz" element={
          <ProtectedRoute>
            <DailyQuiz />
          </ProtectedRoute>
        } />
        <Route path="/sudoku" element={
          <ProtectedRoute>
            <Sudoku />
          </ProtectedRoute>
        } />
        <Route path="/viewquizzes" element={
          <ProtectedRoute>
            <ViewQuizzes />
          </ProtectedRoute>
        } />
        <Route path="/viewquiz/:id" element={
          <ProtectedRoute>
            <ViewQuiz />
          </ProtectedRoute>
        } />
        <Route path="/updatequiz/:id" element={
          <ProtectedRoute>
            <UpdateQuiz />
          </ProtectedRoute>
        } />
        <Route path="/1v1stats/:username" element={<Stats1v1 />} />
        <Route path="/warning" element={<Warning />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
