import logo_jic from "../styles/img/logo_jic.png";
import { useState } from "react";
import { supabase } from '../../services/supabaseClient.js'

export default function Register() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")


  //funcion para manejar el submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: 'http://localhost:5173/login'
        }
      })

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
    <div className="min-h-screen app-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/95 rounded-2xl p-8 shadow-2xl border-l-4 border-emerald-500">
        <img src={logo_jic} alt="logo_jic.png" className="w-20 h-20 rounded-lg mx-auto shadow-md" />
        <h1 className="text-center text-2xl font-extrabold text-emerald-800 mt-4">Crear cuenta</h1>
        <p className="text-center text-sm text-emerald-700/90 mb-6">Regístrate para acceder a Biblioteca Pro</p>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-emerald-800">Correo</label>
            <input
              id="email"
              type="email"
              required
              value={email}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="mt-2 w-full px-3 py-2 rounded-lg bg-yellow-50 border border-transparent focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          <div className="flex items-center justify-between">
            <a href="/login" className="text-sm text-emerald-700 hover:underline">Ya tengo cuenta</a>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-emerald-500 text-white font-semibold shadow-md hover:opacity-95 transition disabled:opacity-70"
            >Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


