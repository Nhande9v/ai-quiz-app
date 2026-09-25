type AuthShellProps = {
  children: React.ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-[#f8f7f3] lg:grid-cols-2">
      <section className="hidden bg-[#365cc4] p-10 text-white lg:flex lg:flex-col">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black tracking-tight text-[#365cc4] shadow-[0_5px_0_rgba(15,23,42,0.16)]">
          AQ
        </div>

        <div className="mt-auto max-w-md">
          <p className="mb-5 text-sm uppercase tracking-[0.25em] text-blue-100">
            Adaptive Quiz
          </p>

          <h1 className="font-serif text-5xl leading-none">
            A calmer way to know what you know.
          </h1>

          <p className="mt-8 text-blue-100">
            Assess, understand, and keep moving with a learning companion.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[500px]">{children}</div>
      </section>
    </main>
  );
}
