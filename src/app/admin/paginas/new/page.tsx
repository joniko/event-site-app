import PageForm from '@/components/admin/page-form';

export default function NewPagePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nueva Página
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Crea una nueva página con un módulo específico
        </p>
      </div>

      <PageForm />
    </div>
  );
}
