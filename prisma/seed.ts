import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: pool,
});

async function main() {
  /**
   * ------------------------------------------------------------------
   * TENANT + STORE (minimal)
   * ------------------------------------------------------------------
   */
  const tenantSlug = process.env.SEED_TENANT_SLUG ?? 'demo-tenant';
  const tenantName = process.env.SEED_TENANT_NAME ?? 'Demo Tenant';

  const tenant =
    (await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    })) ??
    (await prisma.tenant.create({
      data: { name: tenantName, slug: tenantSlug },
    }));

  const storeCode = process.env.SEED_STORE_CODE ?? 'DEMO';
  const storeName = process.env.SEED_STORE_NAME ?? 'Demo Store';

  const store =
    (await prisma.store.findUnique({
      where: {
        tenantId_code: {
          tenantId: tenant.id,
          code: storeCode,
        },
      },
    })) ??
    (await prisma.store.create({
      data: {
        tenantId: tenant.id,
        code: storeCode,
        name: storeName,
        currency: 'EUR',
      },
    }));

  /**
   * ------------------------------------------------------------------
   * ADMIN USER
   * ------------------------------------------------------------------
   */
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@flex.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const adminRoleKey = process.env.SEED_ADMIN_ROLE_KEY ?? 'ADMIN';

  console.log(`Start seeding admin user (${email}) ...`);

  const adminRole = await prisma.role.upsert({
    where: {
      tenantId_key: {
        tenantId: tenant.id,
        key: adminRoleKey,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      key: adminRoleKey,
      name: 'Administrator',
    },
  });

  let user = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email,
      },
    },
  });

  if (!user) {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const passwordHash = await bcrypt.hash(password, rounds);

    user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
      },
    });

    console.log(`Created admin user with id: ${user.id}`);
  } else {
    console.log(`User ${email} already exists, skipping`);
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { users: { connect: { id: user.id } } },
  });

  await prisma.userRole.upsert({
    where: {
      tenantId_userId_roleId: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: user.id,
      roleId: adminRole.id,
    },
  });

  /**
   * ------------------------------------------------------------------
   * COLLECTION
   * ------------------------------------------------------------------
   */
  const collectionHandle = 't-shirts';

  const collection =
    (await prisma.collection.findUnique({
      where: {
        tenantId_storeId_handle: {
          tenantId: tenant.id,
          storeId: store.id,
          handle: collectionHandle,
        },
      },
    })) ??
    (await prisma.collection.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        title: 'T-Shirts',
        handle: collectionHandle,
        description: 'Demo collection for seeded products',
      },
    }));

  /**
   * ------------------------------------------------------------------
   * PRODUCT (FULL, WITH VARIANTS)
   * ------------------------------------------------------------------
   */
  const productHandle = 'flex-erp-tshirt';

  const existingProduct = await prisma.product.findUnique({
    where: {
      tenantId_storeId_handle: {
        tenantId: tenant.id,
        storeId: store.id,
        handle: productHandle,
      },
    },
  });

  if (existingProduct) {
    console.log('Seed product already exists, skipping product seed');
    return;
  }

  await prisma.$transaction(async (tx) => {
    // 1) Product
    const product = await tx.product.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        title: 'Flex ERP T-Shirt',
        handle: productHandle,
        description:
          'Official Flex ERP T-Shirt. Comfortable, durable, and perfect for shipping code at scale.',
        status: 'ACTIVE',
      },
    });

    // 2) Images
    await tx.productImage.createMany({
      data: [
        {
          tenantId: tenant.id,
          storeId: store.id,
          productId: product.id,
          url: 'https://picsum.photos/seed/flex-shirt-front/800/800',
          alt: 'Flex ERP T-Shirt front',
          position: 0,
        },
        {
          tenantId: tenant.id,
          storeId: store.id,
          productId: product.id,
          url: 'https://picsum.photos/seed/flex-shirt-back/800/800',
          alt: 'Flex ERP T-Shirt back',
          position: 1,
        },
      ],
    });

    // 3) Options
    const sizeOption = await tx.productOption.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        productId: product.id,
        name: 'Size',
        position: 0,
      },
    });

    const colorOption = await tx.productOption.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        productId: product.id,
        name: 'Color',
        position: 1,
      },
    });

    // 4) Option values
    const sizes = ['S', 'M', 'L'] as const;
    const colors = ['Black', 'White'] as const;

    const sizeValues = await Promise.all(
      sizes.map((value, idx) =>
        tx.productOptionValue.create({
          data: {
            tenantId: tenant.id,
            storeId: store.id,
            optionId: sizeOption.id,
            value,
            position: idx,
          },
        }),
      ),
    );

    const colorValues = await Promise.all(
      colors.map((value, idx) =>
        tx.productOptionValue.create({
          data: {
            tenantId: tenant.id,
            storeId: store.id,
            optionId: colorOption.id,
            value,
            position: idx,
          },
        }),
      ),
    );

    // 5) Variants (Size × Color)
    let variantPosition = 0;

    for (const size of sizeValues) {
      for (const color of colorValues) {
        const title = `${product.title} - ${size.value} / ${color.value}`;
        const sku = `TSHIRT-${size.value}-${color.value}`.toUpperCase();

        const variant = await tx.productVariant.create({
          data: {
            tenantId: tenant.id,
            storeId: store.id,
            productId: product.id,
            title,
            sku,
            priceAmount: 2500,
            currency: 'EUR',
            compareAtAmount: 3000,
            inventoryQuantity: 50,
            allowBackorder: false,
            position: variantPosition++,
          },
        });

        await tx.variantOptionValue.createMany({
          data: [
            {
              tenantId: tenant.id,
              storeId: store.id,
              variantId: variant.id,
              optionValueId: size.id,
            },
            {
              tenantId: tenant.id,
              storeId: store.id,
              variantId: variant.id,
              optionValueId: color.id,
            },
          ],
        });
      }
    }

    // 6) Attach to collection
    await tx.collectionProduct.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        collectionId: collection.id,
        productId: product.id,
      },
    });

    console.log(`Seeded full product with variants: ${product.title}`);
  });

  console.log(`Admin credentials -> email: ${email} | password: ${password}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
