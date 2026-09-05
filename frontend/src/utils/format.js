/**
 * Utility to format store address by removing GSTIN or sensitive tax IDs for customer view
 */
export function formatStoreAddress(address) {
  if (!address) return '';
  return address.replace(/\s*\(GSTIN:\s*[^)]+\)/gi, '').trim();
}
