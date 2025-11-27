import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../../services/supabaseClient.js'

export default function Books() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [tipos, setTipos] = useState([]);         // new: tipos reference list
  const [generos, setGeneros] = useState([]);     // new: generos reference list
  const [form, setForm] = useState({ id: "", title: "", author: "", year: "", id_tipo: "", id_genero: "" }); // add fields
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({}); // <-- new: validation errors

  // Normalize rows from Supabase to UI-friendly book objects
  function mapRowToBook(row, tiposMap = {}, genMap = {}) {
    return {
      id: row.id,
      title: row.titulo ?? row.title ?? "Sin título",
      author: row.autor ?? row.author ?? "Sin autor",
      // ensure year is always a string in the UI
      year: row.aniodepublicacion != null ? String(row.aniodepublicacion) : "",
      id_tipo: row.id_tipo ?? null,
      tipo_label: tiposMap[String(row.id_tipo)] ?? null,
      id_genero: row.id_genero ?? null,
      genero_label: genMap[String(row.id_genero)] ?? null
    }
  }

  // new: validation helper
  function validateForm() {
    const e = {};
    if (!form.title || !form.title.trim()) e.title = "El título es obligatorio.";
    if (!form.author || !form.author.trim()) e.author = "El autor es obligatorio.";
    if (!form.year || !String(form.year).trim()) e.year = "El año es obligatorio.";
    else if (Number.isNaN(Number(form.year)) || !Number.isInteger(Number(form.year)) || Number(form.year) <= 0) e.year = "El año debe ser un número entero positivo.";
    if (!form.id_tipo || String(form.id_tipo).trim() === "") e.id_tipo = "El tipo es obligatorio.";
    if (!form.id_genero || String(form.id_genero).trim() === "") e.id_genero = "El género es obligatorio.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  useEffect(() => {
    // cargar lista inicial de libros
    fetchBooks();
  }, []);

  async function fetchBooks() {
    setLoading(true);
    try {
      // fetch tipos and generos first so we can map IDs to labels
      const { data: tiposData, error: errTipo } = await supabase
        .from('tipomaterial')
        .select('id, tipo');

      const { data: generosData, error: errGen } = await supabase
        .from('material_genero')
        .select('id_genero, clasificacion');

      if (errTipo) throw errTipo;
      if (errGen) throw errGen;

      setTipos(tiposData ?? []);
      setGeneros(generosData ?? []);

      // build maps
      const tiposMap = {};
      (tiposData ?? []).forEach(t => tiposMap[t.id] = t.tipo);

      const genMap = {};
      (generosData ?? []).forEach(g => genMap[g.id_genero] = g.clasificacion);

      // fetch books and map with labels
      const { data, error } = await supabase
        .from('materialbibliografico')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      const mapped = (data ?? []).map(r => mapRowToBook(r, tiposMap, genMap));
      setBooks(mapped);

      console.log('fetchBooks mapped:', mapped);
    } catch (err) {
      console.error('fetchBooks error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!validateForm()) return; // stop submission if invalid
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materialbibliografico')
        .insert([{
          titulo: form.title,
          autor: form.author,
          aniodepublicacion: form.year ? Number(form.year) : null,
          id_tipo: form.id_tipo ? Number(form.id_tipo) : null,
          id_genero: form.id_genero ? Number(form.id_genero) : null
        }])
        .select();

      if (error) throw error;
      // map with available reference labels from current state
      const tiposMap = {};
      tipos.forEach(t => { tiposMap[String(t.id)] = t.tipo })
      const genMap = {};
      generos.forEach(g => { genMap[String(g.id_genero)] = g.clasificacion })

      const inserted = (data || []).map(r => mapRowToBook(r, tiposMap, genMap))[0];
      if (inserted) setBooks(prev => [inserted, ...prev]);
      setForm({ id: "", title: "", author: "", year: "", id_tipo: "", id_genero: "" });
    } catch (err) {
      console.error('handleCreate error:', err);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(book) {
    // Receive normalized book object; ensure year is string for the input
    setEditing(true);
    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      year: book.year != null ? String(book.year) : "",
      id_tipo: book.id_tipo ?? "",
      id_genero: book.id_genero ?? ""
    });
    setErrors({}); // clear errors when editing existing record
    // TODO: scroll to form / focus
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!validateForm()) return; // stop submission if invalid
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materialbibliografico')
        .update({
          titulo: form.title,
          autor: form.author,
          aniodepublicacion: form.year ? Number(form.year) : null,
          id_tipo: form.id_tipo ? Number(form.id_tipo) : null,
          id_genero: form.id_genero ? Number(form.id_genero) : null
        })
        .eq('id', form.id)
        .select();

      if (error) throw error;

      const tiposMap = {};
      tipos.forEach(t => { tiposMap[String(t.id)] = t.tipo })
      const genMap = {};
      generos.forEach(g => { genMap[String(g.id_genero)] = g.clasificacion })

      const updated = (data || []).map(r => mapRowToBook(r, tiposMap, genMap))[0];
      if (updated) setBooks(prev => prev.map(b => b.id === form.id ? updated : b));
      setEditing(false);
      setForm({ id: "", title: "", author: "", year: "", id_tipo: "", id_genero: "" });
    } catch (err) {
      console.error('handleUpdate error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('materialbibliografico')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('handleDelete error:', err);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen app-bg flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white/95 rounded-2xl p-8 shadow-2xl border-l-4 border-emerald-500">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-800">Catálogo de Libros</h1>
            <p className="text-emerald-700/90 mt-1 text-sm">Crear, leer, actualizar y eliminar libros</p>
          </div>
          <div>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-emerald-500 text-white font-semibold shadow-md hover:opacity-95 transition"
            >
              Volver
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario Create / Update */}
          <form onSubmit={editing ? handleUpdate : handleCreate} className="p-4 rounded-lg bg-yellow-50/90 border border-yellow-200">
            <h3 className="font-bold text-emerald-800 mb-2">{editing ? 'Editar libro' : 'Agregar libro'}</h3>

            <label className="block text-sm text-emerald-800">Título</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full mt-2 px-3 py-2 rounded-md bg-white border" />
            {errors.title && <div className="text-sm text-red-600 mt-1">{errors.title}</div>}

            <label className="block text-sm text-emerald-800 mt-3">Autor</label>
            <input required value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="w-full mt-2 px-3 py-2 rounded-md bg-white border" />
            {errors.author && <div className="text-sm text-red-600 mt-1">{errors.author}</div>}

            <label className="block text-sm text-emerald-800 mt-3">Año</label>
            <input
              required
              type="text"
              inputMode="numeric"
              value={form.year}
              onChange={e => {
                const raw = e.target.value ?? "";
                const sanitized = raw.replace(/[^\d]/g, "");
                setForm(f => ({ ...f, year: sanitized }));
              }}
              className="w-full mt-2 px-3 py-2 rounded-md bg-white border"
            />
            {errors.year && <div className="text-sm text-red-600 mt-1">{errors.year}</div>}

            <label className="block text-sm text-emerald-800 mt-3">Tipo</label>
            <select required value={form.id_tipo ?? ""} onChange={e => setForm(f => ({ ...f, id_tipo: e.target.value }))} className="w-full mt-2 px-3 py-2 rounded-md bg-white border">
              <option value="">-- Seleccionar tipo --</option>
              {tipos.map(t => (
                <option key={t.id} value={t.id}>{t.tipo}</option>
              ))}
            </select>
            {errors.id_tipo && <div className="text-sm text-red-600 mt-1">{errors.id_tipo}</div>}

            <label className="block text-sm text-emerald-800 mt-3">Género</label>
            <select required value={form.id_genero ?? ""} onChange={e => setForm(f => ({ ...f, id_genero: e.target.value }))} className="w-full mt-2 px-3 py-2 rounded-md bg-white border">
              <option value="">-- Seleccionar género --</option>
              {generos.map(g => (
                <option key={g.id_genero} value={g.id_genero}>{g.clasificacion}</option>
              ))}
            </select>
            {errors.id_genero && <div className="text-sm text-red-600 mt-1">{errors.id_genero}</div>}

            <div className="flex items-center justify-between mt-4">
              <button
                type="submit"
                disabled={loading || !form.title || !form.author || !form.year || !form.id_tipo || !form.id_genero}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
              >
                {editing ? 'Actualizar' : 'Crear'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(false); setForm({ id: "", title: "", author: "", year: "", id_tipo: "", id_genero: "" }); setErrors({}); }} className="px-3 py-2 rounded-md bg-gray-200 text-gray-700">
                  Cancelar
                </button>
              )}
            </div>

          </form>

          {/* Lista de libros */}
          <div className="p-4 rounded-lg bg-yellow-50/90 border border-yellow-200">
            <h3 className="font-bold text-emerald-800 mb-2">Lista de libros</h3>

            {loading ? (
              <div className="text-sm text-emerald-700">Cargando...</div>
            ) : (
              <ul className="space-y-3">
                {books.map(book => (
                  <li key={book.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                    <div>
                      <div className="font-semibold text-emerald-800">{book.title}</div>
                      <div className="text-sm text-emerald-700">
                        {book.author} — {book.year}
                        {(book.tipo_label || book.genero_label) && (
                          <div className="text-xs text-gray-500">
                            {book.tipo_label && <span>{book.tipo_label}</span>}
                            {book.tipo_label && book.genero_label && <span> · </span>}
                            {book.genero_label && <span>{book.genero_label}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(book)} className="text-sm px-3 py-1 bg-amber-300 text-emerald-800 rounded-md">Editar</button>
                      <button onClick={() => handleDelete(book.id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded-md">Borrar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}