-- AlterTable
ALTER TABLE "Composer" ADD COLUMN     "is_student_contribution" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "student_first_name" TEXT,
ADD COLUMN     "student_last_name" TEXT,
ADD COLUMN     "suggestion_reason" TEXT;
