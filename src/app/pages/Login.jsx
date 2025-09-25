import '../../styles/index.css';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(https://images.alphacoders.com/603/603479.png)]  bg-cover bg-center dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Iniciar Sesión
        </h2>
        <form  className="space-y-4">
          <input
            name="username"
            type="text"
            placeholder="Nombre de Usuario"
            
          
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-300"
          >
            Iniciar Sesión
          </button>
        </form>
        
        <div className="mt-6 flex justify-center">
          <span className="text-gray-600 dark:text-gray-300 mr-2">¿No tienes cuenta?</span>
          <button
            
            className="text-blue-600 hover:underline font-semibold"
            type="button"
          >
            Regístrate
          </button>
        </div>
      </div>
    </div>
  );
}


