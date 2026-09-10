import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "FreshFlower.zone — premium flowers in Delhi NCR";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MANROPE = readFileSync(
  join(process.cwd(), "public/fonts/manrope-semibold.ttf"),
);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "#FBF7F0",
          color: "#1D1B17",
          fontFamily: "Manrope",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background:
              "linear-gradient(90deg, #D6AA5A 0%, #E7C887 50%, #D6AA5A 100%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              background: "#1D1B17",
              color: "#FBF7F0",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            ff
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: -1.5,
              fontFamily: "Manrope",
            }}
          >
            freshflower
            <span style={{ color: "#B8892F" }}>.zone</span>
          </span>
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 34,
            fontWeight: 600,
            color: "#3F3B34",
            fontFamily: "Manrope",
          }}
        >
          Premium flower delivery, Delhi NCR
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 22,
            color: "#7A746A",
            maxWidth: 900,
            lineHeight: 1.55,
            fontFamily: "Manrope",
          }}
        >
          Morning-fresh bouquets, puja flowers, gifting, weddings &amp; wholesale
          — delivered while the day still feels yours.
        </div>
        <div
          style={{
            marginTop: 34,
            width: 220,
            height: 5,
            borderRadius: 3,
            background: "#D6AA5A",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 80,
            fontSize: 18,
            color: "#B8892F",
            fontWeight: 600,
            letterSpacing: 2,
            fontFamily: "Manrope",
          }}
        >
          freshflower.zone · @freshflower.zone
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Manrope", data: MANROPE }],
    },
  );
}