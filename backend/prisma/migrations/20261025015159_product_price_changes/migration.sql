-- CreateTable
CREATE TABLE "product_price_changes" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "oldPriceCents" INTEGER NOT NULL,
    "newPriceCents" INTEGER NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_price_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_price_changes_productId_changedAt_idx" ON "product_price_changes"("productId", "changedAt");

-- AddForeignKey
ALTER TABLE "product_price_changes" ADD CONSTRAINT "product_price_changes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_price_changes" ADD CONSTRAINT "product_price_changes_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
