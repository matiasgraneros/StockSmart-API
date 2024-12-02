/*
  Warnings:

  - A unique constraint covering the columns `[name,inventoryId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inventoryId` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "inventoryId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_inventoryId_key" ON "Category"("name", "inventoryId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
