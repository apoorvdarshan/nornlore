import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Nornlore",
};

export default function Privacy() {
  return (
    <div className="paper legal-page">
      <div className="legal-header">
        <Link href="/" className="legal-home-link">
          <div className="masthead-logo">Nornlore</div>
        </Link>
      </div>

      <div className="legal-body">
        <h1 className="legal-title">Privacy Policy</h1>

        <p className="legal-date">Last updated: March 2026</p>

        <h2 className="legal-heading">I. What We Collect</h2>
        <p>Nornlore does not collect, store, or transmit any personal data. We do not use cookies, analytics, tracking pixels, or any form of user identification. The date you enter stays in your browser and is never sent to any server.</p>

        <h2 className="legal-heading">II. Third-Party Services</h2>
        <p>Nornlore fetches data from the following third-party services at runtime:</p>
        <ul>
          <li><strong>Wikipedia API</strong> — to fetch article extracts and thumbnail images. Wikipedia&apos;s own privacy policy applies to these requests.</li>
          <li><strong>Google Fonts</strong> — to load typefaces. Google&apos;s privacy policy applies.</li>
        </ul>
        <p>These services may log your IP address according to their own policies. We have no control over this.</p>

        <h2 className="legal-heading">III. Local Storage</h2>
        <p>Nornlore does not use localStorage, sessionStorage, or IndexedDB. No data persists on your device between sessions.</p>

        <h2 className="legal-heading">IV. Children</h2>
        <p>Nornlore is suitable for all ages. Since we collect no data, there are no special provisions needed for children under 13.</p>

        <h2 className="legal-heading">V. Changes</h2>
        <p>We may update this policy if the site&apos;s functionality changes. Any updates will be reflected on this page.</p>

        <h2 className="legal-heading">VI. Contact</h2>
        <p>Questions? Reach out at <a href="mailto:ad13dtu@gmail.com">ad13dtu@gmail.com</a>.</p>

        <div className="legal-back">
          <Link href="/">← Return to the Front Page</Link>
        </div>
      </div>
    </div>
  );
}
