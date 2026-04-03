"use server";

import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, signJWT, verifyJWT } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const AUTH_COOKIE_NAME = "auth";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

export async function requireAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload?.userId) return null;
  return String(payload.userId);
}

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
    await setAuthCookie(token);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  } catch {
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
    await setAuthCookie(token);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  } catch {
    return { error: "Failed to login" };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return { user: null };
    }

    const payload = await verifyJWT(token);
    if (!payload?.userId || !payload?.email) {
      return { user: null };
    }

    return {
      user: {
        id: String(payload.userId),
        email: String(payload.email),
      },
    };
  } catch {
    return { user: null };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return { success: true };
}

export async function createSnippet(
  userId: string,
  title: string,
  code: string,
  language: string,
  explanation: string,
  explanationJson: unknown | null
) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language,
        explanation,
        // Prisma's typings don't accept `null` directly for JSON input —
        // pass `undefined` when there's no JSON value so the column becomes null.
        explanationJson: explanationJson ?? undefined,
        userId: authUserId,
      },
    });

    // Auto-tagging: extract suggestedTags from explanationJson if present
    if (explanationJson && typeof explanationJson === "object" && "suggestedTags" in explanationJson) {
      const tags = (explanationJson as any).suggestedTags;
      if (Array.isArray(tags)) {
        for (const t of tags) {
          if (typeof t === "string") {
            const cleanTag = t.toLowerCase().trim().replace(/\s+/g, '-');
            if (cleanTag) {
              let tag = await prisma.tag.findUnique({ where: { name: cleanTag } });
              if (!tag) {
                tag = await prisma.tag.create({ data: { name: cleanTag } });
              }
              await prisma.snippetTag.create({
                data: { snippetId: snippet.id, tagId: tag.id },
              });
            }
          }
        }
      }
    }

    revalidatePath("/dashboard");
    return { snippet };
  } catch {
    return { error: "Failed to create snippet" };
  }
}

export async function updateSnippet(
  snippetId: string,
  title: string,
  code: string,
  language: string,
  explanation: string,
  explanationJson: unknown | null
) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const existing = await prisma.snippet.findFirst({
      where: { id: snippetId, userId: authUserId },
    });
    if (!existing) {
      return { error: "Snippet not found" };
    }

    // Save previous version
    await prisma.snippetVersion.create({
      data: {
        snippetId: existing.id,
        code: existing.code,
        explanation: existing.explanation,
        explanationJson: existing.explanationJson ?? undefined,
      }
    });

    const snippet = await prisma.snippet.update({
      where: { id: snippetId },
      data: {
        title,
        code,
        language,
        explanation,
        explanationJson: explanationJson ?? undefined,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath(`/snippet/${snippetId}`);
    return { snippet };
  } catch {
    return { error: "Failed to update snippet" };
  }
}

export async function deleteSnippet(snippetId: string) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    await prisma.snippet.deleteMany({ where: { id: snippetId, userId: authUserId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to delete snippet" };
  }
}

export async function getSnippet(snippetId: string) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const snippet = await prisma.snippet.findFirst({
      where: { id: snippetId, userId: authUserId },
      include: {
        tags: { include: { tag: true } },
        favorites: { where: { userId: authUserId }, select: { id: true } },
        _count: { select: { favorites: true } },
      },
    });
    return { snippet };
  } catch {
    return { error: "Failed to fetch snippet" };
  }
}

export async function getUserSnippets() {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const snippets = await prisma.snippet.findMany({
      where: { userId: authUserId },
      include: {
        tags: { include: { tag: true } },
        favorites: { where: { userId: authUserId }, select: { id: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { snippets };
  } catch {
    return { error: "Failed to fetch snippets" };
  }
}

export async function addTagToSnippet(snippetId: string, tagName: string) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const ownsSnippet = await prisma.snippet.findFirst({
      where: { id: snippetId, userId: authUserId },
      select: { id: true },
    });
    if (!ownsSnippet) {
      return { error: "Snippet not found" };
    }

    let tag = await prisma.tag.findUnique({ where: { name: tagName } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name: tagName } });
    }

    await prisma.snippetTag.create({
      data: { snippetId, tagId: tag.id },
    });
    revalidatePath(`/snippet/${snippetId}`);
    return { success: true };
  } catch {
    return { error: "Failed to add tag" };
  }
}

export async function removeTagFromSnippet(snippetId: string, tagId: string) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const ownsSnippet = await prisma.snippet.findFirst({
      where: { id: snippetId, userId: authUserId },
      select: { id: true },
    });
    if (!ownsSnippet) {
      return { error: "Snippet not found" };
    }

    await prisma.snippetTag.deleteMany({
      where: { snippetId, tagId },
    });
    revalidatePath(`/snippet/${snippetId}`);
    return { success: true };
  } catch {
    return { error: "Failed to remove tag" };
  }
}

export async function toggleFavorite(userId: string, snippetId: string) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const snippet = await prisma.snippet.findFirst({
      where: { id: snippetId, userId: authUserId },
      select: { id: true },
    });
    if (!snippet) {
      return { error: "Snippet not found" };
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_snippetId: { userId: authUserId, snippetId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
    } else {
      await prisma.favorite.create({ data: { userId: authUserId, snippetId } });
    }
    revalidatePath("/dashboard");
    revalidatePath(`/snippet/${snippetId}`);
    return { success: true };
  } catch {
    return { error: "Failed to toggle favorite" };
  }
}

export async function toggleSnippetVisibility(
  snippetId: string,
  isPublic: boolean
) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const existing = await prisma.snippet.findFirst({
      where: { id: snippetId, userId: authUserId },
      select: { id: true },
    });
    if (!existing) {
      return { error: "Snippet not found" };
    }

    const shareToken = isPublic ? randomUUID() : null;
    const snippet = await prisma.snippet.update({
      where: { id: snippetId },
      data: { isPublic, shareToken },
    });
    revalidatePath(`/snippet/${snippetId}`);
    revalidatePath("/dashboard");
    return { snippet };
  } catch {
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
  } catch {
    return { error: "Failed to fetch snippet" };
  }
}

export async function importSnippets(snippetsToImport: any[]) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    if (!snippetsToImport || snippetsToImport.length === 0) {
      return { success: true, imported: 0 };
    }

    await prisma.snippet.createMany({
      data: snippetsToImport.map((s) => ({
        title: s.title || "Untitled Snippet",
        code: s.code || "",
        language: s.language || "javascript",
        explanation: s.explanation || "",
        explanationJson: s.explanationJson ?? undefined,
        userId: authUserId,
      })),
    });

    revalidatePath("/dashboard");
    return { success: true, imported: snippetsToImport.length };
  } catch (error) {
    console.error("Failed to import snippets:", error);
    return { error: "Failed to import snippets" };
  }
}

export async function getDiscoverSnippets() {
  try {
    const snippets = await prisma.snippet.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { snippets };
  } catch (error) {
    console.error("Failed to fetch discover snippets:", error);
    return { error: "Failed to fetch discover snippets" };
  }
}

export async function forkSnippet(snippetId: string) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return { error: "Unauthorized" };
    }

    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      include: { tags: { include: { tag: true } } }
    });

    if (!snippet || (!snippet.isPublic && snippet.userId !== authUserId)) {
      return { error: "Snippet not found or private" };
    }

    const forkedSnippet = await prisma.snippet.create({
      data: {
        title: `${snippet.title} (Forked)`,
        code: snippet.code,
        language: snippet.language,
        explanation: snippet.explanation,
        explanationJson: snippet.explanationJson ?? undefined,
        userId: authUserId,
      }
    });

    // Handle tags if necessary
    for (const st of snippet.tags) {
      await prisma.snippetTag.create({
        data: {
          snippetId: forkedSnippet.id,
          tagId: st.tag.id
        }
      });
    }

    revalidatePath("/dashboard");
    return { success: true, forkedSnippet };
  } catch (error) {
    console.error("Failed to fork snippet:", error);
    return { error: "Failed to fork snippet" };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    
    if (!user) {
      return { error: "User not found" };
    }

    const snippets = await prisma.snippet.findMany({
      where: { userId, isPublic: true },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { user, snippets };
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return { error: "Failed to fetch profile" };
  }
}

export async function getSnippetVersions(snippetId: string) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) return { error: "Unauthorized" };

    const owns = await prisma.snippet.findFirst({
      where: { id: snippetId, userId: authUserId }
    });
    if (!owns) return { error: "Not found" };

    const versions = await prisma.snippetVersion.findMany({
      where: { snippetId },
      orderBy: { createdAt: 'desc' }
    });
    return { versions };
  } catch {
    return { error: "Failed to load versions" };
  }
}
