"use server";

import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { slugify } from "@/lib/product-utils";

const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(100).optional(),
  shortDescription: z.string().trim().min(5).max(180),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().min(0).max(1000000),
  currency: z.string().trim().min(3).max(3).transform((v) => v.toUpperCase()),
  currentVersion: z.string().trim().max(40).optional(),
  supportedVersions: z.string().trim().max(180).optional(),
  status: z.nativeEnum(ProductStatus)
});

function parseProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const requestedSlug = String(formData.get("slug") ?? "");

  return productSchema.parse({
    name,
    slug: requestedSlug || slugify(name),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: formData.get("price"),
    currency: String(formData.get("currency") ?? "PHP"),
    currentVersion: String(formData.get("currentVersion") ?? ""),
    supportedVersions: String(formData.get("supportedVersions") ?? ""),
    status: String(formData.get("status") ?? "DRAFT")
  });
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  const slug = slugify(data.slug || data.name);
  if (!slug) throw new Error("A valid product slug is required.");

  await db.product.create({
    data: {
      name: data.name,
      slug,
      shortDescription: data.shortDescription,
      description: data.description,
      priceCents: Math.round(data.price * 100),
      currency: data.currency,
      currentVersion: data.currentVersion || null,
      supportedVersions: data.supportedVersions || null,
      status: data.status
    }
  });

  revalidatePath("/");
  revalidatePath("/plugins");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  const slug = slugify(data.slug || data.name);
  if (!slug) throw new Error("A valid product slug is required.");

  const previous = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (!previous) throw new Error("Product not found.");

  await db.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      slug,
      shortDescription: data.shortDescription,
      description: data.description,
      priceCents: Math.round(data.price * 100),
      currency: data.currency,
      currentVersion: data.currentVersion || null,
      supportedVersions: data.supportedVersions || null,
      status: data.status
    }
  });

  revalidatePath("/");
  revalidatePath("/plugins");
  revalidatePath(`/plugins/${previous.slug}`);
  revalidatePath(`/plugins/${slug}`);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function setProductStatus(productId: string, status: ProductStatus) {
  await requireAdmin();
  await db.product.update({ where: { id: productId }, data: { status } });
  revalidatePath("/");
  revalidatePath("/plugins");
  revalidatePath("/admin/products");
}
