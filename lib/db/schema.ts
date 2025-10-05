import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Helper function for updated_at trigger (to be created in Supabase)
// See migration file for SQL trigger creation

// ============================================
// PROFILES
// ============================================
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users (FK created manually in Supabase)
  name: text('name'),
  email: text('email'),
  role: text('role').notNull().default('USER'), // USER | EDITOR | ADMIN
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// POSTS (Feed/Home)
// ============================================
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  kind: text('kind').notNull(), // TEXT_IMAGE | CAROUSEL | YOUTUBE | SPOTIFY | LINK
  body: jsonb('body').$type<{
    text?: string;
    medias?: Array<{ url: string; alt: string }>;
    youtubeId?: string;
    spotifyId?: string;
    linkUrl?: string;
    linkLabel?: string;
  }>(),
  pinned: boolean('pinned').notNull().default(false),
  published: boolean('published').notNull().default(true),
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// EVENT DAYS
// ============================================
export const eventDays = pgTable('event_days', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  position: integer('position').notNull().default(0),
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// TRACKS
// ============================================
export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ROOMS
// ============================================
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  dayId: uuid('day_id').references(() => eventDays.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// SESSIONS (Programa)
// ============================================
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  abstract: text('abstract'),
  dayId: uuid('day_id').references(() => eventDays.id, { onDelete: 'cascade' }),
  trackId: uuid('track_id').references(() => tracks.id),
  roomId: uuid('room_id').references(() => rooms.id),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  isPlenary: boolean('is_plenary').notNull().default(false),
  materialsUrl: text('materials_url'),
  speaker: jsonb('speaker').$type<{
    name?: string;
    title?: string;
    avatarUrl?: string;
  }>(),
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// STANDS
// ============================================
export const stands = pgTable('stands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(), // instituto | carrera | programa | curso | sponsor | otro
  description: text('description'),
  logoUrl: text('logo_url'),
  links: jsonb('links').$type<Array<{ label: string; url: string }>>(),
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// PAGES (Sistema de páginas con módulos)
// ============================================
export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').notNull(), // FEED | PROGRAMA | ENTRADAS | STANDS | CUSTOM
  icon: text('icon').notNull(), // Lucide icon name (ej: 'Home', 'Calendar')
  visible: boolean('visible').notNull().default(true),
  order: integer('order').notNull().unique(),
  config: jsonb('config').$type<{
    // Configuración específica por tipo de módulo
    itemsPerPage?: number;
    showPinnedFirst?: boolean;
    defaultView?: 'day' | 'track';
    [key: string]: unknown;
  }>().default({}),
  blocks: jsonb('blocks').$type<Array<{
    type: 'paragraph' | 'image' | 'link' | 'list' | 'embed' | 'accordion' | 'grid';
    text?: string;
    url?: string;
    alt?: string;
    label?: string;
    items?: Array<{ title: string; content: string }>;
    images?: Array<{ url: string; alt: string }>;
  }>>(), // Solo para type=CUSTOM
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// NEWSLETTER SUBSCRIPTIONS
// ============================================
export const newsletterSubs = pgTable('newsletter_subs', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  termsAccepted: boolean('terms_accepted').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// TICKETS (Fint integration)
// ============================================
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  externalId: text('external_id').notNull().unique(), // ticket.id from Fint
  status: text('status').notNull(), // paid | cancelled | etc
  qrUrl: text('qr_url'),
  pdfUrl: text('pdf_url'),
  eventName: text('event_name'),
  purchasedAt: timestamp('purchased_at', { withTimezone: true }),
  userEmail: text('user_email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  amount: text('amount'),
  reference: text('reference'),
  userId: uuid('user_id').references(() => profiles.id),
  rawData: jsonb('raw_data'), // Full Fint payload for traceability
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// RELATIONS (for Drizzle queries)
// ============================================
export const sessionsRelations = relations(sessions, ({ one }) => ({
  day: one(eventDays, {
    fields: [sessions.dayId],
    references: [eventDays.id],
  }),
  track: one(tracks, {
    fields: [sessions.trackId],
    references: [tracks.id],
  }),
  room: one(rooms, {
    fields: [sessions.roomId],
    references: [rooms.id],
  }),
}));

export const roomsRelations = relations(rooms, ({ one }) => ({
  day: one(eventDays, {
    fields: [rooms.dayId],
    references: [eventDays.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  user: one(profiles, {
    fields: [tickets.userId],
    references: [profiles.id],
  }),
}));
