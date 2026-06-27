import Link from "next/link";

export default function AppDemo() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050608] px-5 text-white">
      <section className="w-full max-w-lg rounded-xl border border-[#252a31] bg-[#111316] px-6 py-10 text-center">
        <h1 className="text-2xl font-extrabold">Ticket Transcript</h1>
        <p className="mt-4 text-sm leading-6 text-[#a0a4ad]">
          A interface principal esta disponivel na pagina inicial.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg border border-[#2b3038] bg-[#050608] px-4 py-2 text-sm font-bold text-white transition hover:border-[#349bf3]"
          href="/"
        >
          Voltar ao inicio
        </Link>
      </section>
    </main>
  );
}
