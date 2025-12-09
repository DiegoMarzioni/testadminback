import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanAndReseedOrders() {
  console.log('Cleaning existing orders...')

  await prisma.order.deleteMany({})
  await prisma.customer.deleteMany({})
  
  console.log('Orders and customers cleaned!')
  console.log('Done!')
}

async function main() {
  try {
    await cleanAndReseedOrders()
  } catch (error) {
    console.error('Error cleaning data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()