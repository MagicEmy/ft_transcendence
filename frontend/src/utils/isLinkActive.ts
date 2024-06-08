export const isLinkActive = (pathname: string, name: string): boolean => {
  return pathname.includes(name);
}
