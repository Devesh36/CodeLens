-- CreateTable
CREATE TABLE "SnippetVersion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "explanationJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snippetId" TEXT NOT NULL,

    CONSTRAINT "SnippetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SnippetVersion_snippetId_idx" ON "SnippetVersion"("snippetId");

-- AddForeignKey
ALTER TABLE "SnippetVersion" ADD CONSTRAINT "SnippetVersion_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
