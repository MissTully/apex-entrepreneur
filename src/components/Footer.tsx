export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-10">
      <div className="container-apex flex flex-col items-center justify-between gap-4 text-sm text-foam/60 sm:flex-row">
        <p>
          <span className="font-display font-semibold text-foam">Apex</span> · The Experiential
          Entrepreneurship Program
        </p>
        <p>Reef-Native · Tampa Bay · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
