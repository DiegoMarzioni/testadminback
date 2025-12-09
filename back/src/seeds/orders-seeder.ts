import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSampleOrders() {
  console.log('Getting existing admin users...')

  const adminUsers = await prisma.user.findMany({
    where: {
      isActive: true,
      role: {
        in: ['admin', 'seller', 'super_admin']
      }
    }
  })

  if (adminUsers.length < 2) {
    console.log('Need at least 2 admin users to create orders. Please run admins-seeder first.')
    return
  }

  console.log(`Found ${adminUsers.length} admin users for transactions`)

  let customers = await prisma.customer.findMany()
  
  if (customers.length === 0) {
    console.log('Creating sample customers...')
    customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'Cliente Externo 1',
          email: 'cliente1@external.com',
          phone: '+1234567890',
          address: 'Av. Principal 123, Ciudad'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Cliente Externo 2',
          email: 'cliente2@external.com', 
          phone: '+1234567891',
          address: 'Calle Secundaria 456, Ciudad'
        }
      })
    ])
  }

  console.log('Getting existing products with sellers...')
  const products = await prisma.product.findMany({ 
    take: 10,
    include: {
      seller: true
    }
  })
  
  if (products.length === 0) {
    console.log('No products found. Please create some products first.')
    return
  }

  console.log('Creating sample orders (Admin-to-Admin + External customers)...')

  const orders: any[] = []
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const orderDate = new Date(today)
    orderDate.setDate(today.getDate() - i)

    const ordersPerDay = Math.floor(Math.random() * 4) + 1
    
    for (let j = 0; j < ordersPerDay; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
      const subtotal = product.price * quantity
      const tax = subtotal * 0.16 
      const shipping = Math.random() > 0.5 ? 15 : 0 
      const total = subtotal + tax + shipping
      
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      const isAdminOrder = Math.random() > 0.3
      
      let customer, buyer, seller, paymentMethod, shippingAddress
      
      if (isAdminOrder) {
        
        buyer = adminUsers[Math.floor(Math.random() * adminUsers.length)]
        seller = product.seller || adminUsers[Math.floor(Math.random() * adminUsers.length)]

        if (buyer.id === seller.id && adminUsers.length > 1) {
          buyer = adminUsers.find(u => u.id !== seller.id) || adminUsers[0]
        }

        customer = customers[Math.floor(Math.random() * customers.length)]
        paymentMethod = 'TRANSFERENCIA_INTERNA'
        shippingAddress = `Oficina de ${buyer.name} - Dirección interna`
      } else {
        
        customer = customers[Math.floor(Math.random() * customers.length)]
        buyer = null
        seller = product.seller
        paymentMethod = ['TARJETA', 'TRANSFERENCIA', 'EFECTIVO'][Math.floor(Math.random() * 3)]
        shippingAddress = customer.address
      }

      const statuses = ['PENDING', 'EN_PREPARACION', 'ENVIADO', 'COMPLETADO', 'CANCELADO']
      const paymentStatuses = ['PENDING', 'PAGADO', 'FALLIDO']

      let orderStatus = statuses[Math.floor(Math.random() * statuses.length)]
      let paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]

      if (i < 5) {
        if (Math.random() > 0.6) {
          orderStatus = 'PENDING'
          paymentStatus = 'PENDING'
        }
      }
      
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          buyerId: buyer?.id,
          sellerId: seller?.id,
          status: orderStatus,
          paymentStatus: paymentStatus,
          subtotal,
          tax,
          shipping,
          total,
          paymentMethod,
          shippingAddress,
          notes: isAdminOrder 
            ? `Transacción interna: ${buyer?.name} → ${seller?.name}` 
            : 'Orden de cliente externo',
          createdAt: orderDate,
          items: {
            create: [
              {
                productId: product.id,
                quantity,
                price: product.price,
                total: product.price * quantity
              }
            ]
          },
          history: {
            create: [
              {
                action: 'CREATED',
                newValue: orderStatus,
                notes: isAdminOrder 
                  ? `Orden creada por ${buyer?.name}` 
                  : 'Orden creada por cliente',
                adminName: buyer?.name || 'Sistema',
                createdAt: orderDate
              }
            ]
          }
        }
      })
      
      orders.push(order)
    }
  }

  console.log(`Created ${orders.length} sample orders`)
  console.log(`- Admin-to-Admin orders: ~${Math.floor(orders.length * 0.7)}`)
  console.log(`- External customer orders: ~${Math.floor(orders.length * 0.3)}`)
  console.log('- Several orders left as PENDING for demo purposes')
  console.log('Sample data created successfully!')
}

export default createSampleOrders

async function main() {
  try {
    await createSampleOrders()
  } catch (error) {
    console.error('Error creating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}