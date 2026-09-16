import { tallyIconResponse } from "@/lib/icon";

export const dynamic = "force-static";

export function GET() {
  return tallyIconResponse({ size: 512, cornerRadius: 0, padding: 148 });
}
