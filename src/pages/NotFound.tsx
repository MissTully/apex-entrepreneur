import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-apex py-32 text-center">
      <p className="font-display text-7xl font-bold text-glow/30">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Adrift in open water</h1>
      <p className="mt-2 text-foam/70">This current doesn&apos;t lead anywhere. Swim back to the reef.</p>
      <Link to="/" className="btn-primary mt-8">
        Return home
      </Link>
    </div>
  );
}
