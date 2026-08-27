"use client";

import { useState } from "react";

export function ReleaseUploadForm({
  products,
}: {
  products: { id: string; name: string }[];
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const form = new FormData(event.currentTarget);
      const file = form.get("file");

      if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".jar")) {
        throw new Error("Please choose a .jar file.");
      }

      const prepRes = await fetch("/api/admin/releases/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.get("productId"),
          version: form.get("version"),
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      const prep = await prepRes.json();
      if (!prepRes.ok) throw new Error(prep.error || "Could not prepare upload.");

      const uploadRes = await fetch(prep.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/java-archive",
          "x-vercel-blob-access": "private",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("The JAR could not be uploaded to private storage.");
      }

      const finishRes = await fetch("/api/admin/releases/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.get("productId"),
          version: form.get("version"),
          changelog: form.get("changelog"),
          storageKey: prep.pathname,
          publish: form.get("publish") === "on",
        }),
      });

      const finish = await finishRes.json();
      if (!finishRes.ok) throw new Error(finish.error || "Could not save release.");

      window.location.href = "/admin/releases";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mt-8 p-7">
      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-bold">Plugin</span>
          <select name="productId" className="input" required defaultValue="">
            <option value="" disabled>Select a plugin</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">Version</span>
          <input className="input" name="version" placeholder="1.0.0" required maxLength={40} />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold">Plugin JAR</span>
        <input
          type="file"
          name="file"
          accept=".jar,application/java-archive,application/octet-stream"
          required
          className="block w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm"
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold">Release Notes</span>
        <textarea
          name="changelog"
          className="input min-h-36 py-3"
          placeholder="What changed in this version?"
          maxLength={10000}
        />
      </label>

      <label className="mt-5 flex items-center gap-3 text-sm">
        <input type="checkbox" name="publish" defaultChecked />
        Publish immediately
      </label>

      {message && (
        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {message}
        </div>
      )}

      <button type="submit" className="btn btn-primary mt-6" disabled={busy}>
        {busy ? "Uploading..." : "Upload Release"}
      </button>
    </form>
  );
}
