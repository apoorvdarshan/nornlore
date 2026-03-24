import Link from "next/link";

export const metadata = {
  title: "Terms of Use — Nornlore",
};

export default function Terms() {
  return (
    <div className="paper" style={{ maxWidth: 960, margin: "0 auto", padding: 0 }}>
      <div style={{ textAlign: "center", padding: "15px 20px 8px", borderBottom: "3px solid var(--ink)" }}>
        <Link href="/" style={{ textDecoration: "none", color: "var(--ink)" }}>
          <div className="masthead-logo" style={{ fontSize: "3.5rem", margin: "6px 0" }}>Nornlore</div>
        </Link>
      </div>

      <div style={{ padding: "30px 40px 50px", maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "2.5rem",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "-1px",
          marginBottom: 20,
          borderBottom: "3px solid var(--ink)",
          paddingBottom: 10,
        }}>Terms of Use</h1>

        <div style={{
          fontFamily: "'IM Fell English', serif",
          fontSize: "1rem",
          lineHeight: 1.65,
          color: "var(--ink)",
        }}>
          <p style={{ marginBottom: 16, fontStyle: "italic" }}>
            Last updated: March 2026
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            I. Acceptance
          </h2>
          <p style={{ marginBottom: 16 }}>
            By using Nornlore, you agree to these terms. If you disagree, please do not use the site.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            II. Nature of Content
          </h2>
          <p style={{ marginBottom: 16 }}>
            Nornlore is a fun, entertainment project. The historical facts presented (births, events, music releases, movie releases) are real and sourced from publicly available data including Wikipedia. However, all magical theming, wizarding references, fictional advertisements, weather reports, notices, and newspaper styling are purely satirical and for entertainment purposes only. No affiliation with any fictional or real wizarding institutions is claimed or implied.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            III. Accuracy
          </h2>
          <p style={{ marginBottom: 16 }}>
            While we strive for accuracy, historical data is provided &ldquo;as is&rdquo; without warranty. We source information from Wikipedia and other public sources. Errors may exist. Do not rely on Nornlore as a primary historical reference.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            IV. Intellectual Property
          </h2>
          <p style={{ marginBottom: 16 }}>
            The Nornlore name, design, and original code are the property of Apoorv Darshan. Historical facts are in the public domain. Wikipedia content is used under the Creative Commons Attribution-ShareAlike license. Images are fetched from Wikipedia at runtime and remain the property of their respective copyright holders.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            V. Open Source
          </h2>
          <p style={{ marginBottom: 16 }}>
            The source code for Nornlore is open source and available on{" "}
            <a href="https://github.com/apoorvdarshan/nornlore" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>GitHub</a>.
            Contributions are welcome.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            VI. Limitation of Liability
          </h2>
          <p style={{ marginBottom: 16 }}>
            Nornlore is provided free of charge, as is, without any warranties. We are not liable for any damages arising from the use of this site.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            VII. Changes
          </h2>
          <p style={{ marginBottom: 16 }}>
            We may update these terms at any time. Continued use of the site constitutes acceptance of updated terms.
          </p>

          <div style={{ borderTop: "3px double var(--ink)", marginTop: 30, paddingTop: 15, textAlign: "center" }}>
            <Link href="/" style={{ color: "var(--accent)", fontFamily: "'IM Fell English', serif", fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 2, fontSize: "0.9rem" }}>
              ← Return to the Front Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
