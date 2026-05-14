"use client";
import { useState } from "react";

interface Props {
  images: string[];
  name: string;
}

export function ProductImageGallery({ images, name }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const main = images[activeIdx] ?? null;

  return (
    <div>
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--linen)",
          aspectRatio: "1/1",
          marginBottom: 12,
        }}
      >
        {main ? (
          <img
            src={main}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                flexShrink: 0,
                width: 64,
                height: 64,
                borderRadius: 8,
                overflow: "hidden",
                padding: 0,
                border: activeIdx === i ? "2px solid var(--terra)" : "2px solid transparent",
                cursor: "pointer",
                background: "var(--linen)",
              }}
            >
              <img
                src={url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
