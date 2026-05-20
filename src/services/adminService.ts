import { db } from "../config/db";

export const getAdminDashboard = async () => {
  const [userCount, orderCount, productCount, blogCount, revenueResult, lowStock] =
    await Promise.all([
      db.query(`SELECT COUNT(*)::int AS count FROM users`),
      db.query(`SELECT COUNT(*)::int AS count FROM orders`),
      db.query(`SELECT COUNT(*)::int AS count FROM products`),
      db.query(`SELECT COUNT(*)::int AS count FROM blogs`),
      db.query(`SELECT COALESCE(SUM(total), 0) AS revenue FROM orders`),
      db.query(
        `SELECT id, name, slug, stock
         FROM products
         WHERE stock <= 10
         ORDER BY stock ASC`
      ),
    ]);

  const recentOrders = await db.query(
    `SELECT
      o.id,
      o.status,
      o.total,
      o.created_at AS "createdAt",
      u.name AS "customerName",
      u.email AS "customerEmail"
     FROM orders
     o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY created_at DESC
     LIMIT 5`
  );

  const recentCustomers = await db.query(
    `SELECT id, name, email, phone, created_at AS "createdAt"
     FROM users
     ORDER BY created_at DESC
     LIMIT 6`
  );

  return {
    stats: {
      users: userCount.rows[0].count,
      orders: orderCount.rows[0].count,
      products: productCount.rows[0].count,
      blogs: blogCount.rows[0].count,
      revenue: Number(revenueResult.rows[0].revenue),
    },
    lowStock: lowStock.rows,
    recentOrders: recentOrders.rows,
    recentCustomers: recentCustomers.rows,
  };
};

export const listAdminOrders = async () =>
  (
    await db.query(
      `SELECT
        o.id,
        o.status,
        o.total,
        o.shipping_address AS "shippingAddress",
        o.created_at AS "createdAt",
        u.name AS "customerName",
        u.email AS "customerEmail",
        u.phone AS "customerPhone"
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    )
  ).rows;

export const listAdminCustomers = async () =>
  (
    await db.query(
      `SELECT id, name, email, phone, status, created_at AS "createdAt"
       FROM users
       ORDER BY created_at DESC`
    )
  ).rows;
