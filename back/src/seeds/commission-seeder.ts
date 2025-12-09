import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning existing data...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  console.log('👤 Creating users...')

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Administrador',
      email: 'superadmin@testadmin.com',
      password: '$2b$10$YQGZx8sVqJsYJGxqJ2QM6.rKjFqL8YNDv1QXzY3vZ4W2FQzKp9B.O', 
      role: 'super_admin'
    }
  })

  const adminSellers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ana Rodríguez',
        email: 'ana.rodriguez@sportstore.com',
        password: '$2b$10$YQGZx8sVqJsYJGxqJ2QM6.rKjFqL8YNDv1QXzY3vZ4W2FQzKp9B.O',
        role: 'admin'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@sportstore.com', 
        password: '$2b$10$YQGZx8sVqJsYJGxqJ2QM6.rKjFqL8YNDv1QXzY3vZ4W2FQzKp9B.O',
        role: 'admin'
      }
    }),
    prisma.user.create({
      data: {
        name: 'María González',
        email: 'maria.gonzalez@sportstore.com',
        password: '$2b$10$YQGZx8sVqJsYJGxqJ2QM6.rKjFqL8YNDv1QXzY3vZ4W2FQzKp9B.O',
        role: 'admin'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Diego Martínez',
        email: 'diego.martinez@sportstore.com',
        password: '$2b$10$YQGZx8sVqJsYJGxqJ2QM6.rKjFqL8YNDv1QXzY3vZ4W2FQzKp9B.O',
        role: 'admin'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Laura Sánchez',
        email: 'laura.sanchez@sportstore.com',
        password: '$2b$10$YQGZx8sVqJsYJGxqJ2QM6.rKjFqL8YNDv1QXzY3vZ4W2FQzKp9B.O',
        role: 'admin'
      }
    })
  ])

  console.log('🏷️ Creating brands...')
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Wilson' } }),
    prisma.brand.create({ data: { name: 'Head' } }),
    prisma.brand.create({ data: { name: 'Babolat' } }),
    prisma.brand.create({ data: { name: 'Nike' } }),
    prisma.brand.create({ data: { name: 'Adidas' } }),
    prisma.brand.create({ data: { name: 'Yonex' } })
  ])

  console.log('📁 Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Raquetas', description: 'Raquetas de tenis profesionales' } }),
    prisma.category.create({ data: { name: 'Pelotas', description: 'Pelotas de tenis oficiales' } }),
    prisma.category.create({ data: { name: 'Ropa Deportiva', description: 'Indumentaria para tenis' } }),
    prisma.category.create({ data: { name: 'Calzado', description: 'Zapatillas especializadas' } }),
    prisma.category.create({ data: { name: 'Accesorios', description: 'Accesorios para tenistas' } })
  ])

  console.log('🛍️ Creating products with admin sellers...')
  const products = []

  const anaProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wilson Pro Staff RF97 Autograph',
        description: 'Raqueta signature de Roger Federer',
        price: 189.99,
        stock: 8, 
        categoryId: categories[0].id,
        brandId: brands[0].id,
        sellerId: adminSellers[0].id,
        status: 'ACTIVE'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Head Graphene 360+ Speed Pro',
        description: 'Raqueta utilizada por Novak Djokovic',
        price: 165.00,
        stock: 15,
        categoryId: categories[0].id,
        brandId: brands[1].id,
        sellerId: adminSellers[0].id,
        status: 'ACTIVE'
      }
    })
  ])

  const carlosProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Nike Court Dri-FIT Polo',
        description: 'Polo técnico para competición',
        price: 45.99,
        stock: 25,
        categoryId: categories[2].id,
        brandId: brands[3].id,
        sellerId: adminSellers[1].id,
        status: 'ACTIVE'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Adidas Club Tennis Shorts',
        description: 'Shorts ligeros para entrenamientos',
        price: 35.50,
        stock: 3, 
        categoryId: categories[2].id,
        brandId: brands[4].id,
        sellerId: adminSellers[1].id,
        status: 'ACTIVE'
      }
    })
  ])

  const mariaProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Nike Air Zoom Vapor X',
        description: 'Zapatillas de tenis de alta performance',
        price: 120.00,
        stock: 12,
        categoryId: categories[3].id,
        brandId: brands[3].id,
        sellerId: adminSellers[2].id,
        status: 'ACTIVE'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Adidas Barricade Court',
        description: 'Máxima durabilidad en canchas duras',
        price: 95.75,
        stock: 7, 
        categoryId: categories[3].id,
        brandId: brands[4].id,
        sellerId: adminSellers[2].id,
        status: 'ACTIVE'
      }
    })
  ])

  const diegoProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wilson US Open Tennis Balls',
        description: 'Pelotas oficiales del US Open',
        price: 8.99,
        stock: 50,
        categoryId: categories[1].id,
        brandId: brands[0].id,
        sellerId: adminSellers[3].id,
        status: 'ACTIVE'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Babolat Pure Aero String',
        description: 'Cuerda de alta tecnología',
        price: 12.50,
        stock: 2, 
        categoryId: categories[4].id,
        brandId: brands[2].id,
        sellerId: adminSellers[3].id,
        status: 'ACTIVE'
      }
    })
  ])

  const lauraProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Yonex EZONE 98 Tour',
        description: 'Raqueta de control y potencia equilibrada',
        price: 145.99,
        stock: 6, 
        categoryId: categories[0].id,
        brandId: brands[5].id,
        sellerId: adminSellers[4].id,
        status: 'ACTIVE'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Wilson Tennis Bag Pro',
        description: 'Bolso profesional para equipamiento',
        price: 65.00,
        stock: 18,
        categoryId: categories[4].id,
        brandId: brands[0].id,
        sellerId: adminSellers[4].id,
        status: 'ACTIVE'
      }
    })
  ])

  const allProducts = [...anaProducts, ...carlosProducts, ...mariaProducts, ...diegoProducts, ...lauraProducts]

  console.log('👥 Creating customers for admin orders...')
  
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Torneo Profesional Madrid',
        email: 'compras@torneomadrid.com',
        phone: '+34-91-123-4567',
        address: 'Centro Deportivo Madrid, Calle del Tenis 123, Madrid'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Club de Tenis Barcelona',
        email: 'admin@clubtenisbarcelona.com',
        phone: '+34-93-987-6543',
        address: 'Avda. Diagonal 456, Barcelona'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Academia Rafa Nadal',
        email: 'equipamiento@rnacademy.com',
        phone: '+34-87-555-0123',
        address: 'Carretera Cala Mesquida, Mallorca'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Federación Tenis Valencia',
        email: 'compras@ftenisvalencia.org',
        phone: '+34-96-321-7890',
        address: 'Plaza del Ayuntamiento 1, Valencia'
      }
    })
  ])

  console.log('📦 Creating realistic admin-to-admin orders...')
  const orders: any[] = []
  const today = new Date()

  for (let i = 0; i < 45; i++) {
    const orderDate = new Date(today)
    orderDate.setDate(today.getDate() - i)

    const ordersPerDay = Math.floor(Math.random() * 3) + 1
    
    for (let j = 0; j < ordersPerDay; j++) {
      const product = allProducts[Math.floor(Math.random() * allProducts.length)]
      const seller = adminSellers.find(admin => admin.id === product.sellerId)
      
      const customer = customers[Math.floor(Math.random() * customers.length)]
      
      const quantity = Math.floor(Math.random() * 3) + 1
      const subtotal = product.price * quantity
      const tax = subtotal * 0.21 
      const shipping = Math.random() > 0.7 ? 15 : 0
      const total = subtotal + tax + shipping
      
      const orderNumber = `#cmb${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4)}`

      let paymentStatus = 'PENDING'

      const shippingStatuses = ['PENDING', 'EN_PREPARACION', 'ENVIADO', 'COMPLETADO']
      let orderStatus = 'PENDING'

      if (i > 15) { 
        paymentStatus = Math.random() > 0.7 ? 'PAGADO' : 'PENDING' 
        orderStatus = shippingStatuses[Math.floor(Math.random() * shippingStatuses.length)]
      } else if (i > 7) { 
        paymentStatus = Math.random() > 0.8 ? 'PAGADO' : 'PENDING' 
        orderStatus = Math.random() > 0.5 ? 'EN_PREPARACION' : shippingStatuses[Math.floor(Math.random() * shippingStatuses.length)]
      } else {
        
        orderStatus = Math.random() > 0.6 ? 'PENDING' : shippingStatuses[Math.floor(Math.random() * 3)] 
      }
      
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          buyerId: null, 
          sellerId: seller?.id, 
          status: orderStatus,
          paymentStatus: paymentStatus,
          subtotal,
          tax,
          shipping,
          total,
          paymentMethod: 'TRANSFERENCIA_INTERNA',
          shippingAddress: `${customer.name} - ${customer.address}`,
          notes: `Venta de ${seller?.name} a ${customer.name} - Comisión ${paymentStatus === 'PENDING' ? 'pendiente' : 'procesada'}`,
          createdAt: orderDate,
          updatedAt: paymentStatus === 'PAGADO' ? new Date(orderDate.getTime() + 24 * 60 * 60 * 1000) : orderDate,
          items: {
            create: [
              {
                productId: product.id,
                quantity: quantity,
                price: product.price,
                total: product.price * quantity
              }
            ]
          }
        },
        include: {
          items: true,
          customer: true,
          buyer: true,
          seller: true
        }
      })
      
      orders.push(order)
    }
  }

  console.log(`\n✅ Seeder completed successfully!`)
  console.log(`📊 Created:`)
  console.log(`   • 1 Super Admin`)
  console.log(`   • 5 Admin Sellers with specialties`)
  console.log(`   • ${brands.length} Tennis Brands`)
  console.log(`   • ${categories.length} Product Categories`)
  console.log(`   • ${allProducts.length} Products (with low stock scenarios)`)
  console.log(`   • ${customers.length} B2B Customers`)
  console.log(`   • ${orders.length} Admin-to-Admin Orders`)
  console.log(`\n💰 Business Logic:`)
  console.log(`   • Orders have realistic payment processing timeline`)
  console.log(`   • Recent orders mostly PENDING (for demo)`)
  console.log(`   • Older orders more likely PAID (10% commission ready)`)
  console.log(`   • Multiple low-stock products for inventory alerts`)
  
  const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING')
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAGADO')
  const totalCommissions = paidOrders.reduce((sum, o) => sum + (o.total * 0.1), 0)
  
  console.log(`\n📈 Commission Summary:`)
  console.log(`   • ${pendingOrders.length} orders pending payment processing`)
  console.log(`   • ${paidOrders.length} orders paid (commissions earned)`)
  console.log(`   • $${totalCommissions.toFixed(2)} total commissions ready to view`)
  console.log(`\n🚀 Ready for testing!`)
}

main()
  .catch((e) => {
    console.error('❌ Seeder failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })