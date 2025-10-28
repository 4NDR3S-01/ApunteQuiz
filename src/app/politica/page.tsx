import Link from 'next/link';

export const metadata = {
  title: 'Política de privacidad - ApunteQuiz',
  description: 'Política de privacidad de ApunteQuiz',
};

export default function PoliticaPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-4 text-2xl font-bold">Política de privacidad</h1>
      <p className="mb-4 text-[color:var(--text-muted)]">Aquí encontrarás la política de privacidad de ApunteQuiz. Esta página describe cómo recopilamos y usamos tus datos. (Contenido de ejemplo — reemplaza con la política real).</p>

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Datos que recopilamos</h2>
        <p className="text-[color:var(--text-muted)]">Recopilamos información mínima necesaria para ofrecer el servicio: correo electrónico para autenticación, preferencias de idioma y datos opcionales proporcionados por el usuario.</p>

        <h2 className="text-lg font-semibold">Uso de la información</h2>
        <p className="text-[color:var(--text-muted)]">Usamos tus datos para autenticación, personalización y para mejorar el servicio. No compartimos datos sin tu consentimiento.</p>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    </main>
  );
}
