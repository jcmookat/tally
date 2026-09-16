import { tallyIconResponse } from "@/lib/icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return tallyIconResponse({ size: 180, cornerRadius: 36 });
}
