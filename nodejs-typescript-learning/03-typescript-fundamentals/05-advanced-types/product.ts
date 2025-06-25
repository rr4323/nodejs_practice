// Product type definitions

type Currency = 'USD' | 'EUR' | 'GBP';
type Category = 'electronics' | 'clothing' | 'books' | 'home';

// Base Product interface
interface Product {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  category: Category;
  description?: string;
  tags: string[];
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Using Mapped Types to create readonly and optional versions
// This creates a type where all properties are readonly
type ReadonlyProduct = Readonly<Product>;

// This creates a type where all properties are optional
type PartialProduct = Partial<Product>;

// Using Pick to create a type with only specific properties
type ProductPreview = Pick<Product, 'id' | 'name' | 'price' | 'currency' | 'category'>;

// Using Omit to create a type without certain properties
type ProductWithoutDates = Omit<Product, 'createdAt' | 'updatedAt'>;

// Using Template Literal Types for ID formats
type ProductID = `prod_${string}`;
type OrderID = `order_${string}`;

// Using Intersection Types to create specialized product types
interface Discountable {
  discount: number;
  discountEndsAt?: Date;
}

type DiscountedProduct = Product & Discountable;

// Using Conditional Types
type ProductWithStock = {
  [K in keyof Product]: K extends 'stock' ? number : Product[K];
};

// Type Guards
function isDiscountedProduct(product: Product | DiscountedProduct): product is DiscountedProduct {
  return 'discount' in product;
}

// Utility function to apply discount
function applyDiscount(product: Product, discount: number): DiscountedProduct {
  return {
    ...product,
    discount,
    discountEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
  };
}

// Example of a type that uses generics with constraints
interface Repository<T extends { id: string }> {
  getById(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
}

// Implementation of Product Repository
class ProductRepository implements Repository<Product> {
  private products: Map<string, Product> = new Map();

  async getById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async create(item: Omit<Product, 'id'>): Promise<Product> {
    const id = `prod_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const newProduct: Product = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getById(id);
    if (!product) return undefined;

    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
}

export {
  Product,
  ProductID,
  Currency,
  Category,
  ReadonlyProduct,
  PartialProduct,
  ProductPreview,
  ProductWithoutDates,
  DiscountedProduct,
  ProductWithStock,
  isDiscountedProduct,
  applyDiscount,
  ProductRepository,
  Repository
};
