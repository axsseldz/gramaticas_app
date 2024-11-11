'use client';

import { useState } from 'react';

interface NFATransition {
    state: string;
    symbol: string;
    nextStates: string[];
}

interface DFAState {
    name: string;
    isAccepting: boolean;
    transitions: { [key: string]: string };
}

export default function Check() {
    const [nfaStates, setNfaStates] = useState<string[]>([]);
    const [alphabet, setAlphabet] = useState<string[]>([]);
    const [transitions, setTransitions] = useState<NFATransition[]>([]);
    const [initialState, setInitialState] = useState('');
    const [acceptingStates, setAcceptingStates] = useState<string[]>([]);
    const [dfaTable, setDfaTable] = useState<DFAState[]>([]);

    // Get transitions for a single state
    const getNextStatesForSingle = (state: string, symbol: string): string[] => {
        const transition = transitions.find(t => t.state === state && t.symbol === symbol);
        return transition ? transition.nextStates : [];
    };

    // Get combined transitions for multiple states
    const getNextStates = (states: string[], symbol: string): string[] => {
        const nextStatesSet = new Set<string>();

        // Get transitions for each individual state in the compound state
        for (const state of states) {
            const singleStateTransitions = getNextStatesForSingle(state, symbol);
            singleStateTransitions.forEach(s => nextStatesSet.add(s));
        }

        return Array.from(nextStatesSet).sort();
    };

    const removeDuplicatesAndSort = (str: string): string => {
        return Array.from(new Set(str.split(''))).sort().join('');
    };

    const convertToDFA = () => {
        const newDFAStates: DFAState[] = [];
        const processedStates = new Set<string>();
        // Start with initial state, removing any duplicates
        const statesToProcess = [removeDuplicatesAndSort(initialState)];

        while (statesToProcess.length > 0) {
            const currentStateName = statesToProcess.shift()!;
            if (processedStates.has(currentStateName)) continue;

            processedStates.add(currentStateName);
            const currentStates = currentStateName.split('');

            const dfaState: DFAState = {
                name: currentStateName,
                isAccepting: currentStates.some(s => acceptingStates.includes(s)),
                transitions: {}
            };

            for (const symbol of alphabet) {
                const nextStates = getNextStates(currentStates, symbol);
                if (nextStates.length > 0) {
                    // Remove duplicates and ensure consistent ordering
                    const nextStateName = removeDuplicatesAndSort(nextStates.join(''));
                    dfaState.transitions[symbol] = nextStateName;

                    if (!processedStates.has(nextStateName)) {
                        statesToProcess.push(nextStateName);
                    }
                }
            }

            newDFAStates.push(dfaState);
        }

        setDfaTable(newDFAStates);
    };

    const handleTransitionChange = (fromState: string, symbol: string, value: string) => {
        const toStates = value.split(',').map(s => s.trim()).filter(Boolean);
        const newTransitions = transitions.filter(
            t => !(t.state === fromState && t.symbol === symbol)
        );

        if (toStates.length > 0) {
            newTransitions.push({
                state: fromState,
                symbol,
                nextStates: toStates
            });
        }

        setTransitions(newTransitions);
    };

    const downloadNFA = () => {
        const nfaConfig = {
            states: nfaStates,
            alphabet: alphabet,
            transitions: transitions,
            initialState: initialState,
            acceptingStates: acceptingStates
        };

        const blob = new Blob([JSON.stringify(nfaConfig, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nfa-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const uploadNFA = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const nfaConfig = JSON.parse(content);

                    // Update all states with the loaded configuration
                    setNfaStates(nfaConfig.states);
                    setAlphabet(nfaConfig.alphabet);
                    setTransitions(nfaConfig.transitions);
                    setInitialState(nfaConfig.initialState);
                    setAcceptingStates(nfaConfig.acceptingStates);
                } catch (error) {
                    alert('Error loading NFA configuration file');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Convertidor de NFA a DFA</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NFA Input */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">NFA Input</h2>

                        <div>
                            <label className="block text-sm font-medium">Estados</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-[#1a1a1a] rounded border border-gray-600"
                                placeholder="A,B,C"
                                onChange={(e) => setNfaStates(e.target.value.split(',').map(s => s.trim()))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Alfabeto</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-[#1a1a1a] rounded border border-gray-600"
                                placeholder="0,1"
                                onChange={(e) => setAlphabet(e.target.value.split(',').map(s => s.trim()))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Estado inicial</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-[#1a1a1a] rounded border border-gray-600"
                                placeholder="A"
                                onChange={(e) => setInitialState(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Estado(s) de aceptación</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-[#1a1a1a] rounded border border-gray-600"
                                placeholder="A,C"
                                onChange={(e) => setAcceptingStates(e.target.value.split(',').map(s => s.trim()))}
                            />
                        </div>

                        {/* NFA Transition Table */}
                        {nfaStates.length > 0 && alphabet.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Transiciones NFA</h3>
                                <table className="min-w-full border-collapse border border-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-700 p-2">Estado</th>
                                            {alphabet.map(symbol => (
                                                <th key={symbol} className="border border-gray-700 p-2">{symbol}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nfaStates.map(state => (
                                            <tr key={state}>
                                                <td className="border border-gray-700 p-2">{state}</td>
                                                {alphabet.map(symbol => (
                                                    <td key={`${state}-${symbol}`} className="border border-gray-700 p-2">
                                                        <input
                                                            type="text"
                                                            className="w-full p-1 bg-[#1a1a1a] rounded"
                                                            placeholder="Estado(s)"
                                                            onChange={(e) => handleTransitionChange(state, symbol, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <button
                            onClick={convertToDFA}
                            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
                            disabled={!transitions.length}
                        >
                            Convertir a DFA
                        </button>

                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={downloadNFA}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Descargar NFA
                            </button>

                            <label className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded cursor-pointer">
                                Cargar NFA
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={uploadNFA}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* DFA Output */}
                    {dfaTable.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">DFA</h2>
                            <table className="min-w-full border-collapse border border-gray-700">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-700 p-2">Estado</th>
                                        {alphabet.map(symbol => (
                                            <th key={symbol} className="border border-gray-700 p-2">{symbol}</th>
                                        ))}
                                        <th className="border border-gray-700 p-2">Aceptador</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dfaTable.map(state => (
                                        <tr key={state.name}>
                                            <td className="border border-gray-700 p-2">{state.name}</td>
                                            {alphabet.map(symbol => (
                                                <td key={symbol} className="border border-gray-700 p-2">
                                                    {state.transitions[symbol] || '∅'}
                                                </td>
                                            ))}
                                            <td className="border border-gray-700 p-2">
                                                {state.isAccepting ? '✓' : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
