import { Link } from 'react-router-dom';
import './PublicPages.css';

export default function Landing() {
  return (
    <div className="public-page">
      <nav className="public-nav">
        <Link to="/landing" className="public-brand">
          <img src="/trutim.png" alt="Trutim" />
          <span>Trutim</span>
        </Link>
        <div className="public-nav-links">
          <Link to="/faq">FAQ</Link>
          <Link to="/policy">Policy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/login">Sign In</Link>
        </div>
      </nav>

      <main className="public-content">
        <section className="public-card">
          <h1>Collaboration space for teams that build fast</h1>
          <p className="public-muted">
            Trutim brings chat, voice, and focused collaboration into one place. This page is shown when
            you are logged out.
          </p>

          <div className="public-actions">
            <Link to="/login" className="public-action-btn primary">Sign In</Link>
            <Link to="/register" className="public-action-btn">Create Account</Link>
            <Link to="/faq" className="public-action-btn">Read FAQ</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
