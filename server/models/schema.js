const { pgTable, serial, text, varchar, integer, timestamp, boolean, pgEnum } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// Create Role enum type
const userRoleEnum = pgEnum('user_role', ['admin', 'staff']);

// Users table
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories table
const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Menu items table
const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Store price in cents to avoid floating point issues
  image: text('image_url'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'restrict' }).notNull(),
  likes: integer('likes').default(0).notNull(),
  dislikes: integer('dislikes').default(0).notNull(),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table for user authentication
const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: integer('user_id').references(() => users.id),
  data: text('data').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// Define relations
const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));

const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

module.exports = {
  userRoleEnum,
  users,
  categories,
  menuItems,
  sessions,
  usersRelations,
  categoriesRelations,
  menuItemsRelations,
  sessionsRelations
};