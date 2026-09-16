export const OWNERS = ["pogi", "ganda"] as const;

export type Owner = (typeof OWNERS)[number];

export const OWNER_LABELS: Record<Owner, string> = {
  pogi: "Pogi",
  ganda: "Ganda",
};

export function isOwner(value: string): value is Owner {
  return (OWNERS as readonly string[]).includes(value);
}
