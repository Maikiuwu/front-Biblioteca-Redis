import logo_jic from "../styles/img/logo_jic.png";

export default function Login() {
  return (
    <div className="body-login">
      <img alt={logo_jic} src="logo_jic.png" />
      <div className="login-container">
        <h1>Biblioteca pro</h1>
        <p>Sistema de gestion de biblioteca</p>
        <form>
          <h4>Iniciar sesion</h4>
          <p>Accede con tus credenciales institucionales</p>
          <label htmlFor="tipo_usuario">Perfil de usuario</label>
          <select name="tipo_usuario" id="tipo_usuario">
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="administrativo">Administrativo</option>
          </select>
          
          
          <input type="submit" value="Enviar" />
        </form>
      </div>
    </div>
  );
}


