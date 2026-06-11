import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Program from "./pages/Program";
import Phase from "./pages/Phase";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/program" element={<Program />} />
        <Route path="/program/:slug" element={<Phase />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
