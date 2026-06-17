import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Program from "./pages/Program";
import Phase from "./pages/Phase";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
          <Routes>
                <Route element={<Layout />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/program" element={<Program />} />
                        <Route path="/program/:slug" element={<Phase />} />
                        <Route
                                    path="/onboarding"
                                    element={
                                                  <ProtectedRoute requireOnboarding={false}>
                                                                <Onboarding />
                                                  </ProtectedRoute>ProtectedRoute>
                          }
                                />
                                <Route
                                            path="/members"
                                            element={
                                                          <ProtectedRoute>
                                                                        <Program />
                                                          </ProtectedRoute>ProtectedRoute>
                                  }
                                        />
                                        <Route path="*" element={<NotFound />} />
                                </Route>Route>
                        </Route>Routes>
                  );
                  }</Routes>
