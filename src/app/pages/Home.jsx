import { supabase } from "../../services/supabaseClient";

export default function Home() { 

    return (
        <>
        <div>Home</div>
        <div>lolaso</div>
        <button onClick={() => supabase.auth.signOut()}>salir</button>
        </>
    
    );
}