import { ImageResponse } from "next/og";

export const alt =
  "DeepTalent — Finance, Compliance & Technology Talent Partner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded default Open Graph / social share card (light, blue-on-white).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* subtle brand rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: "#3B5BDB",
            }}
          />
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            DeepTalent
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 940,
            }}
          >
            Finance, Compliance &amp; Technology talent, placed globally.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#6B7280",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            Credentialled professionals from Africa placed into global roles in
            14–21 days.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 26, color: "#3B5BDB", fontWeight: 600 }}>
            deeptalent.app
          </div>
          <div style={{ fontSize: 22, color: "#9CA3AF" }}>
            A managed talent partner — not a marketplace
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
