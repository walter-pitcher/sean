import { Link } from 'react-router-dom';
import './PublicPages.css';

export default function FAQ() {
  return (
    <div className="public-page">
      <nav className="public-nav">
        <Link to="/landing" className="public-brand">
          <img src="/trutim.png" alt="Trutim" />
          <span>Trutim</span>
        </Link>
        <div className="public-nav-links">
          <Link to="/landing">Home</Link>
          <Link to="/policy">Policy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/login">Sign In</Link>
        </div>
      </nav>
      <main className="public-content">
        <section className="public-card">
          <h1>Frequently Asked Questions</h1>
          <ul className="public-list">
            <li><strong>What is Trutim?</strong><br />A real-time collaboration app with chat and calls.</li>
            <li><strong>Do I need an account?</strong><br />Yes, sign in or register to access private rooms.</li>
            <li><strong>Can I use OAuth?</strong><br />Yes, Google and GitHub sign-in are supported.</li>
            <li><strong>Where can I review privacy details?</strong><br />See the Policy page from the top menu.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
