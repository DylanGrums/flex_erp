-- CreateEnum
CREATE TYPE "store"."CampaignBudgetType" AS ENUM ('NONE', 'SPEND_LIMIT', 'USE_BY_ATTRIBUTE');

-- CreateEnum
CREATE TYPE "store"."PromotionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "store"."PromotionType" AS ENUM ('STANDARD');

-- CreateEnum
CREATE TYPE "store"."PromotionRuleScope" AS ENUM ('PROMOTION', 'TARGET', 'BUY');

-- CreateEnum
CREATE TYPE "store"."PromotionRuleOperator" AS ENUM ('EQ', 'NE', 'IN', 'NIN', 'GT', 'GTE', 'LT', 'LTE');

-- CreateEnum
CREATE TYPE "store"."PromotionApplicationMethodType" AS ENUM ('FIXED', 'PERCENT');

-- CreateEnum
CREATE TYPE "store"."PromotionApplicationAllocation" AS ENUM ('EACH', 'ACROSS');

-- CreateEnum
CREATE TYPE "store"."PromotionTargetType" AS ENUM ('ITEMS');

-- CreateTable
CREATE TABLE "store"."Campaign" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "budgetType" "store"."CampaignBudgetType" NOT NULL DEFAULT 'NONE',
    "budgetLimitAmount" INTEGER,
    "budgetCurrency" "core"."CurrencyCode" NOT NULL DEFAULT 'EUR',
    "budgetAttribute" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."Promotion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "type" "store"."PromotionType" NOT NULL DEFAULT 'STANDARD',
    "status" "store"."PromotionStatus" NOT NULL DEFAULT 'DRAFT',
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageLimit" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."PromotionRule" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "scope" "store"."PromotionRuleScope" NOT NULL,
    "operator" "store"."PromotionRuleOperator" NOT NULL,
    "attribute" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."PromotionApplicationMethod" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "type" "store"."PromotionApplicationMethodType" NOT NULL,
    "allocation" "store"."PromotionApplicationAllocation" NOT NULL,
    "targetType" "store"."PromotionTargetType" NOT NULL,
    "valueAmount" INTEGER,
    "valueBps" INTEGER,
    "currency" "core"."CurrencyCode" NOT NULL DEFAULT 'EUR',
    "maxQuantity" INTEGER NOT NULL DEFAULT 1,
    "isTaxInclusive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PromotionApplicationMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."CampaignPromotion" (
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "promotionId" UUID NOT NULL,

    CONSTRAINT "CampaignPromotion_pkey" PRIMARY KEY ("tenantId","storeId","campaignId","promotionId")
);

-- CreateTable
CREATE TABLE "store"."CartPromotionAdjustment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "CartPromotionAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."OrderPromotionAdjustment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "OrderPromotionAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_tenantId_storeId_id_key" ON "store"."Campaign"("tenantId", "storeId", "id");

-- CreateIndex
CREATE INDEX "Campaign_tenantId_storeId_idx" ON "store"."Campaign"("tenantId", "storeId");

-- CreateIndex
CREATE INDEX "Campaign_tenantId_storeId_startsAt_endsAt_idx" ON "store"."Campaign"("tenantId", "storeId", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_tenantId_storeId_id_key" ON "store"."Promotion"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_tenantId_storeId_code_key" ON "store"."Promotion"("tenantId", "storeId", "code");

-- CreateIndex
CREATE INDEX "Promotion_tenantId_storeId_idx" ON "store"."Promotion"("tenantId", "storeId");

-- CreateIndex
CREATE INDEX "Promotion_tenantId_storeId_status_isActive_idx" ON "store"."Promotion"("tenantId", "storeId", "status", "isActive");

-- CreateIndex
CREATE INDEX "PromotionRule_tenantId_storeId_promotionId_scope_idx" ON "store"."PromotionRule"("tenantId", "storeId", "promotionId", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionRule_tenantId_storeId_id_key" ON "store"."PromotionRule"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionApplicationMethod_tenantId_storeId_promotionId_key" ON "store"."PromotionApplicationMethod"("tenantId", "storeId", "promotionId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionApplicationMethod_tenantId_storeId_id_key" ON "store"."PromotionApplicationMethod"("tenantId", "storeId", "id");

-- CreateIndex
CREATE INDEX "PromotionApplicationMethod_tenantId_storeId_promotionId_idx" ON "store"."PromotionApplicationMethod"("tenantId", "storeId", "promotionId");

-- CreateIndex
CREATE INDEX "CampaignPromotion_tenantId_storeId_campaignId_idx" ON "store"."CampaignPromotion"("tenantId", "storeId", "campaignId");

-- CreateIndex
CREATE INDEX "CampaignPromotion_tenantId_storeId_promotionId_idx" ON "store"."CampaignPromotion"("tenantId", "storeId", "promotionId");

-- CreateIndex
CREATE INDEX "CartPromotionAdjustment_tenantId_storeId_cartId_idx" ON "store"."CartPromotionAdjustment"("tenantId", "storeId", "cartId");

-- CreateIndex
CREATE UNIQUE INDEX "CartPromotionAdjustment_tenantId_storeId_id_key" ON "store"."CartPromotionAdjustment"("tenantId", "storeId", "id");

-- CreateIndex
CREATE INDEX "CartPromotionAdjustment_tenantId_storeId_promotionId_idx" ON "store"."CartPromotionAdjustment"("tenantId", "storeId", "promotionId");

-- CreateIndex
CREATE INDEX "OrderPromotionAdjustment_tenantId_storeId_orderId_idx" ON "store"."OrderPromotionAdjustment"("tenantId", "storeId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPromotionAdjustment_tenantId_storeId_id_key" ON "store"."OrderPromotionAdjustment"("tenantId", "storeId", "id");

-- CreateIndex
CREATE INDEX "OrderPromotionAdjustment_tenantId_storeId_promotionId_idx" ON "store"."OrderPromotionAdjustment"("tenantId", "storeId", "promotionId");

-- AddForeignKey
ALTER TABLE "store"."Campaign" ADD CONSTRAINT "Campaign_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Promotion" ADD CONSTRAINT "Promotion_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."PromotionRule" ADD CONSTRAINT "PromotionRule_tenantId_storeId_promotionId_fkey" FOREIGN KEY ("tenantId", "storeId", "promotionId") REFERENCES "store"."Promotion"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."PromotionApplicationMethod" ADD CONSTRAINT "PromotionApplicationMethod_tenantId_storeId_promotionId_fkey" FOREIGN KEY ("tenantId", "storeId", "promotionId") REFERENCES "store"."Promotion"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CampaignPromotion" ADD CONSTRAINT "CampaignPromotion_tenantId_storeId_campaignId_fkey" FOREIGN KEY ("tenantId", "storeId", "campaignId") REFERENCES "store"."Campaign"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CampaignPromotion" ADD CONSTRAINT "CampaignPromotion_tenantId_storeId_promotionId_fkey" FOREIGN KEY ("tenantId", "storeId", "promotionId") REFERENCES "store"."Promotion"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CartPromotionAdjustment" ADD CONSTRAINT "CartPromotionAdjustment_tenantId_storeId_cartId_fkey" FOREIGN KEY ("tenantId", "storeId", "cartId") REFERENCES "store"."Cart"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CartPromotionAdjustment" ADD CONSTRAINT "CartPromotionAdjustment_tenantId_storeId_promotionId_fkey" FOREIGN KEY ("tenantId", "storeId", "promotionId") REFERENCES "store"."Promotion"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."OrderPromotionAdjustment" ADD CONSTRAINT "OrderPromotionAdjustment_tenantId_storeId_orderId_fkey" FOREIGN KEY ("tenantId", "storeId", "orderId") REFERENCES "store"."Order"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."OrderPromotionAdjustment" ADD CONSTRAINT "OrderPromotionAdjustment_tenantId_storeId_promotionId_fkey" FOREIGN KEY ("tenantId", "storeId", "promotionId") REFERENCES "store"."Promotion"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
