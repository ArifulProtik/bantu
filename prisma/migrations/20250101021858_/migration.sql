/*
  Warnings:

  - A unique constraint covering the columns `[articleId,reactorId]` on the table `ArticleReaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Like', 'Comment', 'Follow');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "NotificationType" NOT NULL,
    "NofifierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_NofifierId_key" ON "Notification"("NofifierId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleReaction_articleId_reactorId_key" ON "ArticleReaction"("articleId", "reactorId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_NofifierId_fkey" FOREIGN KEY ("NofifierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
