-- CreateTable
CREATE TABLE "Result" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "result" TEXT NOT NULL,
    "bingo" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Result_result_key" ON "Result"("result");
