export default function buildClassName(...parts) {
  return parts.flat().filter(Boolean).join(' ');
}