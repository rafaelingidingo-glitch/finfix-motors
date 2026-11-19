import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
};

/** Bare, centered layout for admin auth pages (login / setup). */
export default function AdminAuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-10"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(201,164,92,0.14), transparent 70%), radial-gradient(ellipse 40% 30% at 50% 100%, rgba(201,164,92,0.06), transparent 70%)",
      }}
    >
      {children}
    </div>
  );
}
