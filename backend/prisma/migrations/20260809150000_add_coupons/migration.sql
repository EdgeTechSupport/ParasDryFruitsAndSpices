CREATE TABLE IF NOT EXISTS "Coupon" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discount" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Coupon_code_key" UNIQUE ("code"),
  CONSTRAINT "Coupon_discount_check" CHECK ("discount" BETWEEN 1 AND 90)
);
