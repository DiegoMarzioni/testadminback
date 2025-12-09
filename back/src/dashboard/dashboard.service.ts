import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      topSellingProducts,
    ] = await Promise.all([
      
      this.prisma.product.count({
        where: { status: 'ACTIVE' }
      }),

      this.prisma.category.count(),

      this.prisma.order.count(),

      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'CANCELLED' }
        }
      }),

      this.prisma.order.findMany({
        take: 5,
        include: {
          customer: true,
          _count: { select: { items: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),

      this.prisma.product.findMany({
        where: {
          stock: { lte: 10 },
          status: 'ACTIVE'
        },
        include: {
          category: true,
          brand: true
        },
        take: 10,
        orderBy: { stock: 'asc' }
      }),

      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        take: 5,
        orderBy: { _sum: { quantity: 'desc' } }
      })
    ]);

    const topProductsIds = topSellingProducts.map(item => item.productId);
    const topProductsDetails = await this.prisma.product.findMany({
      where: { id: { in: topProductsIds } },
      include: {
        category: true,
        brand: true
      }
    });

    const topProductsWithSales = topSellingProducts.map(item => {
      const product = topProductsDetails.find(p => p.id === item.productId);
      return {
        product,
        totalSold: item._sum.quantity
      };
    });

    const inventoryValue = await this.prisma.product.aggregate({
      _sum: {
        stock: true
      },
      where: {
        status: 'ACTIVE'
      }
    });

    const inventoryValueAmount = await this.prisma.$queryRaw<{total_value: number}[]>`
      SELECT SUM(price * stock) as total_value
      FROM products
      WHERE status = 'ACTIVE'
    `;

    return {
      overview: {
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        inventoryValue: inventoryValueAmount[0]?.total_value || 0,
        totalStock: inventoryValue._sum.stock || 0
      },
      recentOrders,
      lowStockProducts,
      topSellingProducts: topProductsWithSales
    };
  }

  async getInventoryStats() {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStockProducts,
      lowStockProducts,
      inventoryValue
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { status: 'INACTIVE' } }),
      this.prisma.product.count({ 
        where: { 
          stock: 0,
          status: 'ACTIVE'
        }
      }),
      this.prisma.product.count({
        where: {
          stock: { lte: 10, gt: 0 },
          status: 'ACTIVE'
        }
      }),
      this.prisma.$queryRaw<{total_value: number}[]>`
        SELECT SUM(price * stock) as total_value
        FROM products
        WHERE status = 'ACTIVE'
      `
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStockProducts,
      lowStockProducts,
      inventoryValue: inventoryValue[0]?.total_value || 0
    };
  }

  async getSalesStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalSales,
      salesRevenue,
      averageOrderValue,
      recentOrders
    ] = await Promise.all([
      
      this.prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      }),

      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      }),

      this.prisma.order.aggregate({
        _avg: { total: true },
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      }),

      this.prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    ]);

    const dailySalesMap = new Map<string, { orders_count: number; total_revenue: number }>();
    
    recentOrders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dailySalesMap.has(dateKey)) {
        dailySalesMap.set(dateKey, { orders_count: 0, total_revenue: 0 });
      }
      const dayData = dailySalesMap.get(dateKey)!;
      dayData.orders_count += 1;
      dayData.total_revenue += order.total;
    });

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date)) 
      .slice(-30); 

    return {
      period: `${days} días`,
      totalSales,
      salesRevenue: salesRevenue._sum.total || 0,
      averageOrderValue: averageOrderValue._avg.total || 0,
      dailySales
    };
  }

  async getRecentSales() {
    return this.prisma.order.findMany({
      take: 10,
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      where: {
        status: { not: 'CANCELLED' }
      }
    });
  }

  async getTopProducts() {
    
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    const productIds = topProducts.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        brand: true
      }
    });

    return topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        product,
        totalSold: item._sum.quantity || 0,
        ordersCount: item._count.id
      };
    });
  }

  async getInventorySummary() {
    const [
      totalProducts,
      totalValue,
      lowStockProducts,
      outOfStockProducts,
      productsByCategory
    ] = await Promise.all([
      
      this.prisma.product.count({
        where: { status: 'ACTIVE' }
      }),

      this.prisma.product.aggregate({
        _sum: {
          price: true
        },
        where: { status: 'ACTIVE' }
      }),

      this.prisma.product.findMany({
        where: {
          stock: { lt: 10, gt: 0 },
          status: 'ACTIVE'
        },
        include: {
          category: true,
          brand: true
        },
        orderBy: { stock: 'asc' },
        take: 10
      }),

      this.prisma.product.count({
        where: {
          stock: 0,
          status: 'ACTIVE'
        }
      }),

      this.prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          },
          products: {
            where: { status: 'ACTIVE' },
            select: {
              stock: true,
              price: true
            }
          }
        }
      })
    ]);

    const categoryStats = productsByCategory.map(category => ({
      category: category.name,
      totalProducts: category._count.products,
      totalStock: category.products.reduce((sum, product) => sum + product.stock, 0),
      totalValue: category.products.reduce((sum, product) => sum + (product.price * product.stock), 0)
    }));

    return {
      totalProducts,
      totalValue: totalValue._sum.price || 0,
      lowStockProducts,
      outOfStockCount: outOfStockProducts,
      categoryStats
    };
  }
}