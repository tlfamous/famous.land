import Link from "next/link";

export function SafetyFooter() {
  return (
    <footer className="safety-footer">
      <strong>Play safely.</strong> Play only with permission, stay on safe paths and known
      areas, supervise children near the lake, and stop if weather changes.{" "}
      <Link href="/safety">Read the safety notes</Link>.
    </footer>
  );
}
