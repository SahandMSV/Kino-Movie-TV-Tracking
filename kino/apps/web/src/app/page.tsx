import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="max-w-2xl text-center px-6">
        <h1 className="text-6xl font-bold tracking-tighter mb-6">Kino</h1>
        <p className="text-2xl text-zinc-400 mb-8">
          Doesn&apos;t look like anything to me.
        </p>
        <p className="text-zinc-500 text-lg">
          First commit • The beginning of something great
        </p>
      </div>
    </div>
  );
}
