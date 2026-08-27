"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

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
      const productId = String(form.get("productId") || "");
      const version = String(form.get("version") || "").trim();
      const changelog = String(form.get("changelog") || "").trim();
      const publish = form.get("publish") === "on";

      if (!(file instanceof File) || file.size === 0) {
        throw new Error("Please choose a JAR file.");
      }

      if (!file.name.toLowerCase().endsWith(".jar")) {
        throw new Error("Only .jar files are allowed.");
      }

      if (!productId || !version) {
        throw new Error("Choose a plugin and enter a version.");
      }

      const payload = JSON.stringify({
        productId,
        version,
        originalFileName: file.name,
      });

      const blob = await upload(file.name, file, {
        access: "private",
        handleUploadUrl: "/api/admin/releases/upload",
        clientPayload: payload,
        multipart: file.size > 5 * 1024 * 1024,
      });

      const finishResponse = await fetch("/api/admin/releases/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          version,
          changelog,
          storageKey: blob.pathname,
          publish,
        }),
      });

      const finish = await finishResponse.json().catch(() => null);

      if (!finishResponse.ok) {
        throw new Error(finish?.error || "The JAR uploaded, but the release could not be saved.");
      }

      window.location.href = "/admin/releases";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Release upload failed.";
      setMessage(message);
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
          <input
            className="input"
            name="version"
            placeholder="e.g. 1.1.1"
            required
            maxLength={40}
          />
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
        <span className="mt-2 block text-xs text-zinc-500">
          Uploaded directly from your browser into your private Vercel Blob store.
        </span>
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
