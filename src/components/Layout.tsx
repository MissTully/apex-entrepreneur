import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MentorPanel from "./MentorPanel";

export default function Layout() {
    return (
          <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1"><Outlet /></main>main>
                <Footer />
                <MentorPanel />
          </div>div>
        );
}</div>
