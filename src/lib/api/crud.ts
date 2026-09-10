import type { Model } from "mongoose";
import { serialize, serializeList } from "@/lib/db/repositories";
import { dbConnect } from "@/lib/db/connect";

// Lean mongoose docs (WithMeta) are structurally compatible with this shape.
type LeanDoc = { _id?: unknown; __v?: number } & Record<string, unknown>;

/**
 * Thin generic CRUD backing for the admin API routes.
 *
 * All admin resources share the same shape: GET list / GET by id / POST upsert
 * (by string `_id`) / PATCH merge / DELETE. Writes validate in the route layer
 * via its zod schema; this module only resolves the model and normalizes the
 * response with the same serializer the read repositories use.
 */
export function makeCrud<T>(model: Model<T>) {
  return {
    async list(): Promise<T[]> {
      await dbConnect();
      const docs = (await model.find().sort({ _id: 1 }).lean()) as unknown as NonNullable<T>[];
      return serializeList(docs) as T[];
    },

    async get(id: string): Promise<T | null> {
      await dbConnect();
      const doc = await model.findById(id).lean();
      return serialize<T>(doc as unknown as LeanDoc | null);
    },

    /** Upsert by `_id` so admin edits of seeded ids stay deterministic. */
    async upsert(id: string, data: Record<string, unknown>): Promise<{ ok: boolean }> {
      await dbConnect();
      await model.updateOne({ _id: id }, { $set: data }, { upsert: true }).lean();
      return { ok: true };
    },

    async patch(id: string, patch: Record<string, unknown>): Promise<{ ok: boolean }> {
      await dbConnect();
      const updated = await model
        .findByIdAndUpdate(id, { $set: patch }, { new: true, timestamps: false })
        .lean();
      if (!updated) throw new Error("Not found");
      return { ok: true };
    },

    async remove(id: string): Promise<{ ok: boolean }> {
      await dbConnect();
      const deleted = await model.findByIdAndDelete(id).lean();
      if (!deleted) throw new Error("Not found");
      return { ok: true };
    },
  };
}