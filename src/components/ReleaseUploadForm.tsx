"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
};

export function ReleaseUploadForm({ products }: { products: Product[] }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);
    const file = form.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setMessage("Choose a .jar file first.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".jar")) {
      setMessage("Only .jar plugin files are allowed.");
      return;
    }

    setBusy(true);

    try {
      const presignResponse = await fetch("/api/admin/releases/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.get("productId"),
          version: form.get("version"),
          fileName: file.name,
          fileSize: file.size
        })
      });

      const presign = await presignResponse.json();

      if (!presignResponse.ok) {
        throw new Error(presign.error || "Could not prepare upload.");
      }

      const uploadResponse = await fetch(presign.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/java-archive"
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error("The JAR upload to private storage failed.");
      }

      const finishResponse = await fetch("/api/admin/releases/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.get("productId"),
          version: form.get("version"),
          changelog: form.get("changelog"),
          storageKey: presign.pathname,
          publish: form.get("publish") === "on"
        })
      });

      const finish = await finishResponse.json();

      if (!finishResponse.ok) {
        throw new Error(finish.error || "The release could not be saved.");
      }

      window.location.href = "/admin/releases";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mt-8 p-7">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Plugin</span>
          <select name="productId" className="input" required defaultValue="">
            <option value="" disabled>Select a plugin</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold">Version</span>
          <input className="input" name="version" placeholder="e.g. 1.4.0" maxLength={40} required />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold">Plugin JAR</span>
        <input
          className="block w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm"
          name="file"
          type="file"
          accept=".jar,application/java-archive,application/octet-stream"
          required
        />
        <span className="mt-2 block text-xs text-zinc-500">
          The browser uploads this directly to your private Vercel Blob store.
        </span>
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold">Changelog / Release Notes</span>
        <textarea
          className="input min-h-36 py-3"
          name="changelog"
          placeholder="What's new in this version?"
          maxLength={10000}
        />
      </label>

      <label className="mt-5 flex items-center gap-3 text-sm">
        <input name="publish" type="checkbox" defaultChecked />
        Publish this release immediately
      </label>

      {message && (
        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {message}
        </div>
      )}

      <button className="btn btn-primary mt-6" type="submit" disabled={busy}>
        {busy ? "Uploading…" : "Upload Release"}
      </button>
    </form>
  );
}
