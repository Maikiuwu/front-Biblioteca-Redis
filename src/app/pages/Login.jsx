import logo_jic from "../styles/img/logo_jic.png";
import { useState, useEffect } from "react";
import { supabase } from '../../services/supabaseClient.js'
import { login } from '../../services/enviaralback.js'

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  //funcion para manejar el submit del formulario
  const handleSubmit = async (e) => {
    console.log("enviando formulario");
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
        options: {
          redirectTo: 'http://localhost:5173/home'
        }
      })

      // obtener JWT
      const token = data?.session?.access_token ?? null

      // construir payload y enviar al backend mediante enviaralback.login
      const payload = { email, password, token }

      try {
        const resp = await login(payload)
        console.log('Respuesta backend:', resp)
      } catch (err) {
        console.error('Error enviando al backend:', err.message || err)
      }

      console.log(data);
      console.log(error);
    } catch (error) {
      console.log(error);
      const message = error.message || "Ocurrio un error al intentar iniciar sesion"
      const $element = document.querySelector("#error-message")
      $element.textContent = message
      $element.classList.remove("hidden")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center app-bg px-4">
      <div className="w-full max-w-md bg-white/95 rounded-2xl p-8 shadow-2xl border-l-4 border-emerald-500">
        <img src={logo_jic} alt="logo_jic" className="w-20 h-20 rounded-lg mx-auto shadow-md" />
        <h1 className="text-center text-2xl font-extrabold text-emerald-800 mt-4">Biblioteca Pro</h1>
        <p className="text-center text-sm text-emerald-700/90 mb-6">Sistema de gestión de biblioteca</p>

        

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-emerald-800">Correo</label>
            <input
              id="email"
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@elpoli.edu.co"
              className="mt-2 w-full px-3 py-2 rounded-lg bg-yellow-50 border border-transparent focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-emerald-800">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="mt-2 w-full px-3 py-2 rounded-lg bg-yellow-50 border border-transparent focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          <p id="error-message" className="text-red-600 text-sm font-semibold hidden"></p>

          <button
            type="submit"
            className="w-full py-2 mt-2 rounded-lg bg-gradient-to-r from-yellow-400 to-emerald-500 text-white font-bold shadow-lg hover:scale-[.998] transition-transform"
          >
            Entrar
          </button>
        </form>

        {/* botón / enlace para ir a registro */}
        <div className="mt-4 text-center">
          <span className="text-sm text-emerald-700 mr-2">¿No tienes cuenta?</span>
          <a
            href="/register"
            className="inline-block text-sm font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md hover:bg-emerald-200 transition"
          >
            Crear cuenta
          </a>
        </div>
      </div>
    </div>
  );
}


