-- CreateTable
CREATE TABLE "EditSuggestion" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "birth_year" INTEGER,
    "birth_month" INTEGER,
    "birth_day" INTEGER,
    "death_year" INTEGER,
    "death_month" INTEGER,
    "death_day" INTEGER,
    "bio" TEXT,
    "notable_works" TEXT,
    "period" TEXT,
    "references" TEXT,
    "photo_url" TEXT,
    "youtube_link" TEXT,
    "mainRole" "RoleType"[],
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "suggester_email" TEXT NOT NULL,
    "suggester_ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "composerId" INTEGER NOT NULL,

    CONSTRAINT "EditSuggestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EditSuggestion" ADD CONSTRAINT "EditSuggestion_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
