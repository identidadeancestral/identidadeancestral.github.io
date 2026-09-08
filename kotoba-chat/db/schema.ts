import { sqliteTable, text, integer, primaryKey, index, uniqueIndex } from "drizzle-orm/sqlite-core";
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(), authKey: text("auth_key").notNull().unique(),
  nickname: text("nickname").notNull(), language: text("language").notNull(),
  level: text("level").notNull(), avatar: text("avatar").notNull(),
  available: integer("available").notNull().default(1),
  lastSeen: integer("last_seen").notNull(), createdAt: integer("created_at").notNull(),
}, t => [index("idx_profiles_presence").on(t.available, t.lastSeen)]);
export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(), kind: text("kind").notNull(), title: text("title").notNull(),
  ownerId: text("owner_id").notNull().references(() => profiles.id),
  dmKey: text("dm_key").unique(), createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
});
export const members = sqliteTable("members", {
  roomId: text("room_id").notNull().references(() => rooms.id),
  userId: text("user_id").notNull().references(() => profiles.id),
  state: text("state").notNull(), inviterId: text("inviter_id").notNull().references(() => profiles.id),
  invitedAt: integer("invited_at").notNull(), lastRead: integer("last_read").notNull().default(0),
}, t => [primaryKey({columns:[t.roomId,t.userId]}), index("idx_members_user_state").on(t.userId,t.state)]);
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({autoIncrement:true}), clientId: text("client_id").notNull(),
  roomId: text("room_id").notNull().references(() => rooms.id),
  userId: text("user_id").notNull().references(() => profiles.id),
  japanese: text("japanese").notNull(), payload: text("payload").notNull(), createdAt: integer("created_at").notNull(),
}, t => [index("idx_messages_room_id").on(t.roomId,t.id), index("idx_messages_user_time").on(t.userId,t.createdAt), uniqueIndex("idx_messages_client").on(t.userId,t.clientId)]);
export const blocks = sqliteTable("blocks", {
  userId: text("user_id").notNull().references(() => profiles.id),
  targetId: text("target_id").notNull().references(() => profiles.id), createdAt: integer("created_at").notNull(),
}, t => [primaryKey({columns:[t.userId,t.targetId]}), index("idx_blocks_target").on(t.targetId,t.userId)]);
export const frontendCodes=sqliteTable("frontend_codes",{
 codeHash:text("code_hash").primaryKey(),authKey:text("auth_key").notNull(),challenge:text("challenge").notNull(),expiresAt:integer("expires_at").notNull(),
},t=>[index("idx_frontend_codes_user_expiry").on(t.authKey,t.expiresAt)]);
export const frontendSessions=sqliteTable("frontend_sessions",{
 tokenHash:text("token_hash").primaryKey(),authKey:text("auth_key").notNull(),expiresAt:integer("expires_at").notNull(),
},t=>[index("idx_frontend_sessions_expiry").on(t.expiresAt)]);
export const studyProgress=sqliteTable("study_progress",{
 authKey:text("auth_key").notNull(),storyId:text("story_id").notNull(),step:integer("step").notNull(),dueAt:integer("due_at").notNull(),reviewedAt:integer("reviewed_at").notNull(),attempts:integer("attempts").notNull(),
},t=>[primaryKey({columns:[t.authKey,t.storyId]})]);
