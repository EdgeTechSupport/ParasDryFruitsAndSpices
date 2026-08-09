ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "mrp" DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProductVariant" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "weight" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "mrp" DOUBLE PRECISION,
  "stock" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);
