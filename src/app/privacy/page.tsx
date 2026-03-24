import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Nornlore",
};

export default function Privacy() {
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
        }}>Privacy Policy</h1>

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
            I. What We Collect
          </h2>
          <p style={{ marginBottom: 16 }}>
            Nornlore does not collect, store, or transmit any personal data. We do not use cookies, analytics, tracking pixels, or any form of user identification. The date you enter stays in your browser and is never sent to any server.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            II. Third-Party Services
          </h2>
          <p style={{ marginBottom: 16 }}>
            Nornlore fetches data from the following third-party services at runtime:
          </p>
          <ul style={{ marginBottom: 16, paddingLeft: 24, listStyleType: "disc" }}>
            <li style={{ marginBottom: 8 }}><strong>Wikipedia API</strong> — to fetch article extracts and thumbnail images. Wikipedia&apos;s own privacy policy applies to these requests.</li>
            <li style={{ marginBottom: 8 }}><strong>Google Fonts</strong> — to load typefaces. Google&apos;s privacy policy applies.</li>
          </ul>
          <p style={{ marginBottom: 16 }}>
            These services may log your IP address according to their own policies. We have no control over this.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            III. Local Storage
          </h2>
          <p style={{ marginBottom: 16 }}>
            Nornlore does not use localStorage, sessionStorage, or IndexedDB. No data persists on your device between sessions.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            IV. Children
          </h2>
          <p style={{ marginBottom: 16 }}>
            Nornlore is suitable for all ages. Since we collect no data, there are no special provisions needed for children under 13.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            V. Changes
          </h2>
          <p style={{ marginBottom: 16 }}>
            We may update this policy if the site&apos;s functionality changes. Any updates will be reflected on this page.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, margin: "28px 0 8px", textTransform: "uppercase", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
            VI. Contact
          </h2>
          <p style={{ marginBottom: 16 }}>
            Questions? Reach out to{" "}
            <a href="https://x.com/apoorvdarshan" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>@apoorvdarshan</a> on X.
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
