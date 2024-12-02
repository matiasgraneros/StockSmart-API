/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_name_key" ON "Inventory"("name");
