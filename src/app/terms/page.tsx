import Link from "next/link";

export const metadata = {
  title: "Terms of Use — Nornlore",
};

export default function Terms() {
  return (
    <div className="paper legal-page">
      <div className="legal-header">
        <Link href="/" className="legal-home-link">
          <div className="masthead-logo">Nornlore</div>
        </Link>
      </div>

      <div className="legal-body">
        <h1 className="legal-title">Terms of Use</h1>

        <p className="legal-date">Last updated: March 2026</p>

        <h2 className="legal-heading">I. Acceptance</h2>
        <p>By using Nornlore, you agree to these terms. If you disagree, please do not use the site.</p>

        <h2 className="legal-heading">II. Nature of Content</h2>
        <p>Nornlore is a fun, entertainment project. The historical facts presented (births, events, music releases, movie releases) are real and sourced from publicly available data including Wikipedia. However, all magical theming, wizarding references, fictional advertisements, weather reports, notices, and newspaper styling are purely satirical and for entertainment purposes only. No affiliation with any fictional or real wizarding institutions is claimed or implied.</p>

        <h2 className="legal-heading">III. Accuracy</h2>
        <p>While we strive for accuracy, historical data is provided &ldquo;as is&rdquo; without warranty. We source information from Wikipedia and other public sources. Errors may exist. Do not rely on Nornlore as a primary historical reference.</p>

        <h2 className="legal-heading">IV. Intellectual Property</h2>
        <p>The Nornlore name, design, and original code are the property of Apoorv Darshan. Historical facts are in the public domain. Wikipedia content is used under the Creative Commons Attribution-ShareAlike license. Images are fetched from Wikipedia at runtime and remain the property of their respective copyright holders.</p>

        <h2 className="legal-heading">V. Open Source</h2>
        <p>The source code for Nornlore is open source and available on <a href="https://github.com/aopv/nornlore" target="_blank" rel="noopener noreferrer">GitHub</a>. Contributions are welcome.</p>

        <h2 className="legal-heading">VI. Limitation of Liability</h2>
        <p>Nornlore is provided free of charge, as is, without any warranties. We are not liable for any damages arising from the use of this site.</p>

        <h2 className="legal-heading">VII. Changes</h2>
        <p>We may update these terms at any time. Continued use of the site constitutes acceptance of updated terms.</p>

        <div className="legal-back">
          <Link href="/">← Return to the Front Page</Link>
        </div>
      </div>
    </div>
  );
}
