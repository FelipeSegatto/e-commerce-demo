"use client";
/* eslint-disable @next/next/no-img-element */
import type { Product } from "@/domain/types";
export function ProductImage({
  product,
  option = "",
  className = "",
  loading = "lazy",
}: {
  product: Product;
  option?: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const src = product.variantImages?.[option] || product.image;
  return (
    <img
      className={className}
      src={src}
      alt={
        product.name +
        (option ? " · " + option : "") +
        (product.imagePending ? " · foto em preparação" : "")
      }
      loading={loading}
      onError={(e) => {
        const fallback = "/illustrations/product-pending.svg";
        if (!e.currentTarget.src.endsWith(fallback))
          e.currentTarget.src = fallback;
      }}
    />
  );
}
