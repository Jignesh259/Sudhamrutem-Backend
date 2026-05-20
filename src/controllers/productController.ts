import type { Request, Response } from "express";
import { db } from "../config/db";
import { getProductBySlugOrId, listProducts } from "../services/productService";
import { asyncHandler } from "../utils/asyncHandler";
import { asString } from "../utils/request";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await listProducts({
    search: req.query.search?.toString(),
    category: req.query.category?.toString(),
    featured:
      req.query.featured !== undefined
        ? req.query.featured === "true"
        : undefined,
  });

  res.json({
    success: true,
    data: products,
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProductBySlugOrId(asString(req.params.id));
  res.json({
    success: true,
    data: product,
  });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const gallery = Array.isArray(req.body.gallery) ? req.body.gallery : [];
  const categoryName = asString(req.body.categoryName, "Wellness");
  const requestedCategoryId = asString(req.body.categoryId);
  let categoryId = requestedCategoryId;

  if (!categoryId) {
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existingCategory = await db.query(
      `SELECT id FROM categories WHERE slug = $1 LIMIT 1`,
      [categorySlug]
    );

    if (existingCategory.rows[0]) {
      categoryId = existingCategory.rows[0].id;
    } else {
      const createdCategory = await db.query(
        `INSERT INTO categories (id, name, slug)
         VALUES (gen_random_uuid()::text, $1, $2)
         RETURNING id`,
        [categoryName, categorySlug]
      );
      categoryId = createdCategory.rows[0].id;
    }
  }

  const created = await db.query(
    `INSERT INTO products (
      id, name, slug, description, price, discount_price, stock, category_id, thumbnail, gallery, benefits, ingredients, status, featured, created_at
     ) VALUES (
      gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, 'PUBLISHED', $12, NOW()
     )
     RETURNING *`,
    [
      req.body.name,
      asString(req.body.slug),
      asString(req.body.description),
      req.body.price,
      req.body.discountPrice ?? null,
      req.body.stock,
      categoryId,
      req.body.thumbnail,
      JSON.stringify(gallery),
      JSON.stringify(req.body.benefits ?? []),
      JSON.stringify(req.body.ingredients ?? []),
      Boolean(req.body.featured),
    ]
  );

  const product = created.rows[0];

  for (const imageUrl of gallery) {
    await db.query(
      `INSERT INTO product_images (id, product_id, image_url)
       VALUES (gen_random_uuid()::text, $1, $2)`,
      [product.id, imageUrl]
    );
  }

  res.status(201).json({
    success: true,
    message: "Product created",
    data: product,
  });
});
