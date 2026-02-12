"use server";

import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, signJWT } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function registerUser(email: string, password: string, name: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Email already exists" };
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = await signJWT({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    return { error: "Failed to register user" };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Invalid credentials" };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { error: "Invalid credentials" };
    }

    const token = await signJWT({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    return { error: "Failed to login" };
  }
}

export async function createSnippet(
  userId: string,
  title: string,
  code: string,
  language: string,
  explanation: string,
  explanationJson: object | null
) {
  try {
    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language,
        explanation,
        explanationJson,
        userId,
      },
    });
    revalidatePath("/dashboard");
    return { snippet };
  } catch (error) {
    return { error: "Failed to create snippet" };
  }
}

export async function updateSnippet(
  snippetId: string,
  title: string,
  code: string,
  language: string,
  explanation: string,
  explanationJson: object | null
) {
  try {
    const snippet = await prisma.snippet.update({
      where: { id: snippetId },
      data: {
        title,
        code,
        language,
        explanation,
        explanationJson,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath(`/snippet/${snippetId}`);
    return { snippet };
  } catch (error) {
    return { error: "Failed to update snippet" };
  }
}

export async function deleteSnippet(snippetId: string) {
  try {
    await prisma.snippet.delete({ where: { id: snippetId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete snippet" };
  }
}

export async function getSnippet(snippetId: string) {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      include: { tags: { include: { tag: true } } },
    });
    return { snippet };
  } catch (error) {
    return { error: "Failed to fetch snippet" };
  }
}

export async function getUserSnippets(userId: string) {
  try {
    const snippets = await prisma.snippet.findMany({
      where: { userId },
      include: { tags: { include: { tag: true } }, _count: { select: { favorites: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { snippets };
  } catch (error) {
    return { error: "Failed to fetch snippets" };
  }
}

export async function addTagToSnippet(snippetId: string, tagName: string) {
  try {
    let tag = await prisma.tag.findUnique({ where: { name: tagName } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name: tagName } });
    }

    await prisma.snippetTag.create({
      data: { snippetId, tagId: tag.id },
    });
    revalidatePath(`/snippet/${snippetId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to add tag" };
  }
}

export async function removeTagFromSnippet(snippetId: string, tagId: string) {
  try {
    await prisma.snippetTag.deleteMany({
      where: { snippetId, tagId },
    });
    revalidatePath(`/snippet/${snippetId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to remove tag" };
  }
}

export async function toggleFavorite(userId: string, snippetId: string) {
  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_snippetId: { userId, snippetId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
    } else {
      await prisma.favorite.create({ data: { userId, snippetId } });
    }
    revalidatePath("/dashboard");
    revalidatePath(`/snippet/${snippetId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle favorite" };
  }
}

export async function toggleSnippetVisibility(
  snippetId: string,
  isPublic: boolean
) {
  try {
    const shareToken = isPublic ? Math.random().toString(36).slice(2) : null;
    const snippet = await prisma.snippet.update({
      where: { id: snippetId },
      data: { isPublic, shareToken },
    });
    revalidatePath(`/snippet/${snippetId}`);
    revalidatePath("/dashboard");
    return { snippet };
  } catch (error) {
    return { error: "Failed to update snippet visibility" };
  }
}

export async function getPublicSnippet(shareToken: string) {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { shareToken },
      include: { tags: { include: { tag: true } }, user: { select: { name: true } } },
    });
    if (!snippet?.isPublic) {
      return { error: "Snippet not found" };
    }
    return { snippet };
  } catch (error) {
    return { error: "Failed to fetch snippet" };
  }
}
