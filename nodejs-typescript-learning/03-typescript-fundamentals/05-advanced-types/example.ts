import { 
  Product, 
  ProductRepository, 
  applyDiscount, 
  isDiscountedProduct,
  ProductPreview
} from './product';

// Example usage
async function main() {
  // Create a new repository
  const productRepo = new ProductRepository();

  // Create a new product
  const newProduct: Omit<Product, 'id'> = {
    name: 'TypeScript Handbook',
    price: 29.99,
    currency: 'USD',
    category: 'books',
    description: 'Comprehensive guide to TypeScript',
    tags: ['typescript', 'programming', 'book'],
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Add product to repository
  const createdProduct = await productRepo.create(newProduct);
  console.log('Created Product:', createdProduct);

  // Create a product preview (using Pick)
  const productPreview: ProductPreview = {
    id: createdProduct.id,
    name: createdProduct.name,
    price: createdProduct.price,
    currency: createdProduct.currency,
    category: createdProduct.category
  };
  console.log('Product Preview:', productPreview);

  // Apply discount (using Intersection Types)
  const discountedProduct = applyDiscount(createdProduct, 0.15);
  console.log('Discounted Product:', discountedProduct);

  // Type guard example
  if (isDiscountedProduct(discountedProduct)) {
    console.log(`This product has a ${discountedProduct.discount * 100}% discount!`);
  }

  // Update product stock
  const updatedProduct = await productRepo.update(createdProduct.id, { stock: 95 });
  console.log('Updated Product Stock:', updatedProduct?.stock);

  // Get all products
  const allProducts = await productRepo.getAll();
  console.log('All Products Count:', allProducts.length);

  // Delete the product
  const isDeleted = await productRepo.delete(createdProduct.id);
  console.log('Product deleted:', isDeleted);
}

main().catch(console.error);
