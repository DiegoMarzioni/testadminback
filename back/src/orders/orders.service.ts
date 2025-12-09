import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto, CreateCustomerDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: `${year}${month}${day}`,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }

  async create(createOrderDto: CreateOrderDto) {
    const { customerId, items, paymentMethod, shippingAddress, tax = 0, shipping = 0 } = createOrderDto;

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new BadRequestException('El cliente especificado no existe');
    }

    let subtotal = 0;
    const validatedItems: Array<{
      productId: string;
      quantity: number;
      price: number;
      total: number;
    }> = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(`El producto con ID ${item.productId} no existe`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Stock insuficiente para el producto ${product.name}`);
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
      });
    }

    const total = subtotal + tax + shipping;
    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.$transaction(async (prisma) => {
      
      const newOrder = await prisma.order.create({
        data: {
          orderNumber,
          customerId,
          subtotal,
          tax,
          shipping,
          total,
          paymentMethod,
          shippingAddress,
          items: {
            create: validatedItems,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      for (const item of validatedItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  }

  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async cancel(id: string) {
    const order = await this.findOne(id);

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new BadRequestException('No se puede cancelar una orden que ya fue entregada o cancelada');
    }

    const updatedOrder = await this.prisma.$transaction(async (prisma) => {
      
      const cancelledOrder = await prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.product.id },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return cancelledOrder;
    });

    return updatedOrder;
  }

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: createCustomerDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe un cliente con ese email');
      }
      throw error;
    }
  }

  async findAllCustomers() {
    return this.prisma.customer.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return customer;
  }

  async getRecentOrders(limit: number = 5) {
    return this.prisma.order.findMany({
      take: limit,
      include: {
        customer: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderStats() {
    const [totalOrders, pendingOrders, revenueResult] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: {
            not: 'CANCELLED',
          },
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: revenueResult._sum.total || 0,
    };
  }
}