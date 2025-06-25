"use strict";
// Product type definitions
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
exports.isDiscountedProduct = isDiscountedProduct;
exports.applyDiscount = applyDiscount;
// Type Guards
function isDiscountedProduct(product) {
    return 'discount' in product;
}
// Utility function to apply discount
function applyDiscount(product, discount) {
    return {
        ...product,
        discount,
        discountEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
    };
}
// Implementation of Product Repository
class ProductRepository {
    constructor() {
        this.products = new Map();
    }
    async getById(id) {
        return this.products.get(id);
    }
    async getAll() {
        return Array.from(this.products.values());
    }
    async create(item) {
        const id = `prod_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        const newProduct = {
            ...item,
            id,
            createdAt: now,
            updatedAt: now,
        };
        this.products.set(id, newProduct);
        return newProduct;
    }
    async update(id, updates) {
        const product = await this.getById(id);
        if (!product)
            return undefined;
        const updatedProduct = {
            ...product,
            ...updates,
            updatedAt: new Date(),
        };
        this.products.set(id, updatedProduct);
        return updatedProduct;
    }
    async delete(id) {
        return this.products.delete(id);
    }
}
exports.ProductRepository = ProductRepository;
