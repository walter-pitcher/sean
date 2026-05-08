import { Link } from 'react-router-dom';
import './PublicPages.css';

export default function Terms() {
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
          <Link to="/policy">Policy</Link>
          <Link to="/login">Sign In</Link>
        </div>
      </nav>
      <main className="public-content">
        <section className="public-card">
          <h1>Terms of Use</h1>
          <p className="public-muted">
            By accessing Trutim, you agree to use the platform responsibly and follow your organization policies.
          </p>
          <h2>Acceptable use</h2>
          <p>Do not misuse the service, disrupt other users, or upload harmful or unauthorized content.</p>
          <h2>Account security</h2>
          <p>You are responsible for keeping your account credentials secure and reporting unauthorized access.</p>
          <h2>Service availability</h2>
          <p>We may update features over time to improve performance, security, and reliability.</p>
        </section>
      </main>
    </div>
  );
}
