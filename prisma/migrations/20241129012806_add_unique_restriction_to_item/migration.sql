/*
  Warnings:

  - A unique constraint covering the columns `[name,inventoryId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Item_name_inventoryId_key" ON "Item"("name", "inventoryId");
