import Link from 'next/link';

export const metadata = {
  title: 'Términos de uso - ApunteQuiz',
  description: 'Términos y condiciones de uso de ApunteQuiz',
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-4 text-2xl font-bold">Términos de uso</h1>
      <p className="mb-4 text-[color:var(--text-muted)]">Estos son los términos y condiciones de uso de ApunteQuiz. (Contenido de ejemplo — reemplaza con los términos reales).</p>

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Aceptación de términos</h2>
        <p className="text-[color:var(--text-muted)]">Al usar ApunteQuiz aceptas los presentes términos; no utilices el servicio para actividades prohibidas.</p>

        <h2 className="text-lg font-semibold">Modificaciones</h2>
        <p className="text-[color:var(--text-muted)]">Podemos actualizar estos términos; las modificaciones se reflejarán en esta página y entrarán en vigor al publicarse.</p>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    </main>
  );
}
