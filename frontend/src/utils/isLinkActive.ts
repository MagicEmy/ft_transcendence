export const isLinkActive = (name: string): boolean => {
  return window.location.pathname.includes(name);
}
