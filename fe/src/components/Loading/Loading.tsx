import { useEffect, useState } from "react";

export default function Loading() {
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center", height: "48px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#f5222d",
            opacity: activeDot === i ? 1 : 0.4,
            transform: activeDot === i ? "scale(1.4)" : "scale(1)",
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>
  );
}
