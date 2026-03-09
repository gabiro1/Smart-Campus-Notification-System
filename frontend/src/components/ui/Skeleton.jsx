export default function Skeleton({ h = 20, w = "100%", r = 8 }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: r,
        background:
          "linear-gradient(90deg,#1a1a2e 25%,#16213e 50%,#1a1a2e 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}
