import { tallyIconResponse } from "@/lib/icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return tallyIconResponse({ size: 32, cornerRadius: 7 });
}
