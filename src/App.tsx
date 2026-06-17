import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
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
                        <Route path="/" element={<Register />} />
                        <Route path="/program" element={<Program />} />
                        <Route path="/program/:slug" element={<Phase />} />
                
                  {/* Magic link redirect landing — requires auth, no onboarding needed yet */}
                        <Route
                                    path="/welcome"
                                    element={
                                                  <ProtectedRoute requireOnboarding={false}>
                                                                <MagicLinkLanding />
                                                  </ProtectedRoute>ProtectedRoute>
                          }
                                />
                        
                          {/* Onboarding — requires auth, no onboarding needed yet */}
                                <Route
                                            path="/onboarding"
                                            element={
                                                          <ProtectedRoute requireOnboarding={false}>
                                                                        <Onboarding />
                                                          </ProtectedRoute>ProtectedRoute>
                                  }
                                        />
                                
                                  {/* Protected members-only routes */}
                                        <Route
                                                    path="/members"
                                                    element={
                                                                  <ProtectedRoute>
                                                                                <Program />
                                                                  </ProtectedRoute>ProtectedRoute>
                                          }
                                                />
                                                <Route
                                                            path="/profile"
                                                            element={
                                                                          <ProtectedRoute>
                                                                                        <Profile />
                                                                          </ProtectedRoute>ProtectedRoute>
                                                  }
                                                        />
                                                        <Route
                                                                    path="/post-survey"
                                                                    element={
                                                                                  <ProtectedRoute>
                                                                                                <PostSurvey />
                                                                                  </ProtectedRoute>ProtectedRoute>
                                                          }
                                                                />
                                                                <Route
                                                                            path="/certificate"
                                                                            element={
                                                                                          <ProtectedRoute>
                                                                                                        <Certificate />
                                                                                            </ProtectedRoute>ProtectedRoute>
                                                                  }
                                                                        />
                                                                
                                                                        <Route path="*" element={<NotFound />} />
                                                                </Route>Route>
                                                        </Route>Routes>
                                                  );
                                                  }</Routes>
