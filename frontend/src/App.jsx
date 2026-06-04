import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Movies from "./pages/Movies";
import Wishlist from "./pages/Wishlist";
import Friends from "./pages/Friends";
import GlobalChat from "./pages/GlobalChat";
import DirectMessage from "./pages/DirectMessage";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Recommendations from "./pages/Recommendations";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import SendNotification from "./pages/admin/SendNotification";
import ManageMovies from "./pages/admin/ManageMovies";
import ModerateReviews from "./pages/admin/ModerateReviews";
import UserDetail from "./pages/admin/UserDetail";
import Watch from "./pages/Watch";
import Search from "./pages/Search";
import ActivityFeed from "./pages/ActivityFeed";
import Leaderboards from "./pages/Leaderboards";
import Analytics from "./pages/Analytics";
import YearInReview from "./pages/YearInReview";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Challenges from "./pages/Challenges";
import Achievements from "./pages/Achievements";
import NotificationSettings from "./pages/NotificationSettings";
import Footer from "./components/Footer";

// ProtectedRoute definition...
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <div className="flex flex-col min-h-screen">
                <main className="flex-grow flex flex-col">
                  <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/global-chat"
            element={
              <ProtectedRoute>
                <GlobalChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:friendId"
            element={
              <ProtectedRoute>
                <DirectMessage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminRoute>
                <SendNotification />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/movies"
            element={<AdminRoute><ManageMovies /></AdminRoute>}
          />
          <Route
            path="/admin/reviews"
            element={<AdminRoute><ModerateReviews /></AdminRoute>}
          />
          <Route
            path="/admin/users/:id"
            element={<AdminRoute><UserDetail /></AdminRoute>}
          />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityFeed />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/year-in-review"
            element={
              <ProtectedRoute>
                <YearInReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections/:id"
            element={
              <ProtectedRoute>
                <CollectionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <Challenges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification-settings"
            element={
              <ProtectedRoute>
                <NotificationSettings />
              </ProtectedRoute>
            }
          />
                  <Route path="/user/:id" element={<UserProfile />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
