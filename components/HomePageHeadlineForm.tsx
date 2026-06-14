import { updateHomePageHeadline } from "@/app/admin/actions";

export function HomePageHeadlineForm({ headline }: { headline: string }) {
  return (
    <section className="home-headline-admin-card" aria-label="Home page headline">
      <div>
        <p className="eyebrow">Home page</p>
        <h2>Headline message</h2>
        <p>Appears above the cow icon on the Famous Land home page when the game is off.</p>
      </div>
      <form action={updateHomePageHeadline}>
        <label htmlFor="home-page-headline">Message</label>
        <textarea
          id="home-page-headline"
          name="headline"
          defaultValue={headline}
          maxLength={120}
          placeholder="Welcome to Famous Land"
          rows={2}
        />
        <button className="button primary" type="submit">
          Update headline
        </button>
      </form>
    </section>
  );
}
