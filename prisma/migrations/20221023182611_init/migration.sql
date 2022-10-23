-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "token" TEXT NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "code" (
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_pkey" PRIMARY KEY ("phone")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");
