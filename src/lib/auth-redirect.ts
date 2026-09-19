export function safeReturnTo(value: string | string[] | undefined): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return "/lobby";
  // Only return to the app's protected game routes, never an external URL.
  const url = new URL(value, "http://localhost");
  return /^\/(lobby|game)(\/|$)/.test(url.pathname)
    ? `${url.pathname}${url.search}`
    : "/lobby";
}
