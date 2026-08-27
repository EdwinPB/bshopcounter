// Normalize a user-typed barbershop name/slug into a canonical matchable form.
// Examples:
//   "Yepes"           -> "yepes"
//   "Barbería Central"-> "barberia-central"
// Applies case folding, accent stripping, and whitespace/hyphen collapsing.
export function normalizeLabel(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // Strip diacritics (é -> e, í -> i, etc.)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Collapse any run of spaces/underscores/hyphens into a single hyphen
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

// Whether a normalized input matches a tenant's slug or its normalized name.
export function tenantMatches(
  normalizedInput: string,
  tenant: { slug: string; name: string },
): boolean {
  if (normalizedInput === tenant.slug) return true;
  const normalizedName = normalizeLabel(tenant.name);
  return normalizedInput === normalizedName;
}
