import { tallyIconResponse } from "@/lib/icon";

export const dynamic = "force-static";

export function GET() {
  return tallyIconResponse({ size: 192, cornerRadius: 42 });
}
