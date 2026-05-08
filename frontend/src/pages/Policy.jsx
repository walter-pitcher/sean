import { Link } from 'react-router-dom';
import './PublicPages.css';

export default function Policy() {
  return (
    <div className="public-page">
      <nav className="public-nav">
        <Link to="/landing" className="public-brand">
          <img src="/trutim.png" alt="Trutim" />
          <span>Trutim</span>
        </Link>
        <div className="public-nav-links">
          <Link to="/landing">Home</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/login">Sign In</Link>
        </div>
      </nav>
      <main className="public-content">
        <section className="public-card">
          <h1>Privacy Policy</h1>
          <p className="public-muted">
            This page summarizes how Trutim handles user information.
          </p>
          <h2>Data we use</h2>
          <p>Account profile data, room activity, and collaboration messages required to provide the service.</p>
          <h2>How we use data</h2>
          <p>To authenticate users, deliver chat/call features, and improve product reliability.</p>
          <h2>Your controls</h2>
          <p>You can update your profile settings and request account-related support through your team admin.</p>
        </section>
      </main>
    </div>
  );
}
