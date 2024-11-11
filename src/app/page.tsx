import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extralight text-white tracking-wide mb-12">
          Herramientas Gramaticales
        </h1>
        <nav className="flex flex-col sm:flex-row gap-5 sm:gap-8">
          <Link
            href="/check"
            className="px-8 py-4 text-white bg-black/20 border border-gray-700 rounded-xl
                     hover:bg-black/30 hover:border-gray-600 transition-all duration-300
                     shadow-sm hover:shadow-md backdrop-blur-sm"
          >
            Revisar Gramática
          </Link>
          <Link
            href="/grammars"
            className="px-8 py-4 text-white bg-black/20 border border-gray-700 rounded-xl
                     hover:bg-black/30 hover:border-gray-600 transition-all duration-300
                     shadow-sm hover:shadow-md backdrop-blur-sm"
          >
            Lista de Gramáticas
          </Link>
        </nav>
      </div>
    </main>
  );
}
