import logo_jic from "../styles/img/logo_jic.png";
import { registerUser } from '../../services/Register';

export default function Login() {


  
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: ''
  });
  
  


  const result = await registerUser(formData);


  return (
    <div className="body align-items-center justify-content-center flex flex-col  bg-gray-300 h-screen">
      <div>
        <div className="header-register flex align-items-center justify-content-center flex-col">
          <img src={logo_jic} alt="logo_jic.png" className="w-[20vw] h-[20vh] object-cover" />
          <h1 class="text-green-700"><b>Biblioteca pro</b></h1>
          <p>Sistema de gestion de biblioteca</p>
        </div>
        <div className="bg-gray-500 max-w-1/2">
          <form onSubmit={register} class="form-register flex flex-col align-items-center justify-content-center ">
            <h4>Registrarse</h4>
            <p>Registrate con tu correo institucional</p>
            <label for="nombre">Nombres</label>
            <input type="text" name="nombre" id="nombre" placeholder="Tu nombre" />
            <label for="apellido">Apellidos</label>
            <input type="text" name="apellido" id="apellido" placeholder="Tu apellido" />
            <label for="email">Emali</label>
            <input type="email" name="email" id="email" placeholder="correo@elpoli.edu.co" />
            <label for="password">Emali</label>
            <input type="password" name="password" id="password"/>

          <button type="submit">Enviar</button>

          <a href="/login">¿Ya tienes una cuenta? Inicia sesion</a>

            
          </form>
        </div>
      </div>
    </div>
  );
}
