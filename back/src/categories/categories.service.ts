import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      
      const lastCategory = await this.prisma.category.findFirst({
        where: { parentId: createCategoryDto.parentId || null },
        orderBy: { position: 'desc' }
      });
      
      const nextPosition = (lastCategory?.position || 0) + 1;
      
      return await this.prisma.category.create({
        data: {
          ...createCategoryDto,
          position: nextPosition
        },
        include: {
          parent: true,
          children: true,
          _count: {
            select: { products: true }
          }
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true, children: true }
        }
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async getMainCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true }
            }
          },
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { products: true, children: true }
        }
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async getSubcategories(parentId: string) {
    return this.prisma.category.findMany({
      where: { parentId, isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, isActive: true },
      include: {
        parent: true,
        children: {
          where: { isActive: true }
        },
        products: {
          take: 10, 
        },
        _count: {
          select: { products: true, children: true }
        }
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (updateCategoryDto.parentId === id) {
      throw new BadRequestException('Una categoría no puede ser padre de sí misma');
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
        include: {
          parent: true,
          children: true,
          _count: {
            select: { products: true }
          }
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException('No se puede eliminar una categoría que tiene productos asociados');
    }

    const childrenCount = await this.prisma.category.count({
      where: { parentId: id, isActive: true },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('No se puede eliminar una categoría que tiene subcategorías');
    }

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
    });
  }
}