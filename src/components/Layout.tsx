import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MentorPanel from "./MentorPanel";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MentorPanel />
    </div>
  );
}
