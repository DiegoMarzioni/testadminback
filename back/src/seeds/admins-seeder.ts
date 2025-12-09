import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUsers() {
  console.log('Creating admin users...')

  const adminUsers = [
    {
      name: 'Diego Marzioni',
      email: 'diego@testadmin.com',
      role: 'super_admin',
      isActive: true
    },
    {
      name: 'Ana Rodríguez',
      email: 'ana@testadmin.com',
      role: 'admin',
      isActive: true
    },
    {
      name: 'Carlos Mendoza',
      email: 'carlos@testadmin.com',
      role: 'seller',
      isActive: true
    },
    {
      name: 'María González',
      email: 'maria@testadmin.com',
      role: 'seller',
      isActive: true
    },
    {
      name: 'Luis Torres',
      email: 'luis@testadmin.com',
      role: 'admin',
      isActive: true
    }
  ]

  const defaultPassword = await bcrypt.hash('admin123', 10)

  for (const userData of adminUsers) {
    try {
      
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating...`)
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            name: userData.name,
            role: userData.role,
            isActive: userData.isActive
          }
        })
      } else {
        await prisma.user.create({
          data: {
            ...userData,
            password: defaultPassword
          }
        })
        console.log(`Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`)
      }
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error)
    }
  }

  console.log('Admin users created successfully!')
  console.log('Default password for all users: admin123')
}

async function assignSellersToProducts() {
  console.log('Assigning sellers to existing products...')

  const sellers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'seller' },
        { role: 'admin' },
        { role: 'super_admin' }
      ],
      isActive: true
    }
  })

  if (sellers.length === 0) {
    console.log('No sellers found')
    return
  }

  const products = await prisma.product.findMany({
    where: {
      sellerId: null
    }
  })

  console.log(`Found ${products.length} products to assign sellers`)

  for (const product of products) {
    const randomSeller = sellers[Math.floor(Math.random() * sellers.length)]
    
    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { sellerId: randomSeller.id }
      })
      console.log(`Assigned ${randomSeller.name} as seller for product: ${product.name}`)
    } catch (error) {
      console.error(`Error assigning seller to product ${product.name}:`, error)
    }
  }

  console.log('Sellers assigned to products successfully!')
}

async function main() {
  try {
    await createAdminUsers()
    await assignSellersToProducts()
  } catch (error) {
    console.error('Error in admin seeder:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()