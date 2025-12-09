const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...');

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tennis-star.com' },
    update: {},
    create: {
      email: 'admin@tennis-star.com',
      password: hashedPassword,
      name: 'Administrador',
    },
  });
  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear marcas primero
  const adidasBrand = await prisma.brand.upsert({
    where: { name: 'Adidas' },
    update: {},
    create: { name: 'Adidas' },
  });

  const coquetaBrand = await prisma.brand.upsert({
    where: { name: 'Coqueta' },
    update: {},
    create: { name: 'Coqueta' },
  });

  const quirelliBrand = await prisma.brand.upsert({
    where: { name: 'Quirelli' },
    update: {},
    create: { name: 'Quirelli' },
  });

  console.log('✅ Marcas creadas');

  // Crear categorías principales
  const hombreCategory = await prisma.category.upsert({
    where: { name: 'Hombre' },
    update: {},
    create: { name: 'Hombre', description: 'Productos para hombres', position: 0 },
  });

  const mujerCategory = await prisma.category.upsert({
    where: { name: 'Mujer' },
    update: {},
    create: { name: 'Mujer', description: 'Productos para mujeres', position: 1 },
  });

  const ninosCategory = await prisma.category.upsert({
    where: { name: 'Niños' },
    update: {},
    create: { name: 'Niños', description: 'Productos para niños', position: 2 },
  });

  console.log('✅ Categorías principales creadas');

  // Crear subcategorías
  const basketballCategory = await prisma.category.upsert({
    where: { name: 'Basketball' },
    update: {},
    create: { name: 'Basketball', parentId: hombreCategory.id, position: 1 },
  });

  const casualCategory = await prisma.category.upsert({
    where: { name: 'Casual' },
    update: {},
    create: { name: 'Casual', parentId: hombreCategory.id, position: 4 },
  });

  console.log('✅ Subcategorías creadas');

  // Crear productos
  const products = [
    {
      name: 'Tenis Adidas VL Court Base - ID3715',
      description: 'Tenis cómodos para uso diario',
      price: 2500,
      stock: 12,
      sku: 'ID3715',
      categoryId: casualCategory.id,
      brandId: adidasBrand.id,
    },
    {
      name: 'Adidas Tensaur - Gw6456',
      description: 'Zapatillas resistentes para todas las actividades',
      price: 2200,
      stock: 8,
      sku: 'GW6456',
      categoryId: casualCategory.id,
      brandId: adidasBrand.id,
    },
    {
      name: 'Bota Escolar Audaz Niño 433306-a',
      description: 'Botas negras escolares',
      price: 1800,
      stock: 11,
      sku: '433306-A',
      categoryId: ninosCategory.id,
      brandId: coquetaBrand.id,
    },
  ];

  for (const product of products) {
    const createdProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
    console.log('✅ Producto creado:', createdProduct.name);
  }

  // Crear clientes
  const customer1 = await prisma.customer.upsert({
    where: { email: 'jaime@example.com' },
    update: {},
    create: {
      name: 'Jaime González Correa',
      email: 'jaime@example.com',
      phone: '5519233104',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: 'santiago@example.com' },
    update: {},
    create: {
      name: 'Santiago Perez Baglivo',
      email: 'santiago@example.com',
      phone: '5512345678',
    },
  });

  console.log('✅ Clientes creados');

  console.log('🎉 Seeds completados exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });