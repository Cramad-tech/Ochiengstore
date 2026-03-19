import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"

import { ProductImageField } from "@/components/admin/product-image-field"
import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { deleteProductAction, upsertProductAction } from "@/lib/admin-actions"
import { formatTzs } from "@/lib/format"
import { getBrands, getCategories, getProductBySlug, getProducts } from "@/lib/storefront"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminSession()

  const params = await searchParams
  const editSlug = typeof params.edit === "string" ? params.edit : undefined

  const [products, categories, brands, editProduct] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    editSlug ? getProductBySlug(editSlug) : Promise.resolve(null),
  ])

  return (
    <AdminShell
      title="Products"
      description="Create, update, publish, and retire appliance listings with structured pricing, specs, and inventory information."
    >
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <form action={upsertProductAction} className="admin-surface grid gap-4 p-6">
          <h2 className="font-heading text-2xl font-semibold">{editProduct ? `Edit ${editProduct.name}` : "Add product"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="name" defaultValue={editProduct?.name} placeholder="Product name" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
            <input name="nameSw" defaultValue={editProduct?.nameSw} placeholder="Product name (Swahili)" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="sku" defaultValue={editProduct?.sku} placeholder="SKU" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
            <input name="slug" defaultValue={editProduct?.slug} placeholder="Slug" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <select name="brandSlug" defaultValue={editProduct?.brandSlug} className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none">
              {brands.map((brand) => (
                <option key={brand.slug} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
            <select name="categorySlug" defaultValue={editProduct?.categorySlug} className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none">
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <input name="subcategorySlug" defaultValue={editProduct?.subcategorySlug} placeholder="Subcategory slug" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <input name="modelNumber" defaultValue={editProduct?.modelNumber} placeholder="Model number" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
            <input name="price" defaultValue={editProduct?.price} placeholder="Price" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
            <input name="discountPrice" defaultValue={editProduct?.discountPrice} placeholder="Discount price" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <input name="stock" defaultValue={editProduct?.stock} placeholder="Stock quantity" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
            <input name="warrantyMonths" defaultValue={editProduct?.warrantyMonths ?? 12} placeholder="Warranty months" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
            <input name="weightKg" defaultValue={editProduct?.weightKg} placeholder="Weight (kg)" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div className="rounded-[1.3rem] border border-border bg-secondary/30 px-4 py-4 text-sm text-muted-foreground">
            One primary image is enough for publishing. Gallery images and product video are optional extras.
          </div>
          <ProductImageField
            name="image"
            label="Primary image"
            defaultValue={editProduct?.image}
            placeholder="Primary image URL"
          />
          <ProductImageField
            name="gallery"
            label="Gallery images (optional)"
            defaultValue={editProduct?.gallery.join("\n")}
            placeholder="Gallery image URLs, one per line"
            multiple
            rows={4}
            required={false}
          />
          <input
            name="videoUrl"
            defaultValue={editProduct?.videoUrl}
            placeholder="Optional video URL (YouTube, Vimeo, or direct MP4/WebM)"
            className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input name="dimensions" defaultValue={editProduct?.dimensions} placeholder="Dimensions" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="shortDescription" defaultValue={editProduct?.shortDescription} rows={2} placeholder="Short description" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="shortDescriptionSw" defaultValue={editProduct?.shortDescriptionSw} rows={2} placeholder="Short description (Swahili)" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="description" defaultValue={editProduct?.description} rows={4} placeholder="Full description" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="descriptionSw" defaultValue={editProduct?.descriptionSw} rows={4} placeholder="Full description (Swahili)" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="keyFeatures" defaultValue={editProduct?.keyFeatures.join("\n")} rows={3} placeholder="Key features, one per line" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="keyFeaturesSw" defaultValue={editProduct?.keyFeaturesSw.join("\n")} rows={3} placeholder="Key features (Swahili), one per line" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea
            name="specifications"
            defaultValue={editProduct?.technicalSpecifications.map((specification) => `${specification.group} | ${specification.label} | ${specification.value}`).join("\n")}
            rows={4}
            placeholder="Specifications in the format: Group | Label | Value"
            className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <textarea name="energyDetails" defaultValue={editProduct?.energyDetails} rows={2} placeholder="Energy details" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="installationInfo" defaultValue={editProduct?.installationInfo} rows={2} placeholder="Installation info" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" />
          <div className="grid gap-3 sm:grid-cols-5">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={editProduct?.featured} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="trending" defaultChecked={editProduct?.trending} /> Trending</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="newArrival" defaultChecked={editProduct?.newArrival} /> New arrival</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="deliveryEligible" defaultChecked={editProduct?.deliveryEligible ?? true} /> Delivery eligible</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Published</label>
          </div>
          <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            {editProduct ? "Update product" : "Create product"}
          </button>
        </form>

        <div className="admin-surface overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-heading text-2xl font-semibold">Product catalog</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Price</th>
                  <th className="px-6 py-3 font-semibold">Stock</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.slug} className="border-t border-border">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.modelNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.categorySlug}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatTzs(product.discountPrice ?? product.price)}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/products?edit=${product.slug}`} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold">
                          <Pencil className="size-3" />
                          Edit
                        </Link>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="slug" value={product.slug} />
                          <button className="inline-flex items-center gap-2 rounded-full border border-destructive/25 px-3 py-2 text-xs font-semibold text-destructive">
                            <Trash2 className="size-3" />
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
