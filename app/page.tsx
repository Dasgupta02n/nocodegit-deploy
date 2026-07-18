export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main data-page="landing" style={{ padding: 48, fontFamily: "system-ui" }}>
      <h1>NoCodeGit landing canary</h1>
      <p>If you see this, / is not redirecting to login.</p>
      <p>
        <a href="/signup">Get started</a> · <a href="/login">Log in</a>
      </p>
    </main>
  );
}
