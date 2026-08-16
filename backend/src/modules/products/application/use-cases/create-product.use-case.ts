import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/ports/product.repository';

export interface CreateProductCommand {
  name: string;
  description?: string;
  priceCents: number;
  categoryId: string;
}

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    const product = Product.create({
      id: randomUUID(),
      ...command,
    });

    await this.productRepository.save(product);

    return product;
  }
}
