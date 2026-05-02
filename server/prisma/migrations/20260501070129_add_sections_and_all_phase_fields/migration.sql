/*
  Warnings:

  - A unique constraint covering the columns `[short_url]` on the table `guests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "gift_currency" TEXT DEFAULT 'VND',
ADD COLUMN     "gift_is_anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gift_transaction_id" TEXT,
ADD COLUMN     "qr_code_url" TEXT,
ADD COLUMN     "relationship" TEXT,
ADD COLUMN     "short_url" TEXT,
ADD COLUMN     "thank_you_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thank_you_sent_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "map_url" TEXT,
ADD COLUMN     "music_autoplay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "music_fade_in" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "music_url" TEXT,
ADD COLUMN     "secondary_color" TEXT,
ADD COLUMN     "sections" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bank_qr" TEXT,
ADD COLUMN     "custom_domain" TEXT,
ADD COLUMN     "momo_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan_expires_at" TIMESTAMP(3),
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'couple',
ADD COLUMN     "stripe_customer_id" TEXT;

-- CreateTable
CREATE TABLE "guest_photos" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "guest_id" TEXT,
    "photo_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "moderation_status" TEXT NOT NULL DEFAULT 'pending',
    "ai_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_messages" (
    "id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "transcript" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "moderation_status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voice_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestreams" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mux',
    "stream_key" TEXT,
    "playback_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "viewer_count" INTEGER NOT NULL DEFAULT 0,
    "chat_enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livestreams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "livestream_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guest_id" TEXT,
    "invitation_id" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT NOT NULL,
    "provider_id" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_suggestions" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "selected" JSONB,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guest_photos_invitation_id_moderation_status_idx" ON "guest_photos"("invitation_id", "moderation_status");

-- CreateIndex
CREATE INDEX "voice_messages_invitation_id_moderation_status_idx" ON "voice_messages"("invitation_id", "moderation_status");

-- CreateIndex
CREATE INDEX "chat_messages_livestream_id_createdAt_idx" ON "chat_messages"("livestream_id", "createdAt");

-- CreateIndex
CREATE INDEX "payments_user_id_status_idx" ON "payments"("user_id", "status");

-- CreateIndex
CREATE INDEX "payments_guest_id_idx" ON "payments"("guest_id");

-- CreateIndex
CREATE INDEX "payments_invitation_id_idx" ON "payments"("invitation_id");

-- CreateIndex
CREATE INDEX "ai_suggestions_invitation_id_type_idx" ON "ai_suggestions"("invitation_id", "type");

-- CreateIndex
CREATE INDEX "analytics_invitation_id_event_idx" ON "analytics"("invitation_id", "event");

-- CreateIndex
CREATE UNIQUE INDEX "guests_short_url_key" ON "guests"("short_url");

-- CreateIndex
CREATE INDEX "guests_invitation_id_rsvp_status_idx" ON "guests"("invitation_id", "rsvp_status");

-- CreateIndex
CREATE INDEX "guests_short_url_idx" ON "guests"("short_url");

-- CreateIndex
CREATE INDEX "invitations_user_id_idx" ON "invitations"("user_id");

-- AddForeignKey
ALTER TABLE "guest_photos" ADD CONSTRAINT "guest_photos_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_photos" ADD CONSTRAINT "guest_photos_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_messages" ADD CONSTRAINT "voice_messages_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_messages" ADD CONSTRAINT "voice_messages_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestreams" ADD CONSTRAINT "livestreams_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_livestream_id_fkey" FOREIGN KEY ("livestream_id") REFERENCES "livestreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
