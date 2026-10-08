export type ReviewFormPayload = {
  customerName: string | null;
  kind: "text" | "image";
  bodyText: string | null;
  imageFile: File | null;
};

export function parseReviewFormData(form: FormData): { ok: true; data: ReviewFormPayload } | { ok: false; error: string } {
  const customerName = String(form.get("customer_name") ?? "").trim();
  const kind = String(form.get("kind") ?? "").trim();
  const bodyText = String(form.get("body_text") ?? "").trim();
  const imageFile = form.get("image");

  if (kind !== "text" && kind !== "image") {
    return { ok: false, error: "Review type must be text or image." };
  }

  const file =
    imageFile instanceof File && imageFile.size > 0 ? imageFile : null;

  if (kind === "text" && !bodyText) {
    return { ok: false, error: "Review text is required." };
  }

  if (kind === "image" && file) {
    if (!file.type.startsWith("image/")) {
      return { ok: false, error: "Review file must be an image." };
    }
    const maxBytes = 4 * 1024 * 1024;
    if (file.size > maxBytes) {
      return { ok: false, error: "Review image must be under 4MB." };
    }
  }

  return {
    ok: true,
    data: {
      customerName: customerName || null,
      kind,
      bodyText: kind === "text" ? bodyText : null,
      imageFile: kind === "image" ? file : null,
    },
  };
}
