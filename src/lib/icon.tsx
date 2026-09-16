import { ImageResponse } from "next/og";

const BRASS = "#a8641f";
const CREAM = "#fdf8ee";

export function tallyIconResponse({
  size,
  cornerRadius = Math.round(size * 0.22),
  padding = Math.round(size * 0.22),
}: {
  size: number;
  cornerRadius?: number;
  padding?: number;
}) {
  const contentSize = size - padding * 2;
  const barGap = contentSize / 5;
  const strokeWidth = Math.max(barGap * 0.5, 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRASS,
          borderRadius: cornerRadius,
        }}
      >
        <svg
          width={contentSize}
          height={contentSize}
          viewBox={`0 0 ${contentSize} ${contentSize}`}
        >
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={barGap * (i + 0.5)}
              y1={contentSize * 0.1}
              x2={barGap * (i + 0.5)}
              y2={contentSize * 0.9}
              stroke={CREAM}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          ))}
          <line
            x1={contentSize * 0.03}
            y1={contentSize * 0.85}
            x2={contentSize * 0.97}
            y2={contentSize * 0.15}
            stroke={CREAM}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
