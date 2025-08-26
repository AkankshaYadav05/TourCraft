// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTour from "./pages/CreateTour";
import Analytics from "./pages/Analytics";
import PublicTour from "./pages/PublicTour";
import EditTour from "./pages/EditTour";

// Components
import ScreenRecorder from "./components/TourEditor/ScreenRecorder";
import TourStepEditor from "./components/TourEditor/TourStepEditor";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-tour"
            element={
              <ProtectedRoute>
                <CreateTour />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-tour/:id"
            element={
              <ProtectedRoute>
                <EditTour />
              </ProtectedRoute>
            }
          />

          {/* Public tour view */}
          <Route path="/tour/:shareUrl" element={<PublicTour />} />

          {/* Tour Editor tools */}
          <Route
            path="/editor/:id"
            element={
              <ProtectedRoute>
                <ScreenRecorder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:id/step"
            element={
              <ProtectedRoute>
                <TourStepEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
