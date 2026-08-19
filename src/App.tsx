import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Program from "./pages/Program";
import Phase from "./pages/Phase";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import MagicLinkLanding from "./pages/MagicLinkLanding";
import Profile from "./pages/Profile";
import PostSurvey from "./pages/PostSurvey";
import Certificate from "./pages/Certificate";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public: the front door, the registration form, and the program itself */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/program" element={<Program />} />
        <Route path="/program/:slug" element={<Phase />} />

        {/* Magic link redirect landing — requires auth, no onboarding needed yet */}
        <Route
          path="/welcome"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <MagicLinkLanding />
            </ProtectedRoute>
          }
        />

        {/* Onboarding — requires auth, no onboarding needed yet */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected members-only routes */}
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Program />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-survey"
          element={
            <ProtectedRoute>
              <PostSurvey />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificate"
          element={
            <ProtectedRoute>
              <Certificate />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
