import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { updateSiteSettingsAction } from "@/lib/admin-actions"
import { getSiteSettings } from "@/lib/storefront"

export default async function AdminSettingsPage() {
  await requireAdminSession()
  const settings = await getSiteSettings()

  return (
    <AdminShell
      title="Settings"
      description="Manage storewide contact details, support channels, and delivery messaging used across the storefront."
    >
      <form action={updateSiteSettingsAction} className="admin-surface grid max-w-3xl gap-4 p-6">
        <h2 className="font-heading text-2xl font-semibold">Store settings</h2>
        <input
          name="storeName"
          defaultValue={settings.storeName}
          placeholder="Store name"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <textarea
          name="tagline"
          defaultValue={settings.tagline}
          rows={2}
          placeholder="Store tagline"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          name="supportPhone"
          defaultValue={settings.supportPhone}
          placeholder="Support phone"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          name="supportEmail"
          defaultValue={settings.supportEmail}
          placeholder="Support email"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          name="whatsappPhone"
          defaultValue={settings.whatsappPhone}
          placeholder="WhatsApp phone"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          name="defaultDeliveryLead"
          defaultValue={settings.defaultDeliveryLead}
          placeholder="Default delivery lead"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <textarea
          name="address"
          defaultValue={settings.address}
          rows={3}
          placeholder="Store address"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <textarea
          name="regions"
          defaultValue={settings.regions.join("\n")}
          rows={5}
          placeholder="Delivery regions, one per line"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Save settings
        </button>
      </form>
    </AdminShell>
  )
}
