"use client";
import { useRef, useState } from "react";
import type {
  CustomerProductResponse,
  CustomerVariantResponse,
} from "@modular-monolith/clients-shared/api/types/productcatalog";
import { addCartItem } from "@/app/lib/cart";

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function findVariant(
  variants: CustomerVariantResponse[],
  selected: Record<string, string>
): CustomerVariantResponse | undefined {
  return variants.find((v) =>
    (v.optionValues ?? []).every((ov) => selected[ov.optionName] === ov.value)
  );
}

function flyToOrb(fromEl: HTMLElement, imageUrl: string) {
  // Orb center: top:20px right:20px size:20px → center = (innerWidth-30, 30)
  const endX = window.innerWidth - 30;
  const endY = 30;

  const fromRect = fromEl.getBoundingClientRect();
  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:fixed;left:0;top:0;pointer-events:none;z-index:9999;will-change:transform;";

  const ball = document.createElement("div");
  ball.style.cssText =
    "width:44px;height:44px;border-radius:50%;overflow:hidden;transform:translate(-50%,-50%);box-shadow:0 4px 14px rgba(0,0,0,0.25);";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
  ball.appendChild(img);
  wrapper.appendChild(ball);
  document.body.appendChild(wrapper);

  // Quadratic bezier control point arcs toward top-right
  const ctrlX = startX + (endX - startX) * 0.15;
  const ctrlY = Math.min(startY, endY) - Math.abs(endX - startX) * 0.3;

  const duration = 680;
  const start = performance.now();

  function step(now: number) {
    const t = Math.min((now - start) / duration, 1);
    // ease-in-out
    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const x = (1 - e) ** 2 * startX + 2 * (1 - e) * e * ctrlX + e ** 2 * endX;
    const y = (1 - e) ** 2 * startY + 2 * (1 - e) * e * ctrlY + e ** 2 * endY;
    const scale = 1 - e * 0.75;
    const opacity = t > 0.65 ? 1 - (t - 0.65) / 0.35 : 1;

    wrapper.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    wrapper.style.opacity = String(opacity);

    if (t < 1) requestAnimationFrame(step);
    else wrapper.remove();
  }

  requestAnimationFrame(step);
}

export function ProductInfoPanel({ product }: { product: CustomerProductResponse }) {
  const options = product.options ?? [];
  const variants = product.variants ?? [];
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const opt of options) {
      if (opt.values.length > 0) init[opt.name] = opt.values[0];
    }
    return init;
  });

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const currency = product.currency as string;
  const variant = options.length > 0 ? findVariant(variants, selected) : undefined;

  const price = variant?.price && variant.price > 0 ? variant.price : product.lowestPrice;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const hasDiscount = compareAt > 0 && compareAt > price;

  const priceLabel =
    !variant && product.lowestPrice !== product.highestPrice
      ? `${fmt(product.lowestPrice, currency)} – ${fmt(product.highestPrice, currency)}`
      : fmt(price, currency);

  function handleAddToCart() {
    const variantLabel = variant
      ? (variant.optionValues ?? []).map((ov) => ov.value).join(" / ")
      : undefined;

    addCartItem({
      productId: product.id,
      productName: product.name,
      imageUrl: variant?.imageUrl || product.imageUrl || "",
      variantId: variant?.id,
      variantLabel,
      price,
      currency,
      quantity: qty,
    });

    if (addBtnRef.current) {
      const imageUrl = variant?.imageUrl || product.imageUrl || "";
      if (imageUrl) flyToOrb(addBtnRef.current, imageUrl);
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--terra)" }}>
          {priceLabel}
        </span>
        {hasDiscount && (
          <span style={{ fontSize: "0.95rem", color: "var(--brown-md)", textDecoration: "line-through" }}>
            {fmt(compareAt, currency)}
          </span>
        )}
      </div>

      {options.map((opt) => (
        <div key={opt.id}>
          <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--brown)", margin: "0 0 8px" }}>
            {opt.name}
            {selected[opt.name] && (
              <span style={{ fontWeight: 400, color: "var(--brown-md)", marginLeft: 6 }}>
                {selected[opt.name]}
              </span>
            )}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {opt.values.map((val) => {
              const isActive = selected[opt.name] === val;
              return (
                <button
                  key={val}
                  onClick={() => setSelected((s) => ({ ...s, [opt.name]: val }))}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 6,
                    border: isActive ? "2px solid var(--terra)" : "1.5px solid var(--sand)",
                    background: isActive ? "var(--terra)" : "transparent",
                    color: isActive ? "var(--cream)" : "var(--brown)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--brown)", margin: "0 0 8px" }}>
          Số lượng
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1.5px solid var(--sand)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            style={{
              width: 36, height: 36, background: "transparent", border: "none",
              cursor: "pointer", fontSize: "1.2rem", color: "var(--brown)", fontFamily: "inherit",
            }}
          >
            −
          </button>
          <span
            style={{
              width: 40, textAlign: "center", fontSize: "0.95rem",
              color: "var(--brown)", display: "block",
            }}
          >
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            style={{
              width: 36, height: 36, background: "transparent", border: "none",
              cursor: "pointer", fontSize: "1.2rem", color: "var(--brown)", fontFamily: "inherit",
            }}
          >
            +
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          ref={addBtnRef}
          onClick={handleAddToCart}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 8,
            border: "2px solid var(--terra)",
            background: added ? "var(--terra)" : "transparent",
            color: added ? "var(--cream)" : "var(--terra)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {added ? "Đã thêm ✓" : "Thêm vào giỏ"}
        </button>
        <button
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--terra)",
            color: "var(--cream)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Mua ngay
        </button>
      </div>

      {product.description && (
        <div style={{ borderTop: "1px solid var(--linen)", paddingTop: 20, marginTop: 4 }}>
          <p
            style={{
              fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "var(--brown-md)", margin: "0 0 10px",
            }}
          >
            Mô tả sản phẩm
          </p>
          <p
            style={{
              fontSize: "0.9rem", color: "var(--brown-md)", lineHeight: 1.8,
              whiteSpace: "pre-line", margin: 0,
            }}
          >
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
}
