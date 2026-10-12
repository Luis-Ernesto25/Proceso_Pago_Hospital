export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50">
      
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" />
      </div>

      
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-semibold text-gray-700">Cargando...</p>
        <p className="text-sm text-gray-500">Por favor espera un momento</p>
      </div>
    </div>
  );
}