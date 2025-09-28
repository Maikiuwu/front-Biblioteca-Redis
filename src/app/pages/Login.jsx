import logo_jic from "../styles/img/logo_jic.png";
import { useState } from "react";
import { supabase } from '../../services/supabaseClient.js'

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  //funcion para manejar el submit del formulario
  const handleSubmit = async (e) => {
    console.log("enviando formulario");
    e.preventDefault();

    //verificar si el usuario ya estan en redis
    //utilizar un sevicio (api /login) para mandar al back email password tokend de la sesion, //tiempo de vida del tokend
    //
    
      try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
        options: {
          redirectioTo: 'http://localhost:5173/home'
        }
      })
       //guardar en redis el email password y tokend (api /save)

       
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
    <div className="body-login">

      <img src={logo_jic} alt="logo_jic.png" />
      <div className="login-container">
        <h1>Biblioteca pro</h1>
        <p>Sistema de gestion de biblioteca</p>

        <form onSubmit={handleSubmit}>
          <h4>Iniciar sesion</h4>
          <p>Accede con tus credenciales institucionales</p>
          <label htmlFor="email">Ingresa tu email</label>
          <input type="email" name="email" id="email" placeholder="email@elpoli.edu.co"
            onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="password">Ingresa tu contraseña</label>
          <input type="password" name="password" id="password" placeholder="********"
            onChange={(e) => setPassword(e.target.value)} />


          <p id="error-message" className="text-red-500 hidden"></p>

          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}


