const prohibitedUses = [
  "No hunting, trapping, or fishing.",
  "No motorized vehicles, including ATVs and dirt bikes.",
  "No camping, campfires, or open flames.",
  "No alcohol, drugs, or smoking.",
  "Dogs must be under control at all times, either leashed or voice-controlled.",
  "No target shooting, drones, or removing plants, rocks, or artifacts.",
  "Leave no trace. Pack out all trash."
];

export function RecreationalUseNotice() {
  return (
    <section className="card legal-notice" id="limited-permission">
      <p className="eyebrow">Limited permission for recreational use</p>
      <h2>Private property, limited recreational permission.</h2>
      <p>
        Hey there! You are welcome to enjoy this private property for free recreational
        activities like walking, hiking, birdwatching, or nature viewing, as permitted
        under Massachusetts General Laws Chapter 21, Section 17C.
      </p>
      <p>Please follow these rules to keep everyone safe and the land pristine:</p>
      <ul className="safety-list">
        {prohibitedUses.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <p>
        Violating these rules means you no longer have permission to enter and are
        trespassing. The owner is not liable for injuries, except as provided by law. See{" "}
        <a
          href="https://malegislature.gov/Laws/GeneralLaws/PartI/TitleII/Chapter21/Section17C"
          target="_blank"
          rel="noreferrer"
        >
          Massachusetts General Laws Chapter 21, Section 17C
        </a>
        .
      </p>
    </section>
  );
}
