// Default (web / test / not-yet-wired) implementation. Metro picks up
// `registerProviders.native.ts` on iOS / Android automatically, so this
// file is only what web builds and Jest see.
export async function bootstrapProviders(): Promise<void> {
  return;
}
