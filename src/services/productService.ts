import { db } from "../config/db";

const buildProductRecords = async (rows: any[]) => {
  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);

  const [imagesResult, reviewsResult, faqResult] = await Promise.all([
    db.query(
      `SELECT id, product_id AS "productId", image_url AS "imageUrl"
       FROM product_images
       WHERE product_id = ANY($1::text[])`,
      [ids]
    ),
    db.query(
      `SELECT r.product_id AS "productId", r.rating, r.comment, u.name
       FROM reviews r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ANY($1::text[])`,
      [ids]
    ),
    db.query(
      `SELECT id, product_id AS "productId", question, answer
       FROM faq
       WHERE product_id = ANY($1::text[])`,
      [ids]
    ),
  ]);

  return rows.map((row: any) => ({
    ...row,
    category: {
      id: row.categoryId,
      name: row.categoryName,
      slug: row.categorySlug,
    },
    productImages: (imagesResult.rows as any[]).filter(
      (image: any) => image.productId === row.id
    ),
    reviews: reviewsResult.rows
      .filter((review: any) => review.productId === row.id)
      .map((review: any) => ({
        rating: review.rating,
        comment: review.comment,
        user: {
          name: review.name,
        },
      })),
    faqItems: (faqResult.rows as any[]).filter((faq: any) => faq.productId === row.id),
  }));
};

export const listProducts = async (query: {
  search?: string;
  category?: string;
  featured?: boolean;
}) => {
  const conditions = [`p.status = 'PUBLISHED'`];
  const values: unknown[] = [];

  if (query.search) {
    values.push(`%${query.search}%`);
    conditions.push(
      `(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`
    );
  }

  if (query.category) {
    values.push(query.category);
    conditions.push(`c.slug = $${values.length}`);
  }

  if (typeof query.featured === "boolean") {
    values.push(query.featured);
    conditions.push(`p.featured = $${values.length}`);
  }

  const result = await db.query(
    `SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.discount_price AS "discountPrice",
      p.stock,
      p.category_id AS "categoryId",
      p.thumbnail,
      p.gallery,
      p.benefits,
      p.ingredients,
      p.featured,
      p.created_at AS "createdAt",
      c.name AS "categoryName",
      c.slug AS "categorySlug"
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.created_at DESC`,
    values
  );

  return buildProductRecords(result.rows);
};

export const getProductBySlugOrId = async (value: string) => {
  const result = await db.query(
    `SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.discount_price AS "discountPrice",
      p.stock,
      p.category_id AS "categoryId",
      p.thumbnail,
      p.gallery,
      p.benefits,
      p.ingredients,
      p.featured,
      p.created_at AS "createdAt",
      c.name AS "categoryName",
      c.slug AS "categorySlug"
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.status = 'PUBLISHED'
       AND (p.id = $1 OR p.slug = $1)
     LIMIT 1`,
    [value]
  );

  const products = await buildProductRecords(result.rows);
  return products[0] ?? null;
};
