-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cms";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "employee";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "store";

-- CreateEnum
CREATE TYPE "auth"."UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "auth"."PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "cms"."CmsPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "cms"."CmsAssetKind" AS ENUM ('IMAGE', 'VIDEO', 'FILE');

-- CreateEnum
CREATE TYPE "cms"."CmsMenuItemType" AS ENUM ('URL', 'INTERNAL_PAGE');

-- CreateEnum
CREATE TYPE "core"."CurrencyCode" AS ENUM ('EUR', 'USD', 'GBP');

-- CreateEnum
CREATE TYPE "core"."OrgUnitKind" AS ENUM ('REGION', 'GROUP', 'FRANCHISEE', 'BRAND');

-- CreateEnum
CREATE TYPE "core"."ModuleKey" AS ENUM ('STORE', 'CMS', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "core"."DomainEventSource" AS ENUM ('SYSTEM', 'USER', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "employee"."EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "employee"."ShiftStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "employee"."TimeOffStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "employee"."TimeOffType" AS ENUM ('VACATION', 'SICK', 'OTHER');

-- CreateEnum
CREATE TYPE "store"."ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "store"."CartStatus" AS ENUM ('ACTIVE', 'ORDERED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "store"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "store"."DiscountKind" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "store"."CustomerAddressKind" AS ENUM ('SHIPPING', 'BILLING');

-- CreateTable
CREATE TABLE "auth"."User" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "auth"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."AuthSession" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."Role" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."UserRole" (
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("tenantId","userId","roleId")
);

-- CreateTable
CREATE TABLE "auth"."Permission" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."RolePermission" (
    "tenantId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("tenantId","roleId","permissionId")
);

-- CreateTable
CREATE TABLE "auth"."UserPermission" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "effect" "auth"."PermissionEffect" NOT NULL,
    "conditionSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "condition" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."CmsSite" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr-FR',
    "settingsSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."CmsPage" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "cms"."CmsPageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" UUID,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."CmsPageVersion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "contentSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsPageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."CmsAsset" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "kind" "cms"."CmsAssetKind" NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "checksum" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."CmsMenu" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."CmsMenuItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "parentId" UUID,
    "label" TEXT NOT NULL,
    "type" "cms"."CmsMenuItemType" NOT NULL DEFAULT 'URL',
    "href" TEXT,
    "pageId" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CmsMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."Tenant" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."TenantModule" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "key" "core"."ModuleKey" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "configSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."Address" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "label" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "country" VARCHAR(2) NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."BusinessUnit" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "taxId" TEXT,
    "vatNumber" TEXT,
    "addressId" UUID,
    "orgUnitId" UUID,

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."Store" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "currency" "core"."CurrencyCode" NOT NULL DEFAULT 'EUR',
    "businessUnitId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."OrgUnit" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "kind" "core"."OrgUnitKind" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" UUID,

    CONSTRAINT "OrgUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."OrgUnitClosure" (
    "tenantId" UUID NOT NULL,
    "ancestorId" UUID NOT NULL,
    "descendantId" UUID NOT NULL,
    "depth" INTEGER NOT NULL,

    CONSTRAINT "OrgUnitClosure_pkey" PRIMARY KEY ("tenantId","ancestorId","descendantId")
);

-- CreateTable
CREATE TABLE "core"."StoreOrgUnit" (
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "orgUnitId" UUID NOT NULL,
    "isPrimaryRegion" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreOrgUnit_pkey" PRIMARY KEY ("tenantId","storeId","orgUnitId")
);

-- CreateTable
CREATE TABLE "core"."StoreTag" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."StoreTagAssignment" (
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "StoreTagAssignment_pkey" PRIMARY KEY ("tenantId","storeId","tagId")
);

-- CreateTable
CREATE TABLE "core"."StoreClassification" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."StoreClassificationAssignment" (
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "classificationId" UUID NOT NULL,

    CONSTRAINT "StoreClassificationAssignment_pkey" PRIMARY KEY ("tenantId","storeId","classificationId")
);

-- CreateTable
CREATE TABLE "core"."DomainEvent" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "source" "core"."DomainEventSource" NOT NULL DEFAULT 'SYSTEM',
    "type" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."EmployeeOrgUnit" (
    "tenantId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "orgUnitId" UUID NOT NULL,
    "assignmentRole" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeOrgUnit_pkey" PRIMARY KEY ("tenantId","employeeId","orgUnitId")
);

-- CreateTable
CREATE TABLE "employee"."Employee" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID,
    "status" "employee"."EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "hiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee"."EmployeeStore" (
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "roleTitle" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),

    CONSTRAINT "EmployeeStore_pkey" PRIMARY KEY ("tenantId","storeId","employeeId")
);

-- CreateTable
CREATE TABLE "employee"."Shift" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "employee"."ShiftStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee"."TimeOffRequest" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "storeId" UUID,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "type" "employee"."TimeOffType" NOT NULL,
    "status" "employee"."TimeOffStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "reviewedByUserId" UUID,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeOffRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."Customer" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."CustomerAddress" (
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "addressId" UUID NOT NULL,
    "kind" "store"."CustomerAddressKind" NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("tenantId","storeId","customerId","addressId","kind")
);

-- CreateTable
CREATE TABLE "store"."Product" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT,
    "status" "store"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."ProductImage" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."ProductOption" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."ProductOptionValue" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "optionId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."ProductVariant" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "priceAmount" INTEGER NOT NULL,
    "currency" "core"."CurrencyCode" NOT NULL DEFAULT 'EUR',
    "compareAtAmount" INTEGER,
    "inventoryQuantity" INTEGER NOT NULL DEFAULT 0,
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."VariantOptionValue" (
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "optionValueId" UUID NOT NULL,

    CONSTRAINT "VariantOptionValue_pkey" PRIMARY KEY ("tenantId","storeId","variantId","optionValueId")
);

-- CreateTable
CREATE TABLE "store"."Collection" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."CollectionProduct" (
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "CollectionProduct_pkey" PRIMARY KEY ("tenantId","storeId","collectionId","productId")
);

-- CreateTable
CREATE TABLE "store"."Discount" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "store"."DiscountKind" NOT NULL,
    "value" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadataSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."Cart" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "customerId" UUID,
    "status" "store"."CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" "core"."CurrencyCode" NOT NULL DEFAULT 'EUR',
    "subtotalAmount" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."CartItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."CartAdjustment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "discountId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "CartAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."Order" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "store"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "currency" "core"."CurrencyCode" NOT NULL DEFAULT 'EUR',
    "customerId" UUID,
    "email" TEXT,
    "shippingAddressId" UUID,
    "billingAddressId" UUID,
    "subtotalAmount" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "placedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."OrderItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "skuSnapshot" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPriceAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store"."OrderAdjustment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "discountId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "OrderAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_tenantId_status_idx" ON "auth"."User"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "auth"."User"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_id_key" ON "auth"."User"("tenantId", "id");

-- CreateIndex
CREATE INDEX "AuthSession_tenantId_userId_idx" ON "auth"."AuthSession"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_key_key" ON "auth"."Role"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_id_key" ON "auth"."Role"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_tenantId_key_key" ON "auth"."Permission"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_tenantId_id_key" ON "auth"."Permission"("tenantId", "id");

-- CreateIndex
CREATE INDEX "UserPermission_tenantId_userId_idx" ON "auth"."UserPermission"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "UserPermission_tenantId_permissionId_idx" ON "auth"."UserPermission"("tenantId", "permissionId");

-- CreateIndex
CREATE INDEX "CmsSite_tenantId_storeId_idx" ON "cms"."CmsSite"("tenantId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "CmsSite_tenantId_storeId_id_key" ON "cms"."CmsSite"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CmsSite_tenantId_storeId_domain_key" ON "cms"."CmsSite"("tenantId", "storeId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_publishedVersionId_key" ON "cms"."CmsPage"("publishedVersionId");

-- CreateIndex
CREATE INDEX "CmsPage_tenantId_storeId_status_idx" ON "cms"."CmsPage"("tenantId", "storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_tenantId_storeId_id_key" ON "cms"."CmsPage"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_tenantId_storeId_siteId_slug_key" ON "cms"."CmsPage"("tenantId", "storeId", "siteId", "slug");

-- CreateIndex
CREATE INDEX "CmsPageVersion_tenantId_storeId_pageId_idx" ON "cms"."CmsPageVersion"("tenantId", "storeId", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPageVersion_tenantId_storeId_pageId_version_key" ON "cms"."CmsPageVersion"("tenantId", "storeId", "pageId", "version");

-- CreateIndex
CREATE INDEX "CmsAsset_tenantId_storeId_siteId_idx" ON "cms"."CmsAsset"("tenantId", "storeId", "siteId");

-- CreateIndex
CREATE UNIQUE INDEX "CmsMenu_tenantId_storeId_id_key" ON "cms"."CmsMenu"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CmsMenu_tenantId_storeId_siteId_key_key" ON "cms"."CmsMenu"("tenantId", "storeId", "siteId", "key");

-- CreateIndex
CREATE INDEX "CmsMenuItem_tenantId_storeId_menuId_idx" ON "cms"."CmsMenuItem"("tenantId", "storeId", "menuId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "core"."Tenant"("slug");

-- CreateIndex
CREATE INDEX "TenantModule_tenantId_enabled_idx" ON "core"."TenantModule"("tenantId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "TenantModule_tenantId_key_key" ON "core"."TenantModule"("tenantId", "key");

-- CreateIndex
CREATE INDEX "Address_tenantId_city_idx" ON "core"."Address"("tenantId", "city");

-- CreateIndex
CREATE UNIQUE INDEX "Address_tenantId_id_key" ON "core"."Address"("tenantId", "id");

-- CreateIndex
CREATE INDEX "BusinessUnit_tenantId_orgUnitId_idx" ON "core"."BusinessUnit"("tenantId", "orgUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnit_tenantId_id_key" ON "core"."BusinessUnit"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnit_tenantId_name_key" ON "core"."BusinessUnit"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Store_tenantId_name_idx" ON "core"."Store"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Store_tenantId_code_key" ON "core"."Store"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Store_tenantId_id_key" ON "core"."Store"("tenantId", "id");

-- CreateIndex
CREATE INDEX "OrgUnit_tenantId_kind_idx" ON "core"."OrgUnit"("tenantId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "OrgUnit_tenantId_id_key" ON "core"."OrgUnit"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "OrgUnit_tenantId_kind_slug_key" ON "core"."OrgUnit"("tenantId", "kind", "slug");

-- CreateIndex
CREATE INDEX "OrgUnitClosure_tenantId_descendantId_idx" ON "core"."OrgUnitClosure"("tenantId", "descendantId");

-- CreateIndex
CREATE INDEX "StoreOrgUnit_tenantId_orgUnitId_idx" ON "core"."StoreOrgUnit"("tenantId", "orgUnitId");

-- CreateIndex
CREATE INDEX "StoreOrgUnit_tenantId_storeId_isPrimaryRegion_idx" ON "core"."StoreOrgUnit"("tenantId", "storeId", "isPrimaryRegion");

-- CreateIndex
CREATE UNIQUE INDEX "StoreTag_tenantId_id_key" ON "core"."StoreTag"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "StoreTag_tenantId_slug_key" ON "core"."StoreTag"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "StoreClassification_tenantId_category_idx" ON "core"."StoreClassification"("tenantId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "StoreClassification_tenantId_id_key" ON "core"."StoreClassification"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "StoreClassification_tenantId_category_value_key" ON "core"."StoreClassification"("tenantId", "category", "value");

-- CreateIndex
CREATE INDEX "DomainEvent_tenantId_occurredAt_idx" ON "core"."DomainEvent"("tenantId", "occurredAt");

-- CreateIndex
CREATE INDEX "DomainEvent_tenantId_type_occurredAt_idx" ON "core"."DomainEvent"("tenantId", "type", "occurredAt");

-- CreateIndex
CREATE INDEX "EmployeeOrgUnit_tenantId_orgUnitId_idx" ON "core"."EmployeeOrgUnit"("tenantId", "orgUnitId");

-- CreateIndex
CREATE INDEX "Employee_tenantId_status_idx" ON "employee"."Employee"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_tenantId_id_key" ON "employee"."Employee"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_tenantId_userId_key" ON "employee"."Employee"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "EmployeeStore_tenantId_employeeId_idx" ON "employee"."EmployeeStore"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "Shift_tenantId_storeId_startAt_idx" ON "employee"."Shift"("tenantId", "storeId", "startAt");

-- CreateIndex
CREATE INDEX "Shift_tenantId_employeeId_startAt_idx" ON "employee"."Shift"("tenantId", "employeeId", "startAt");

-- CreateIndex
CREATE INDEX "TimeOffRequest_tenantId_employeeId_startAt_idx" ON "employee"."TimeOffRequest"("tenantId", "employeeId", "startAt");

-- CreateIndex
CREATE INDEX "TimeOffRequest_tenantId_storeId_startAt_idx" ON "employee"."TimeOffRequest"("tenantId", "storeId", "startAt");

-- CreateIndex
CREATE INDEX "Customer_tenantId_storeId_idx" ON "store"."Customer"("tenantId", "storeId");

-- CreateIndex
CREATE INDEX "Customer_tenantId_storeId_email_idx" ON "store"."Customer"("tenantId", "storeId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_storeId_id_key" ON "store"."Customer"("tenantId", "storeId", "id");

-- CreateIndex
CREATE INDEX "Product_tenantId_storeId_status_idx" ON "store"."Product"("tenantId", "storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_storeId_id_key" ON "store"."Product"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_storeId_handle_key" ON "store"."Product"("tenantId", "storeId", "handle");

-- CreateIndex
CREATE INDEX "ProductImage_tenantId_storeId_productId_idx" ON "store"."ProductImage"("tenantId", "storeId", "productId");

-- CreateIndex
CREATE INDEX "ProductOption_tenantId_storeId_productId_idx" ON "store"."ProductOption"("tenantId", "storeId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_tenantId_storeId_id_key" ON "store"."ProductOption"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionValue_tenantId_storeId_id_key" ON "store"."ProductOptionValue"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionValue_tenantId_storeId_optionId_value_key" ON "store"."ProductOptionValue"("tenantId", "storeId", "optionId", "value");

-- CreateIndex
CREATE INDEX "ProductVariant_tenantId_storeId_productId_idx" ON "store"."ProductVariant"("tenantId", "storeId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_tenantId_storeId_id_key" ON "store"."ProductVariant"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_tenantId_storeId_sku_key" ON "store"."ProductVariant"("tenantId", "storeId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_tenantId_storeId_id_key" ON "store"."Collection"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_tenantId_storeId_handle_key" ON "store"."Collection"("tenantId", "storeId", "handle");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_tenantId_storeId_id_key" ON "store"."Discount"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_tenantId_storeId_code_key" ON "store"."Discount"("tenantId", "storeId", "code");

-- CreateIndex
CREATE INDEX "Cart_tenantId_storeId_status_idx" ON "store"."Cart"("tenantId", "storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_tenantId_storeId_id_key" ON "store"."Cart"("tenantId", "storeId", "id");

-- CreateIndex
CREATE INDEX "CartItem_tenantId_storeId_cartId_idx" ON "store"."CartItem"("tenantId", "storeId", "cartId");

-- CreateIndex
CREATE INDEX "CartAdjustment_tenantId_storeId_cartId_idx" ON "store"."CartAdjustment"("tenantId", "storeId", "cartId");

-- CreateIndex
CREATE INDEX "Order_tenantId_storeId_status_idx" ON "store"."Order"("tenantId", "storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_storeId_id_key" ON "store"."Order"("tenantId", "storeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_storeId_number_key" ON "store"."Order"("tenantId", "storeId", "number");

-- CreateIndex
CREATE INDEX "OrderItem_tenantId_storeId_orderId_idx" ON "store"."OrderItem"("tenantId", "storeId", "orderId");

-- CreateIndex
CREATE INDEX "OrderAdjustment_tenantId_storeId_orderId_idx" ON "store"."OrderAdjustment"("tenantId", "storeId", "orderId");

-- AddForeignKey
ALTER TABLE "auth"."User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."AuthSession" ADD CONSTRAINT "AuthSession_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "auth"."User"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."UserRole" ADD CONSTRAINT "UserRole_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "auth"."User"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."UserRole" ADD CONSTRAINT "UserRole_tenantId_roleId_fkey" FOREIGN KEY ("tenantId", "roleId") REFERENCES "auth"."Role"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."Permission" ADD CONSTRAINT "Permission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."RolePermission" ADD CONSTRAINT "RolePermission_tenantId_roleId_fkey" FOREIGN KEY ("tenantId", "roleId") REFERENCES "auth"."Role"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."RolePermission" ADD CONSTRAINT "RolePermission_tenantId_permissionId_fkey" FOREIGN KEY ("tenantId", "permissionId") REFERENCES "auth"."Permission"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."UserPermission" ADD CONSTRAINT "UserPermission_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "auth"."User"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."UserPermission" ADD CONSTRAINT "UserPermission_tenantId_permissionId_fkey" FOREIGN KEY ("tenantId", "permissionId") REFERENCES "auth"."Permission"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsSite" ADD CONSTRAINT "CmsSite_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsPage" ADD CONSTRAINT "CmsPage_tenantId_storeId_siteId_fkey" FOREIGN KEY ("tenantId", "storeId", "siteId") REFERENCES "cms"."CmsSite"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsPage" ADD CONSTRAINT "CmsPage_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "cms"."CmsPageVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsPageVersion" ADD CONSTRAINT "CmsPageVersion_tenantId_storeId_pageId_fkey" FOREIGN KEY ("tenantId", "storeId", "pageId") REFERENCES "cms"."CmsPage"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsPageVersion" ADD CONSTRAINT "CmsPageVersion_tenantId_createdByUserId_fkey" FOREIGN KEY ("tenantId", "createdByUserId") REFERENCES "auth"."User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsAsset" ADD CONSTRAINT "CmsAsset_tenantId_storeId_siteId_fkey" FOREIGN KEY ("tenantId", "storeId", "siteId") REFERENCES "cms"."CmsSite"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsAsset" ADD CONSTRAINT "CmsAsset_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsAsset" ADD CONSTRAINT "CmsAsset_tenantId_createdByUserId_fkey" FOREIGN KEY ("tenantId", "createdByUserId") REFERENCES "auth"."User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsMenu" ADD CONSTRAINT "CmsMenu_tenantId_storeId_siteId_fkey" FOREIGN KEY ("tenantId", "storeId", "siteId") REFERENCES "cms"."CmsSite"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsMenuItem" ADD CONSTRAINT "CmsMenuItem_tenantId_storeId_menuId_fkey" FOREIGN KEY ("tenantId", "storeId", "menuId") REFERENCES "cms"."CmsMenu"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsMenuItem" ADD CONSTRAINT "CmsMenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cms"."CmsMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."CmsMenuItem" ADD CONSTRAINT "CmsMenuItem_tenantId_storeId_pageId_fkey" FOREIGN KEY ("tenantId", "storeId", "pageId") REFERENCES "cms"."CmsPage"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."TenantModule" ADD CONSTRAINT "TenantModule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."Address" ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."BusinessUnit" ADD CONSTRAINT "BusinessUnit_tenantId_addressId_fkey" FOREIGN KEY ("tenantId", "addressId") REFERENCES "core"."Address"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."BusinessUnit" ADD CONSTRAINT "BusinessUnit_tenantId_orgUnitId_fkey" FOREIGN KEY ("tenantId", "orgUnitId") REFERENCES "core"."OrgUnit"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."BusinessUnit" ADD CONSTRAINT "BusinessUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."Store" ADD CONSTRAINT "Store_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "core"."BusinessUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."Store" ADD CONSTRAINT "Store_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."OrgUnit" ADD CONSTRAINT "OrgUnit_tenantId_parentId_fkey" FOREIGN KEY ("tenantId", "parentId") REFERENCES "core"."OrgUnit"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."OrgUnit" ADD CONSTRAINT "OrgUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."OrgUnitClosure" ADD CONSTRAINT "OrgUnitClosure_tenantId_ancestorId_fkey" FOREIGN KEY ("tenantId", "ancestorId") REFERENCES "core"."OrgUnit"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."OrgUnitClosure" ADD CONSTRAINT "OrgUnitClosure_tenantId_descendantId_fkey" FOREIGN KEY ("tenantId", "descendantId") REFERENCES "core"."OrgUnit"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."StoreOrgUnit" ADD CONSTRAINT "StoreOrgUnit_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."StoreOrgUnit" ADD CONSTRAINT "StoreOrgUnit_tenantId_orgUnitId_fkey" FOREIGN KEY ("tenantId", "orgUnitId") REFERENCES "core"."OrgUnit"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."StoreTag" ADD CONSTRAINT "StoreTag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."StoreTagAssignment" ADD CONSTRAINT "StoreTagAssignment_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."StoreTagAssignment" ADD CONSTRAINT "StoreTagAssignment_tenantId_tagId_fkey" FOREIGN KEY ("tenantId", "tagId") REFERENCES "core"."StoreTag"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."StoreClassification" ADD CONSTRAINT "StoreClassification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."StoreClassificationAssignment" ADD CONSTRAINT "StoreClassificationAssignment_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."StoreClassificationAssignment" ADD CONSTRAINT "StoreClassificationAssignment_tenantId_classificationId_fkey" FOREIGN KEY ("tenantId", "classificationId") REFERENCES "core"."StoreClassification"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."DomainEvent" ADD CONSTRAINT "DomainEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."EmployeeOrgUnit" ADD CONSTRAINT "EmployeeOrgUnit_tenantId_employeeId_fkey" FOREIGN KEY ("tenantId", "employeeId") REFERENCES "employee"."Employee"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."EmployeeOrgUnit" ADD CONSTRAINT "EmployeeOrgUnit_tenantId_orgUnitId_fkey" FOREIGN KEY ("tenantId", "orgUnitId") REFERENCES "core"."OrgUnit"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."Employee" ADD CONSTRAINT "Employee_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "auth"."User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."EmployeeStore" ADD CONSTRAINT "EmployeeStore_tenantId_employeeId_fkey" FOREIGN KEY ("tenantId", "employeeId") REFERENCES "employee"."Employee"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."EmployeeStore" ADD CONSTRAINT "EmployeeStore_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."Shift" ADD CONSTRAINT "Shift_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."Shift" ADD CONSTRAINT "Shift_tenantId_employeeId_fkey" FOREIGN KEY ("tenantId", "employeeId") REFERENCES "employee"."Employee"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_tenantId_employeeId_fkey" FOREIGN KEY ("tenantId", "employeeId") REFERENCES "employee"."Employee"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee"."TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_tenantId_reviewedByUserId_fkey" FOREIGN KEY ("tenantId", "reviewedByUserId") REFERENCES "auth"."User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Customer" ADD CONSTRAINT "Customer_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CustomerAddress" ADD CONSTRAINT "CustomerAddress_tenantId_storeId_customerId_fkey" FOREIGN KEY ("tenantId", "storeId", "customerId") REFERENCES "store"."Customer"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CustomerAddress" ADD CONSTRAINT "CustomerAddress_tenantId_addressId_fkey" FOREIGN KEY ("tenantId", "addressId") REFERENCES "core"."Address"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Product" ADD CONSTRAINT "Product_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."ProductImage" ADD CONSTRAINT "ProductImage_tenantId_storeId_productId_fkey" FOREIGN KEY ("tenantId", "storeId", "productId") REFERENCES "store"."Product"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."ProductOption" ADD CONSTRAINT "ProductOption_tenantId_storeId_productId_fkey" FOREIGN KEY ("tenantId", "storeId", "productId") REFERENCES "store"."Product"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_tenantId_storeId_optionId_fkey" FOREIGN KEY ("tenantId", "storeId", "optionId") REFERENCES "store"."ProductOption"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."ProductVariant" ADD CONSTRAINT "ProductVariant_tenantId_storeId_productId_fkey" FOREIGN KEY ("tenantId", "storeId", "productId") REFERENCES "store"."Product"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."VariantOptionValue" ADD CONSTRAINT "VariantOptionValue_tenantId_storeId_variantId_fkey" FOREIGN KEY ("tenantId", "storeId", "variantId") REFERENCES "store"."ProductVariant"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."VariantOptionValue" ADD CONSTRAINT "VariantOptionValue_tenantId_storeId_optionValueId_fkey" FOREIGN KEY ("tenantId", "storeId", "optionValueId") REFERENCES "store"."ProductOptionValue"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Collection" ADD CONSTRAINT "Collection_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CollectionProduct" ADD CONSTRAINT "CollectionProduct_tenantId_storeId_collectionId_fkey" FOREIGN KEY ("tenantId", "storeId", "collectionId") REFERENCES "store"."Collection"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CollectionProduct" ADD CONSTRAINT "CollectionProduct_tenantId_storeId_productId_fkey" FOREIGN KEY ("tenantId", "storeId", "productId") REFERENCES "store"."Product"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Discount" ADD CONSTRAINT "Discount_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Cart" ADD CONSTRAINT "Cart_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Cart" ADD CONSTRAINT "Cart_tenantId_storeId_customerId_fkey" FOREIGN KEY ("tenantId", "storeId", "customerId") REFERENCES "store"."Customer"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CartItem" ADD CONSTRAINT "CartItem_tenantId_storeId_cartId_fkey" FOREIGN KEY ("tenantId", "storeId", "cartId") REFERENCES "store"."Cart"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CartItem" ADD CONSTRAINT "CartItem_tenantId_storeId_variantId_fkey" FOREIGN KEY ("tenantId", "storeId", "variantId") REFERENCES "store"."ProductVariant"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CartAdjustment" ADD CONSTRAINT "CartAdjustment_tenantId_storeId_cartId_fkey" FOREIGN KEY ("tenantId", "storeId", "cartId") REFERENCES "store"."Cart"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."CartAdjustment" ADD CONSTRAINT "CartAdjustment_tenantId_storeId_discountId_fkey" FOREIGN KEY ("tenantId", "storeId", "discountId") REFERENCES "store"."Discount"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Order" ADD CONSTRAINT "Order_tenantId_storeId_fkey" FOREIGN KEY ("tenantId", "storeId") REFERENCES "core"."Store"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Order" ADD CONSTRAINT "Order_tenantId_storeId_customerId_fkey" FOREIGN KEY ("tenantId", "storeId", "customerId") REFERENCES "store"."Customer"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Order" ADD CONSTRAINT "Order_tenantId_shippingAddressId_fkey" FOREIGN KEY ("tenantId", "shippingAddressId") REFERENCES "core"."Address"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."Order" ADD CONSTRAINT "Order_tenantId_billingAddressId_fkey" FOREIGN KEY ("tenantId", "billingAddressId") REFERENCES "core"."Address"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."OrderItem" ADD CONSTRAINT "OrderItem_tenantId_storeId_orderId_fkey" FOREIGN KEY ("tenantId", "storeId", "orderId") REFERENCES "store"."Order"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."OrderItem" ADD CONSTRAINT "OrderItem_tenantId_storeId_variantId_fkey" FOREIGN KEY ("tenantId", "storeId", "variantId") REFERENCES "store"."ProductVariant"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."OrderAdjustment" ADD CONSTRAINT "OrderAdjustment_tenantId_storeId_orderId_fkey" FOREIGN KEY ("tenantId", "storeId", "orderId") REFERENCES "store"."Order"("tenantId", "storeId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store"."OrderAdjustment" ADD CONSTRAINT "OrderAdjustment_tenantId_storeId_discountId_fkey" FOREIGN KEY ("tenantId", "storeId", "discountId") REFERENCES "store"."Discount"("tenantId", "storeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
