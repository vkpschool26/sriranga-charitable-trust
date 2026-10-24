import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Sri Ranga Charitable Trust — Grow Together";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const mark = await readFile(join(process.cwd(), "public/brand/src-mark-512.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          background: "#f8faf5",
          borderBottom: "24px solid #8bcb55",
        }}
      >
        <img src={markSrc} width={300} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, color: "#123d7a", letterSpacing: 2 }}>SRC TRUST</div>
          <div style={{ fontSize: 44, color: "#5a6478", marginTop: 8 }}>Sri Ranga Charitable Trust</div>
          <div style={{ fontSize: 40, color: "#3189d5", marginTop: 28, fontStyle: "italic" }}>Grow Together</div>
        </div>
      </div>
    ),
    size
  );
}
