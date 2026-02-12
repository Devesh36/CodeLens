import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth";

async function main() {
  // Clear existing data
  await prisma.snippetTag.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.snippet.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await hashPassword("demo123456");
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  // Create tags
  const jsTag = await prisma.tag.create({
    data: { name: "javascript" },
  });

  const algorithmTag = await prisma.tag.create({
    data: { name: "algorithm" },
  });

  // Create demo snippets
  const snippet1 = await prisma.snippet.create({
    data: {
      title: "Quick Sort Algorithm",
      code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
      language: "javascript",
      explanation: "A sorting algorithm that uses divide and conquer",
      explanationJson: {
        summary: "Quick Sort implementation using JavaScript",
        lineExplanations: [
          {
            line: 1,
            explanation:
              "Function declaration for quickSort that accepts an array parameter",
          },
          {
            line: 2,
            explanation: "Base case: if array has 0 or 1 elements, it's sorted",
          },
        ],
        complexity: "Moderate",
        improvements: [
          "Consider using in-place sorting for better space complexity",
          "Add input validation",
        ],
      },
      userId: user.id,
      isPublic: true,
      shareToken: "quicksort123",
    },
  });

  // Add tags to snippet
  await prisma.snippetTag.create({
    data: {
      snippetId: snippet1.id,
      tagId: jsTag.id,
    },
  });

  await prisma.snippetTag.create({
    data: {
      snippetId: snippet1.id,
      tagId: algorithmTag.id,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("Demo credentials:");
  console.log("Email: demo@example.com");
  console.log("Password: demo123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
