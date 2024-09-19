'use client';

import { useState, useEffect } from 'react';

interface Gramatica {
  id: number;
  regla: string;
  produccion: string;
}

export default function Home() {
  const [gramaticas, setGramaticas] = useState<Gramatica[]>([]);
  const [currentGramatica, setCurrentGramatica] = useState('');
  const [currentProduccion, setCurrentProduccion] = useState('');
  const [generatedString, setGeneratedString] = useState('Σ'); // cadena inicial 'Σ'
  const [appliedRules, setAppliedRules] = useState<Gramatica[]>([]); // Reglas usadas
  const [savedStrings, setSavedStrings] = useState<string[]>([]); // Almacena las cadenas generadas 
  const [editingId, setEditingId] = useState<number | null>(null); // Almacena la regla que se está editando

  // Cargar gramáticas y las cadenas generados desde Local Storage cuando se monta el componente
  useEffect(() => {
    const storedGramaticas = localStorage.getItem('gramaticas');
    const storedStrings = localStorage.getItem('savedStrings');

    if (storedGramaticas) {
      setGramaticas(JSON.parse(storedGramaticas));
    }

    if (storedStrings) {
      setSavedStrings(JSON.parse(storedStrings));
    }
  }, []);

  // Guardar gramáticas en Local Storage cuando cambian las reglas
  useEffect(() => {
    if (gramaticas.length > 0) {
      localStorage.setItem('gramaticas', JSON.stringify(gramaticas));
    }
  }, [gramaticas]);

  // Función para guardar la cadena generada en Local Storage
  const saveGeneratedString = () => {
    const updatedStrings = [...savedStrings, generatedString];
    setSavedStrings(updatedStrings);
    localStorage.setItem('savedStrings', JSON.stringify(updatedStrings));
  };

  // Función para eliminar un texto guardado
  const deleteSavedString = (index: number) => {
    const updatedStrings = savedStrings.filter((_, i) => i !== index); // Elimina el texto en el índice dado
    setSavedStrings(updatedStrings);
    localStorage.setItem('savedStrings', JSON.stringify(updatedStrings)); // Actualiza el Local Storage
  };

  // Función para crear nuevas reglas o actualizar una existente
  const handleCreateOrUpdate = () => {
    if (currentGramatica.trim() !== '' && currentProduccion.trim() !== '') {
      if (editingId !== null) {
        // Si estamos editando, actualizamos la regla existente
        const updatedGramaticas = gramaticas.map((gramatica) =>
          gramatica.id === editingId
            ? { ...gramatica, regla: currentGramatica.trim(), produccion: currentProduccion.trim() }
            : gramatica
        );
        setGramaticas(updatedGramaticas);
        setEditingId(null); // Salir del modo de edición
      } else {
        // Si no estamos editando, creamos una nueva regla
        const newGramatica: Gramatica = {
          id: Date.now(),
          regla: currentGramatica.trim(),
          produccion: currentProduccion.trim(),
        };
        setGramaticas([...gramaticas, newGramatica]);
      }

      setCurrentGramatica('');
      setCurrentProduccion('');
    }
  };

  // Función para aplicar una regla de gramática
  const applyRule = (regla: Gramatica) => {
    if (generatedString.includes(regla.regla)) {
      const newString = generatedString.replace(regla.regla, regla.produccion);
      setGeneratedString(newString); // Actualizar el string generado
      setAppliedRules([...appliedRules, regla]); // Añadir la regla al feed
    }
  };

  // Función para eliminar una regla
  const deleteRule = (id: number) => {
    const updatedGramaticas = gramaticas.filter((gramatica) => gramatica.id !== id);
    setGramaticas(updatedGramaticas);
    localStorage.setItem('gramaticas', JSON.stringify(updatedGramaticas)); // Actualizamos el Local Storage
  };

  // Función para cargar una regla para edición
  const editRule = (gramatica: Gramatica) => {
    setCurrentGramatica(gramatica.regla);
    setCurrentProduccion(gramatica.produccion);
    setEditingId(gramatica.id);
  };

  // Función para resetear el proceso
  const resetString = () => {
    setGeneratedString('Σ'); // Volver al estado inicial
    setAppliedRules([]); // Limpiar el feed de reglas aplicadas
  };

  return (
    <div className="min-h-screen bg-[#000] text-white p-6 flex flex-col">
      <div className="flex w-full">
        {/* Panel izquierdo: Lista de reglas */}
        <div className="w-1/3 p-4 border-r border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Reglas</h2>
          <div className="space-y-2">
            {gramaticas.map((gramatica) => (
              <div key={gramatica.id} className="relative flex justify-between items-center bg-[#1a1a1a] p-2 rounded">
                <button
                  className="text-left flex-grow"
                  onClick={() => applyRule(gramatica)}
                >
                  {gramatica.regla} → {gramatica.produccion}
                </button>
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 flex space-x-2">
                  <button
                    onClick={() => editRule(gramatica)}
                    className="bg-yellow-600 hover:bg-yellow-500 w-5 h-5 text-white rounded-full flex items-center justify-center"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteRule(gramatica.id)}
                    className="bg-red-500 hover:bg-red-400 w-5 h-5 text-white rounded-full flex items-center justify-center"
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-xl mb-2">{editingId !== null ? 'Editar Regla' : 'Añadir Nueva Regla'}</h3>
            <input
              type="text"
              value={currentGramatica}
              onChange={(e) => setCurrentGramatica(e.target.value)}
              placeholder="Regla"
              className="w-full p-2 mb-2 bg-[#1a1a1a] focus:outline-none border-gray-600 rounded"
            />
            <input
              type="text"
              value={currentProduccion}
              onChange={(e) => setCurrentProduccion(e.target.value)}
              placeholder="Texto"
              className="w-full p-2 mb-2 bg-[#1a1a1a] focus:outline-none border-gray-600 rounded"
            />
            <button
              onClick={handleCreateOrUpdate}
              className={`w-full ${editingId !== null ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} text-white p-2 rounded`}
            >
              {editingId !== null ? 'Guardar Cambios' : 'Crear Regla'}
            </button>
          </div>
        </div>

        {/* Área central: Texto generado */}
        <div className="w-1/3 p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Cadena Generada</h2>
          <div className="text-4xl font-mono p-6 bg-[#1a1a1a] rounded overflow-hidden text-ellipsis whitespace-nowrap">
            {generatedString}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={resetString}
              className="bg-[#2a2a2a]  hover:bg-[#1a1a1ae0] text-white p-1 rounded text-sm"
            >
              Reiniciar
            </button>
            <button
              onClick={saveGeneratedString}
              className="bg-green-600 hover:bg-green-500 text-white p-1 rounded text-sm"
            >
              Guardar
            </button>
          </div>
        </div>



        {/* Panel derecho: Feed de reglas aplicadas */}
        <div className="w-1/3 p-4 border-l border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Historial de Reglas</h2>
          <ul className="space-y-2">
            {appliedRules.map((rule, index) => (
              <li key={index} className="p-2 bg-[#1a1a1a] rounded">
                {rule.regla} → {rule.produccion}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mostrar las cadenas generadas */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Cadenas Guardadas</h2>
        <div className="flex flex-wrap gap-2">
          {savedStrings.map((text, index) => (
            <div key={index} className="relative flex items-center bg-[#1a1a1a] rounded p-2">
              <span className="mr-2">{text}</span>
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <button
                  onClick={() => deleteSavedString(index)}
                  className="bg-red-500 hover:bg-red-400 w-5 h-5 text-white rounded-full flex items-center justify-center"
                >
                  ✖
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
