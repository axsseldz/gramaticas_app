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
  const [grammarType, setGrammarType] = useState<string>('Indeterminado'); // Tipo de Gramática

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

  // Función para descargar las gramáticas como archivo .txt
  const downloadGramaticas = () => {
    const dataStr = JSON.stringify(gramaticas, null, 2); // Formatear con indentación
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'gramaticas.txt';
    link.click();

    URL.revokeObjectURL(url); // Liberar el objeto URL
  };

  // Función para manejar la carga de un archivo .txt
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') throw new Error('Contenido inválido');

        const parsedGramaticas: Gramatica[] = JSON.parse(content);

        // Validar que cada objeto tenga las propiedades necesarias
        if (!Array.isArray(parsedGramaticas)) throw new Error('Formato inválido');
        parsedGramaticas.forEach((gramatica) => {
          if (
            typeof gramatica.id !== 'number' ||
            typeof gramatica.regla !== 'string' ||
            typeof gramatica.produccion !== 'string'
          ) {
            throw new Error('Formato de regla inválido');
          }
        });

        setGramaticas(parsedGramaticas);
        localStorage.setItem('gramaticas', JSON.stringify(parsedGramaticas));
        alert('Reglas cargadas exitosamente');
      } catch (error) {
        alert('Error al cargar el archivo: ' + (error as Error).message);
      }
    };

    reader.readAsText(file);
  };

  // Función para determinar el tipo de gramática
  const determineGrammarType = (gramaticas: Gramatica[]): string => {
    // Filtrar las reglas que comienzan con "Σ"
    const filteredGramaticas = gramaticas.filter(
      (gramatica) => !gramatica.regla.startsWith('Σ')
    );

    // Funciones auxiliares
    const isNonTerminal = (symbol: string): boolean => /^[A-Z]$/.test(symbol);
    const isTerminal = (symbol: string): boolean => /^[a-z]$/.test(symbol);

    // Verificar Tipo 3: Gramática Regular
    const isType3 = filteredGramaticas.every(({ regla, produccion }) => {
      // Lado izquierdo debe ser un solo no terminal
      if (!isNonTerminal(regla)) return false;

      // Lado derecho puede ser:
      // - Un solo terminal
      // - Un terminal seguido de un solo no terminal (aA)
      // - Opcionalmente, para gramáticas regulares izquierdas, un no terminal seguido de un terminal (Aa)
      const regexRight1 = /^([a-z])([A-Z])?$/; // a o aA
      const regexRight2 = /^([A-Z])([a-z])?$/; // Aa o A
      return regexRight1.test(produccion) || regexRight2.test(produccion);
    });

    if (isType3) return 'Tipo 3: Gramática Regular';

    // Verificar Tipo 2: Gramática Libre de Contexto
    const isType2 = filteredGramaticas.every(({ regla, produccion }) => {
      // Lado izquierdo debe ser un solo no terminal
      if (!isNonTerminal(regla)) return false;
      // Lado derecho puede ser cualquier combinación de terminales y no terminales, incluyendo vacío
      return produccion.length > 0;
    });

    if (isType2) return 'Tipo 2: Gramática Libre de Contexto';

    // Verificar Tipo 1: Gramática Sensible al Contexto
    const isType1 = filteredGramaticas.every(({ regla, produccion }) => {
      // Evitar producciones que reducen la longitud
      return produccion.length >= regla.length;
    });

    if (isType1) return 'Tipo 1: Gramática Sensible al Contexto';

    // Si no cumple con las anteriores, es Tipo 0
    return 'Tipo 0: Gramática Infinita';
  };

  // Hook para determinar el tipo de gramática en tiempo real
  useEffect(() => {
    const type = determineGrammarType(gramaticas);
    setGrammarType(type);
  }, [gramaticas]);

  return (
    <div className="min-h-screen bg-[#000] text-white p-6 flex flex-col">
      {/* Encabezado con el Tipo de Gramática */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Generador de Gramáticas</h1>
        <p className="mt-2">
          Tipo de Gramática Actual:{' '}
          <span className="font-semibold">{grammarType}</span>
        </p>
      </div>

      <div className="flex w-full">
        {/* Panel izquierdo: Lista de reglas */}
        <div className="w-1/3 p-4 border-r border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Reglas</h2>
          <div className="space-y-2">
            {gramaticas.map((gramatica) => (
              <div
                key={gramatica.id}
                className="relative flex justify-between items-center bg-[#1a1a1a] p-2 rounded"
              >
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
            <h3 className="text-xl mb-2">
              {editingId !== null ? 'Editar Regla' : 'Añadir Nueva Regla'}
            </h3>
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
              placeholder="Producción"
              className="w-full p-2 mb-2 bg-[#1a1a1a] focus:outline-none border-gray-600 rounded"
            />

            {/* Contenedor de Botones Agrupados */}
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <button
                onClick={handleCreateOrUpdate}
                className={`flex-grow ${editingId !== null
                    ? 'bg-yellow-600 hover:bg-yellow-500'
                    : 'bg-green-600 hover:bg-green-500'
                  } text-white p-2 rounded`}
              >
                {editingId !== null ? 'Guardar Cambios' : 'Crear Regla'}
              </button>

              <button
                onClick={downloadGramaticas}
                className="flex-grow bg-blue-600 hover:bg-blue-500 text-white p-2 rounded"
              >
                Descargar Reglas
              </button>

              <div className="flex-grow">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white p-2 rounded cursor-pointer block text-center"
                >
                  Cargar Reglas
                </label>
              </div>
            </div>
            {/* Fin del Contenedor de Botones Agrupados */}
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
              className="bg-[#2a2a2a] hover:bg-[#1a1a1ae0] text-white p-1 rounded text-sm"
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
            <div
              key={index}
              className="relative flex items-center bg-[#1a1a1a] rounded p-2"
            >
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
