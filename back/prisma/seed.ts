import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds completos...');

  // PASO 1: Crear usuarios administradores
  console.log('\n👥 Creando usuarios administradores...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUsers = [
    { name: 'Super Administrador', email: 'superadmin@testadmin.com', role: 'super_admin' },
    { name: 'Diego Marzioni', email: 'diego@testadmin.com', role: 'super_admin' },
    { name: 'Ana Rodríguez', email: 'ana@testadmin.com', role: 'admin' },
    { name: 'Carlos Mendoza', email: 'carlos@testadmin.com', role: 'seller' },
    { name: 'María González', email: 'maria@testadmin.com', role: 'seller' },
    { name: 'Luis Torres', email: 'luis@testadmin.com', role: 'admin' },
  ];

  const createdAdmins: any[] = [];
  for (const userData of adminUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name, role: userData.role as any },
      create: {
        ...userData,
        password: hashedPassword,
        isActive: true,
      },
    });
    createdAdmins.push(user);
    console.log(`✅ Usuario creado: ${user.name} (${user.email}) - Role: ${user.role}`);
  }

  // PASO 2: Crear marcas
  console.log('\n🏷️ Creando marcas...');
  const brandNames = ['Adidas', 'Nike', 'Coqueta', 'Quirelli', 'Wilson', 'Head', 'Babolat', 'Yonex'];
  const createdBrands: any[] = [];
  
  for (const name of brandNames) {
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdBrands.push(brand);
    console.log(`✅ Marca creada: ${brand.name}`);
  }

  // PASO 3: Crear categorías y subcategorías
  console.log('\n📁 Creando categorías...');
  const categories = [
    { name: 'Hombre', description: 'Productos para hombres', position: 0 },
    { name: 'Mujer', description: 'Productos para mujeres', position: 1 },
    { name: 'Niños', description: 'Productos para niños', position: 2 },
    { name: 'Raquetas', description: 'Raquetas de tenis profesionales', position: 3 },
    { name: 'Pelotas', description: 'Pelotas de tenis oficiales', position: 4 },
    { name: 'Ropa Deportiva', description: 'Indumentaria para tenis', position: 5 },
    { name: 'Calzado', description: 'Zapatillas especializadas', position: 6 },
    { name: 'Accesorios', description: 'Accesorios para tenistas', position: 7 },
  ];

  const createdCategories: any[] = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
    console.log(`✅ Categoría creada: ${category.name}`);
  }

  // Crear subcategorías
  const subcategories = [
    { name: 'Basketball', parentId: createdCategories[0].id, position: 1 },
    { name: 'Botas', parentId: createdCategories[0].id, position: 2 },
    { name: 'Running', parentId: createdCategories[0].id, position: 3 },
    { name: 'Casual', parentId: createdCategories[0].id, position: 4 },
    { name: 'Industrial', parentId: createdCategories[0].id, position: 5 },
    { name: 'Sport', parentId: createdCategories[0].id, position: 6 },
    { name: 'Soccer', parentId: createdCategories[0].id, position: 7 },
    { name: 'Vestir', parentId: createdCategories[1].id, position: 1 },
  ];

  const createdSubcategories: any[] = [];
  for (const subcat of subcategories) {
    const subcategory = await prisma.category.upsert({
      where: { name: subcat.name },
      update: {},
      create: subcat,
    });
    createdSubcategories.push(subcategory);
    console.log(`✅ Subcategoría creada: ${subcategory.name}`);
  }

  // PASO 4: Crear productos variados con asignación de sellers
  console.log('\n🛍️ Creando productos...');
  
  // Referencias rápidas
  const casualCategory = createdSubcategories.find(c => c.name === 'Casual') || createdCategories[0];
  const sportCategory = createdSubcategories.find(c => c.name === 'Sport') || createdCategories[0];
  const ninosCategory = createdCategories.find(c => c.name === 'Niños');
  const raquetasCategory = createdCategories.find(c => c.name === 'Raquetas');
  const pelotasCategory = createdCategories.find(c => c.name === 'Pelotas');
  const ropaCategory = createdCategories.find(c => c.name === 'Ropa Deportiva');
  const calzadoCategory = createdCategories.find(c => c.name === 'Calzado');
  const accesoriosCategory = createdCategories.find(c => c.name === 'Accesorios');

  const adidasBrand = createdBrands.find(b => b.name === 'Adidas');
  const nikeBrand = createdBrands.find(b => b.name === 'Nike');
  const coquetaBrand = createdBrands.find(b => b.name === 'Coqueta');
  const quirelliBrand = createdBrands.find(b => b.name === 'Quirelli');
  const wilsonBrand = createdBrands.find(b => b.name === 'Wilson');
  const headBrand = createdBrands.find(b => b.name === 'Head');
  const babolatBrand = createdBrands.find(b => b.name === 'Babolat');
  const yonexBrand = createdBrands.find(b => b.name === 'Yonex');

  const products = [
    // Productos originales
    { name: 'Tenis Adidas VL Court Base - ID3715', description: 'Tenis cómodos para uso diario', price: 2500, stock: 12, sku: 'ID3715', categoryId: casualCategory.id, brandId: adidasBrand?.id, sellerId: createdAdmins[2].id },
    { name: 'Zapatillas Adidas Grand Court Lifestyle', description: 'Zapatillas para jóvenes', price: 2800, stock: 18, sku: 'ID3715-GC', categoryId: casualCategory.id, brandId: adidasBrand?.id, sellerId: createdAdmins[2].id },
    { name: 'Adidas Tensaur - Gw6456', description: 'Zapatillas resistentes', price: 2200, stock: 8, sku: 'GW6456', categoryId: sportCategory.id, brandId: adidasBrand?.id, sellerId: createdAdmins[3].id },
    { name: 'Adidas VI Court 3.0-ID9062', description: 'Tenis de gamuza con amortiguación', price: 3200, stock: 18, sku: 'ID9062', categoryId: casualCategory.id, brandId: adidasBrand?.id, sellerId: createdAdmins[2].id },
    { name: 'Bota Escolar Audaz Niño 433306-a', description: 'Botas negras escolares', price: 1800, stock: 11, sku: '433306-A', categoryId: ninosCategory?.id, brandId: coquetaBrand?.id, sellerId: createdAdmins[4].id },
    { name: 'Bota Escolar Audaz Juvenil 433306-a', description: 'Botas negras escolares juvenil', price: 2000, stock: 15, sku: '433306-AJ', categoryId: ninosCategory?.id, brandId: coquetaBrand?.id, sellerId: createdAdmins[4].id },
    { name: 'Zapatillas adidas Tensaur Run 3.0 Niños', description: 'Zapatillas para niños', price: 2400, stock: 17, sku: 'JP9642', categoryId: ninosCategory?.id, brandId: adidasBrand?.id, sellerId: createdAdmins[4].id },
    { name: 'Quirelli 88404', description: 'Zapato casual urbano negro', price: 2800, stock: 12, sku: 'Q88404', categoryId: casualCategory.id, brandId: quirelliBrand?.id, sellerId: createdAdmins[3].id },
    { name: 'Quirelli 88602', description: 'Zapato parte de nueva colección', price: 3100, stock: 12, sku: 'Q88602', categoryId: casualCategory.id, brandId: quirelliBrand?.id, sellerId: createdAdmins[3].id },
    
    // Productos de tenis profesional
    { name: 'Wilson Pro Staff RF97 Autograph', description: 'Raqueta signature de Roger Federer', price: 18999, stock: 8, sku: 'WRF97', categoryId: raquetasCategory?.id, brandId: wilsonBrand?.id, sellerId: createdAdmins[2].id },
    { name: 'Head Graphene 360+ Speed Pro', description: 'Raqueta de Novak Djokovic', price: 16500, stock: 15, sku: 'HG360SP', categoryId: raquetasCategory?.id, brandId: headBrand?.id, sellerId: createdAdmins[2].id },
    { name: 'Yonex EZONE 98 Tour', description: 'Control y potencia equilibrada', price: 14599, stock: 6, sku: 'YEZ98T', categoryId: raquetasCategory?.id, brandId: yonexBrand?.id, sellerId: createdAdmins[5].id },
    { name: 'Nike Court Dri-FIT Polo', description: 'Polo técnico para competición', price: 4599, stock: 25, sku: 'NCD-POLO', categoryId: ropaCategory?.id, brandId: nikeBrand?.id, sellerId: createdAdmins[3].id },
    { name: 'Adidas Club Tennis Shorts', description: 'Shorts ligeros para entrenamientos', price: 3550, stock: 3, sku: 'ACT-SHORT', categoryId: ropaCategory?.id, brandId: adidasBrand?.id, sellerId: createdAdmins[3].id },
    { name: 'Nike Air Zoom Vapor X', description: 'Zapatillas de alta performance', price: 12000, stock: 12, sku: 'NAZV-X', categoryId: calzadoCategory?.id, brandId: nikeBrand?.id, sellerId: createdAdmins[4].id },
    { name: 'Adidas Barricade Court', description: 'Máxima durabilidad', price: 9575, stock: 7, sku: 'ABC-COURT', categoryId: calzadoCategory?.id, brandId: adidasBrand?.id, sellerId: createdAdmins[4].id },
    { name: 'Wilson US Open Tennis Balls', description: 'Pelotas oficiales US Open', price: 899, stock: 50, sku: 'WUS-BALLS', categoryId: pelotasCategory?.id, brandId: wilsonBrand?.id, sellerId: createdAdmins[5].id },
    { name: 'Babolat Pure Aero String', description: 'Cuerda de alta tecnología', price: 1250, stock: 2, sku: 'BPA-STRING', categoryId: accesoriosCategory?.id, brandId: babolatBrand?.id, sellerId: createdAdmins[5].id },
    { name: 'Wilson Tennis Bag Pro', description: 'Bolso profesional', price: 6500, stock: 18, sku: 'WTB-PRO', categoryId: accesoriosCategory?.id, brandId: wilsonBrand?.id, sellerId: createdAdmins[5].id },
  ];

  const createdProducts: any[] = [];
  for (const product of products) {
    if (!product.brandId || !product.categoryId) continue;
    
    const createdProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: { ...product, status: 'ACTIVE' },
    });
    createdProducts.push(createdProduct);
    console.log(`✅ Producto creado: ${createdProduct.name} (Stock: ${createdProduct.stock})`);
  }

  // PASO 5: Crear clientes (organizaciones y externos)
  console.log('\n👥 Creando clientes...');
  const customers = [
    { name: 'Jaime González Correa', email: 'jaimegonzalez.099@yahoo.com.mx', phone: '5519233104', address: 'Int. 3e64431c-8cc4-4624-3c81-8e5ed15e750e' },
    { name: 'Santiago Perez Baglivo', email: 'santiagoperezbaglivo@gmail.com', phone: '5512345678', address: 'Av. Hacienda de sierra vieja 02 local 1431, Cuautitlan Izcalli' },
    { name: 'Torneo Profesional Madrid', email: 'compras@torneomadrid.com', phone: '+34-91-123-4567', address: 'Centro Deportivo Madrid, Calle del Tenis 123' },
    { name: 'Club de Tenis Barcelona', email: 'admin@clubtenisbarcelona.com', phone: '+34-93-987-6543', address: 'Avda. Diagonal 456, Barcelona' },
    { name: 'Academia Rafa Nadal', email: 'equipamiento@rnacademy.com', phone: '+34-87-555-0123', address: 'Carretera Cala Mesquida, Mallorca' },
    { name: 'Federación Tenis Valencia', email: 'compras@ftenisvalencia.org', phone: '+34-96-321-7890', address: 'Plaza del Ayuntamiento 1, Valencia' },
  ];

  const createdCustomers: any[] = [];
  for (const customer of customers) {
    const createdCustomer = await prisma.customer.upsert({
      where: { email: customer.email },
      update: {},
      create: customer,
    });
    createdCustomers.push(createdCustomer);
    console.log(`✅ Cliente creado: ${createdCustomer.name}`);
  }

  // PASO 6: Crear órdenes realistas de los últimos 45 días
  console.log('\n📦 Creando órdenes de ejemplo...');
  const ordersCreated: any[] = [];
  const today = new Date();
  
  for (let i = 0; i < 45; i++) {
    const orderDate = new Date(today);
    orderDate.setDate(today.getDate() - i);
    
    const ordersPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < ordersPerDay; j++) {
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const seller = createdAdmins.find(a => a.id === product.sellerId);
      
      const quantity = Math.floor(Math.random() * 3) + 1;
      const subtotal = product.price * quantity;
      const tax = subtotal * 0.16;
      const shipping = Math.random() > 0.7 ? 150 : 0;
      const total = subtotal + tax + shipping;
      
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const statuses = ['PENDING', 'EN_PREPARACION', 'ENVIADO', 'COMPLETADO', 'CANCELADO'];
      const paymentStatuses = ['PENDING', 'PAGADO', 'FALLIDO'];
      
      // 70% de órdenes son transferencias internas (admin-to-admin)
      const isInternalTransfer = Math.random() > 0.3;
      const paymentMethod = isInternalTransfer ? 'TRANSFERENCIA_INTERNA' : ['TARJETA', 'TRANSFERENCIA', 'EFECTIVO'][Math.floor(Math.random() * 3)];
      
      let orderStatus = 'PENDING';
      let paymentStatus = 'PENDING';
      
      // Órdenes antiguas más probabilidad de estar pagadas/completadas
      if (i > 15) {
        paymentStatus = Math.random() > 0.7 ? 'PAGADO' : 'PENDING';
        orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
      } else if (i > 7) {
        paymentStatus = Math.random() > 0.8 ? 'PAGADO' : 'PENDING';
        orderStatus = Math.random() > 0.5 ? 'EN_PREPARACION' : statuses[Math.floor(Math.random() * 3)];
      } else {
        orderStatus = Math.random() > 0.6 ? 'PENDING' : statuses[Math.floor(Math.random() * 3)];
      }
      
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          buyerId: null,
          sellerId: seller?.id || null,
          status: orderStatus,
          paymentStatus: paymentStatus,
          subtotal,
          tax,
          shipping,
          total,
          paymentMethod: paymentMethod,
          shippingAddress: customer.address,
          notes: seller ? `Venta de ${seller.name} a ${customer.name}` : null,
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: [{
              productId: product.id,
              quantity,
              price: product.price,
              total: product.price * quantity
            }]
          }
        }
      });
      
      ordersCreated.push(order);
    }
  }
  
  console.log(`✅ ${ordersCreated.length} órdenes creadas`);

  // Resumen final
  const pendingOrders = ordersCreated.filter((o: any) => o.paymentStatus === 'PENDING');
  const paidOrders = ordersCreated.filter((o: any) => o.paymentStatus === 'PAGADO');
  
  console.log('\n🎉 Seeds completados exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   • ${createdAdmins.length} Usuarios administradores`);
  console.log(`   • ${createdBrands.length} Marcas`);
  console.log(`   • ${createdCategories.length + createdSubcategories.length} Categorías`);
  console.log(`   • ${createdProducts.length} Productos`);
  console.log(`   • ${createdCustomers.length} Clientes`);
  console.log(`   • ${ordersCreated.length} Órdenes`);
  console.log(`\n💰 Estado de pagos:`);
  console.log(`   • ${pendingOrders.length} órdenes pendientes de pago`);
  console.log(`   • ${paidOrders.length} órdenes pagadas`);
  console.log(`\n🔑 Credenciales de acceso:`);
  console.log(`   Email: superadmin@testadmin.com`);
  console.log(`   Password: admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });