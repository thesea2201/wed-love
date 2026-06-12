-- CreateTable
CREATE TABLE "wishes" (
    "id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "audio_url" TEXT,
    "audio_duration" INTEGER,
    "moderation_status" TEXT NOT NULL DEFAULT 'pending',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gifts" (
    "id" TEXT NOT NULL,
    "wish_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "gift_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wishes_invitation_id_moderation_status_created_at_idx" ON "wishes"("invitation_id", "moderation_status", "created_at");

-- CreateIndex
CREATE INDEX "wishes_guest_id_idx" ON "wishes"("guest_id");

-- CreateIndex
CREATE INDEX "gifts_wish_id_idx" ON "gifts"("wish_id");

-- CreateIndex
CREATE INDEX "gifts_invitation_id_created_at_idx" ON "gifts"("invitation_id", "created_at");

-- AddForeignKey
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_wish_id_fkey" FOREIGN KEY ("wish_id") REFERENCES "wishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
