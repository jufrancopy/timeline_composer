-- AlterTable
ALTER TABLE "EditSuggestion" ADD COLUMN     "is_student_contribution" BOOLEAN DEFAULT false,
ADD COLUMN     "student_first_name" TEXT,
ADD COLUMN     "student_last_name" TEXT;
