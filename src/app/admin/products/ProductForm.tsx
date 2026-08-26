import { ProductStatus } from "@prisma/client";

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  product?: {
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    priceCents: number;
    currency: string;
    currentVersion: string | null;
    supportedVersions: string | null;
    status: ProductStatus;
  };
};

export function ProductForm({ action, submitLabel, product }: ProductFormProps) {
  return (
    <form action={action} className="card mt-8 space-y-6 p-7">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold">Plugin name</span>
          <input className="input" name="name" required minLength={2} maxLength={80} defaultValue={product?.name} placeholder="Example: ATeam" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold">URL name (slug)</span>
          <input className="input" name="slug" maxLength={100} defaultValue={product?.slug} placeholder="ateam" />
          <span className="block text-xs text-zinc-500">Used in /plugins/ateam. Leave blank when creating to generate it automatically.</span>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-bold">Short description</span>
        <input className="input" name="shortDescription" required minLength={5} maxLength={180} defaultValue={product?.shortDescription} placeholder="Short summary shown on plugin cards." />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold">Full description</span>
        <textarea className="input min-h-40 py-3" name="description" required minLength={10} maxLength={5000} defaultValue={product?.description} placeholder="Explain what the plugin does and why a server owner would want it." />
      </label>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-bold">Price</span>
          <input className="input" name="price" type="number" min="0" max="1000000" step="0.01" required defaultValue={product ? product.priceCents / 100 : 0} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold">Currency</span>
          <input className="input" name="currency" required minLength={3} maxLength={3} defaultValue={product?.currency ?? "PHP"} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold">Current version</span>
          <input className="input" name="currentVersion" maxLength={40} defaultValue={product?.currentVersion ?? ""} placeholder="1.0.0" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold">Status</span>
          <select className="input" name="status" defaultValue={product?.status ?? "DRAFT"}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-bold">Supported Minecraft versions</span>
        <input className="input" name="supportedVersions" maxLength={180} defaultValue={product?.supportedVersions ?? ""} placeholder="Paper/Purpur 1.21.x" />
      </label>

      <div className="flex justify-end">
        <button className="btn btn-primary" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
