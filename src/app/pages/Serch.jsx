import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registro de elementos de ChartJS (necesario una sola vez)
ChartJS.register(ArcElement, Tooltip, Legend);

/*
  Serch.jsx
  - Genera gráficas tipo doughnut con conteos agregados de materialbibliografico.
  - Filtros soportados: tipo (id_tipo -> tipomaterial.tipo), genero (id_genero -> material_genero.clasificacion),
    año (aniodepublicacion) y autor.
  - Implementa agregación en cliente (descarga columnas necesarias y cuenta por grupo).
  - Maneja casos donde no existan registros para ciertos tipos/géneros (muestra 0 en la gráfica).
*/

export default function Serch() {
  // filtro seleccionado: 'tipo' | 'genero' | 'año' | 'autor'
  const [filterType, setFilterType] = useState('');

  // estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // listas de referencia sacadas de Supabase (tipos, géneros)
  const [tiposMateria, setTiposMateria] = useState([]);
  const [generos, setGeneros] = useState([]);

  // datos para la gráfica
  const [chartData, setChartData] = useState(null);
  const [chartOptions] = useState({
    responsive: true,
    plugins: { legend: { position: 'right' }, tooltip: { enabled: true } }
  });

  // Carga opciones (tipos y géneros) al montar el componente
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Trae tipomaterial y material_genero desde Supabase
  async function fetchFilterOptions() {
    setLoadingOptions(true);
    try {
      const { data: tipos, error: errTipos } = await supabase
        .from('tipomaterial')
        .select('id, tipo');
      if (errTipos) throw errTipos;
      setTiposMateria(tipos || []);

      const { data: gens, error: errGens } = await supabase
        .from('material_genero')
        .select('id_genero, clasificacion');
      if (errGens) throw errGens;
      setGeneros(gens || []);
    } catch (err) {
      console.error('fetchFilterOptions error:', err);
    } finally {
      setLoadingOptions(false);
    }
  }

  // Genera una paleta de colores (cíclica) para la gráfica
  function generateColors(n) {
    const palette = [
      '#16a34a', '#ef4444', '#f59e0b', '#2563eb', '#8b5cf6',
      '#e11d48', '#06b6d4', '#f97316', '#10b981', '#6366f1',
      '#7c3aed', '#0ea5a0', '#f43f5e'
    ];
    return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
  }

  /*
    fetchAggregation:
    - Descarga las columnas necesarias de materialbibliografico.
    - Agrupa en cliente según el filtro seleccionado.
    - Mapea ids a etiquetas legibles usando tiposMateria / generos (cuando aplica).
    - Construye chartData compatible con react-chartjs-2.
  */
  async function fetchAggregation(filter) {
    setLoading(true);
    setChartData(null);
    try {
      // Selección de columnas necesarias (asegúrate que los nombres de columnas coinciden con tu DB)
      const { data, error } = await supabase
        .from('materialbibliografico')
        .select('id, id_tipo, id_genero, aniodepublicacion, autor'); // autor incluido

      if (error) {
        console.error('Supabase select error:', error);
        throw error;
      }

      const rows = data || [];

      // Contar elementos por clave según el filtro
      const counts = rows.reduce((acc, row) => {
        let key;
        if (filter === 'tipo') key = String(row.id_tipo ?? 'null');
        else if (filter === 'genero') key = String(row.id_genero ?? 'null');
        else if (filter === 'año') key = String(row.aniodepublicacion ?? 'Sin año');
        else if (filter === 'autor') key = String((row.autor || 'Sin autor').trim());
        else key = 'Otros';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      let labels = [];
      let values = [];

      // Construcción de labels/values según filtro
      if (filter === 'tipo') {
        // incluir todos los tipos conocidos (0 si no hay materiales)
        labels = tiposMateria.map(t => t.tipo);
        values = tiposMateria.map(t => counts[String(t.id)] || 0);

        // añadir claves encontradas en rows que no estén en tipomaterial (por si hay datos inconsistentes)
        const extra = Object.keys(counts).filter(k => k !== 'null' && !tiposMateria.some(t => String(t.id) === k));
        extra.forEach(k => { labels.push(`Tipo ${k}`); values.push(counts[k]); });
      } else if (filter === 'genero') {
        labels = generos.map(g => g.clasificacion);
        values = generos.map(g => counts[String(g.id_genero)] || 0);

        const extra = Object.keys(counts).filter(k => k !== 'null' && !generos.some(g => String(g.id_genero) === k));
        extra.forEach(k => { labels.push(`Género ${k}`); values.push(counts[k]); });
      } else if (filter === 'año') {
        // ordenar años por valor numérico descendente (mayor año primero)
        const yearEntries = Object.entries(counts).filter(([k]) => k !== 'Sin año');
        yearEntries.sort((a, b) => Number(b[0] || 0) - Number(a[0] || 0));
        labels = yearEntries.map(([k]) => k);
        values = yearEntries.map(([_, v]) => v);
        if (counts['Sin año']) { labels.push('Sin año'); values.push(counts['Sin año']); }
      } else if (filter === 'autor') {
        // ordenar autores por cantidad descendente
        const authorEntries = Object.entries(counts).filter(([k]) => k !== 'Sin autor' && k !== '');
        authorEntries.sort((a, b) => b[1] - a[1]);
        labels = authorEntries.map(([k]) => k);
        values = authorEntries.map(([_, v]) => v);
        if (counts['Sin autor'] || counts['']) {
          const noAuthorCount = (counts['Sin autor'] || 0) + (counts[''] || 0);
          labels.push('Sin autor'); values.push(noAuthorCount);
        }
      }

      // Si no hay datos, dejamos chartData null (se mostrará mensaje en UI)
      if (labels.length === 0 || values.length === 0) {
        setChartData(null);
        setLoading(false);
        return;
      }

      const colors = generateColors(labels.length);
      setChartData({
        labels,
        datasets: [{ label: 'Cantidad', data: values, backgroundColor: colors, hoverOffset: 8 }]
      });
    } catch (err) {
      console.error('fetchAggregation error:', err);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }

  // handler del formulario: solo valida que se haya seleccionado un filtro válido
  async function handleSearch(e) {
    e.preventDefault();
    if (!filterType) {
      alert('Selecciona un filtro');
      return;
    }
    // filtros compatibles para agregados
    if (['tipo', 'genero', 'año', 'autor'].includes(filterType)) {
      await fetchAggregation(filterType);
      return;
    }
    alert('Filtro no soportado para agregados');
  }

  return (
    <div className="min-h-screen app-bg flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white/95 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-extrabold text-emerald-800 mb-6">DashBoard</h1>

        {/* Formulario: solo seleccionador de filtro (no hay campo "valor") */}
        <form onSubmit={handleSearch} className="p-6 rounded-lg bg-yellow-50/90 border border-yellow-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-2">Filtrar por (agregados)</label>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setChartData(null); }}
                className="w-full px-3 py-2 rounded-md bg-white border border-emerald-300"
              >
                <option value="">-- Selecciona un filtro --</option>
                <option value="tipo">Tipo de Material</option>
                <option value="genero">Género</option>
                <option value="autor">Autor</option>
                <option value="año">Año de Publicación</option>
              </select>
            </div>

            {/* placeholder para mantener diseño */}
            <div />
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || loadingOptions}
                className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </div>
        </form>

        {/* Block: Resultado Gráfico Cuantitativo */}
        <div className="p-6 rounded-lg bg-yellow-50/90 border border-yellow-200">
          <h3 className="font-bold text-emerald-800 mb-4">Resultado Gráfico Cuantitativo</h3>

          {chartData ? (
            <div className="max-w-md mx-auto">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="text-sm text-emerald-700">
              Aplica un filtro (Tipo, Género, Autor o Año) y pulsa "Generar" para ver la gráfica.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}