import Link from "next/link";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";

export const metadata = {
  title: "Verify email | FreshFlower.zone",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let status: "success" | "invalid" = "invalid";

  if (token) {
    await dbConnect();
    const result = await CustomerModel.updateOne(
      {
        emailVerificationToken: token,
        $or: [
          { emailVerificationTokenExpiresAt: { $exists: false } },
          { emailVerificationTokenExpiresAt: { $gte: new Date() } },
        ],
      },
      {
        $set: { emailVerified: true, updatedAt: new Date() },
        $unset: { emailVerificationToken: "", emailVerificationTokenExpiresAt: "" },
      },
    ).lean();
    status = result.modifiedCount > 0 || result.matchedCount > 0 ? "success" : "invalid";
  }

  return (
    <main className="min-h-screen bg-ivory px-5 py-16">
      <section className="glass-deep mx-auto max-w-xl rounded-3xl p-7 text-center shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
          Email verification
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink">
          {status === "success" ? "Email verified" : "Verification link invalid"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink-soft">
          {status === "success"
            ? "Your FreshFlower.zone account is verified. You can continue with checkout and account history."
            : "This verification link is missing, expired, or already used."}
        </p>
        <Link
          href="/account"
          className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-bold text-ivory"
        >
          Open dashboard
        </Link>
      </section>
    </main>
  );
}
