import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    try {
      return await this.prisma.brand.create({
        data: createBrandDto,
        include: {
          _count: {
            select: { products: true }
          }
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe una marca con ese nombre');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          take: 10,
          include: {
            category: true,
          }
        },
        _count: {
          select: { products: true }
        }
      },
    });

    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.findOne(id);

    try {
      return await this.prisma.brand.update({
        where: { id },
        data: updateBrandDto,
        include: {
          _count: {
            select: { products: true }
          }
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe una marca con ese nombre');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const brand = await this.findOne(id);

    const productCount = await this.prisma.product.count({
      where: { brandId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException('No se puede eliminar una marca que tiene productos asociados');
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }
}