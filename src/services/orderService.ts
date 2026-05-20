import { db } from "../config/db";
import { AppError } from "../utils/appError";

export const getCartForUser = async (userId: string) => {
  const result = await db.query(
    `SELECT
      ci.id,
      ci.qty,
      p.id AS "productId",
      p.name,
      p.slug,
      p.description,
      p.price,
      p.discount_price AS "discountPrice",
      p.stock,
      p.thumbnail,
      p.gallery,
      p.benefits,
      p.ingredients,
      c.id AS "categoryId",
      c.name AS "categoryName",
      c.slug AS "categorySlug"
     FROM cart ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ci.user_id = $1
     ORDER BY ci.id DESC`,
    [userId]
  );

  return (result.rows as any[]).map((row: any) => ({
    id: row.id,
    qty: row.qty,
    product: {
      id: row.productId,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      discountPrice: row.discountPrice,
      stock: row.stock,
      thumbnail: row.thumbnail,
      gallery: row.gallery,
      benefits: row.benefits,
      ingredients: row.ingredients,
      category: {
        id: row.categoryId,
        name: row.categoryName,
        slug: row.categorySlug,
      },
      productImages: [],
      reviews: [],
    },
  }));
};

export const addCartItem = async (input: {
  userId: string;
  productId: string;
  qty: number;
}) => {
  const productCheck = await db.query(
    `SELECT id FROM products WHERE id = $1 AND status = 'PUBLISHED' LIMIT 1`,
    [input.productId]
  );

  if (!productCheck.rows[0]) {
    throw new AppError("Product not found", 404);
  }

  const existing = await db.query(
    `SELECT id, qty FROM cart WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
    [input.userId, input.productId]
  );

  if (existing.rows[0]) {
    await db.query(`UPDATE cart SET qty = qty + $1 WHERE id = $2`, [
      input.qty,
      existing.rows[0].id,
    ]);
  } else {
    await db.query(
      `INSERT INTO cart (id, user_id, product_id, qty)
       VALUES (gen_random_uuid()::text, $1, $2, $3)`,
      [input.userId, input.productId, input.qty]
    );
  }

  return (await getCartForUser(input.userId)).find(
    (item: any) => item.product.id === input.productId
  );
};

export const updateCartItemQty = async (input: {
  userId: string;
  cartItemId: string;
  qty: number;
}) =>
  db.query(`UPDATE cart SET qty = $1 WHERE id = $2 AND user_id = $3`, [
    Math.max(1, input.qty),
    input.cartItemId,
    input.userId,
  ]);

export const removeCartItem = async (input: {
  userId: string;
  cartItemId: string;
}) =>
  db.query(`DELETE FROM cart WHERE id = $1 AND user_id = $2`, [
    input.cartItemId,
    input.userId,
  ]);

export const createOrderForUser = async (input: {
  userId: string;
  shippingAddress: string;
  gateway: string;
}) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const cartItems = await getCartForUser(input.userId);
    if (cartItems.length === 0) {
      throw new AppError("Your cart is empty", 400);
    }

    const total = cartItems.reduce((sum: number, item: any) => {
      const unitPrice = Number(
        item.product.discountPrice ?? item.product.price ?? 0
      );
      return sum + unitPrice * item.qty;
    }, 0);

    const orderInsert = await client.query(
      `INSERT INTO orders (id, user_id, status, total, shipping_address, created_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
       RETURNING id, user_id AS "userId", status, total, shipping_address AS "shippingAddress", created_at AS "createdAt"`,
      [
        input.userId,
        input.gateway === "COD" ? "PROCESSING" : "PENDING",
        total,
        input.shippingAddress,
      ]
    );

    const order = orderInsert.rows[0];

    for (const item of cartItems) {
      const unitPrice = Number(item.product.discountPrice ?? item.product.price);
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, qty, price)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4)`,
        [order.id, item.product.id, item.qty, unitPrice]
      );

      await client.query(
        `UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
        [item.qty, item.product.id]
      );
    }

    const paymentInsert = await client.query(
      `INSERT INTO payments (id, order_id, gateway, transaction_id, amount, status)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)
       RETURNING id`,
      [
        order.id,
        input.gateway,
        `TXN-${Date.now()}`,
        total,
        input.gateway === "COD" ? "PENDING" : "PAID",
      ]
    );

    await client.query(`UPDATE orders SET payment_id = $1 WHERE id = $2`, [
      paymentInsert.rows[0].id,
      order.id,
    ]);

    await client.query(`DELETE FROM cart WHERE user_id = $1`, [input.userId]);

    await client.query("COMMIT");

    return {
      ...order,
      items: cartItems.map((item: any) => ({
        qty: item.qty,
        price: item.product.discountPrice ?? item.product.price,
        product: item.product,
      })),
      payment: {
        id: paymentInsert.rows[0].id,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getOrdersForUser = async (userId: string) => {
  const orders = await db.query(
    `SELECT id, user_id AS "userId", payment_id AS "paymentId", status, total, shipping_address AS "shippingAddress", created_at AS "createdAt"
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  const orderIds = (orders.rows as any[]).map((order: any) => order.id);
  if (orderIds.length === 0) {
    return [];
  }

  const [itemsResult, paymentsResult] = await Promise.all([
    db.query(
      `SELECT
        oi.order_id AS "orderId",
        oi.qty,
        oi.price,
        p.id AS "productId",
        p.name,
        p.slug,
        p.thumbnail
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ANY($1::text[])`,
      [orderIds]
    ),
    db.query(
      `SELECT id, order_id AS "orderId", gateway, transaction_id AS "transactionId", amount, status
       FROM payments
       WHERE order_id = ANY($1::text[])`,
      [orderIds]
    ),
  ]);

  return (orders.rows as any[]).map((order: any) => ({
    ...order,
    items: itemsResult.rows
      .filter((item: any) => item.orderId === order.id)
      .map((item: any) => ({
        qty: item.qty,
        price: item.price,
        product: {
          id: item.productId,
          name: item.name,
          slug: item.slug,
          thumbnail: item.thumbnail,
          productImages: [],
        },
      })),
    payment:
      (paymentsResult.rows as any[]).find(
        (payment: any) => payment.orderId === order.id
      ) ?? null,
  }));
};
