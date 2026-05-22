import Link from "next/link";

export function SafetyFooter() {
  return (
    <footer className="safety-footer">
      <strong>Play safely.</strong> Play only with permission, stay on safe paths and known
      routes, supervise children near the lake, and stop if weather changes.{" "}
      <Link href="/safety">Read the rules</Link> and{" "}
      <Link href="/safety#limited-permission">limited permission notice</Link>.
    </footer>
  );
}
