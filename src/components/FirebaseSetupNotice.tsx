export function FirebaseSetupNotice() {
  return (
    <section className="m-6 max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6 font-sans text-stone-900">
      <h1 className="text-xl font-semibold">
        Multiplayer is not configured yet
      </h1>
      <p className="mt-2">
        You are signed in. Game rooms will be available once the site
        administrator finishes multiplayer setup.
      </p>
    </section>
  );
}
