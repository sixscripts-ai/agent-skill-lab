import React from 'react';
import { ExecutionResult } from '../types';
import { Terminal, Table, AlertTriangle, Loader2 } from 'lucide-react';

interface TerminalOutputProps {
  output: ExecutionResult | null;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ output }) => {
  if (!output) return null;

  if (output.ui_component === 'loading') {
    return (
      <div className="flex items-center space-x-3 text-cyan-500 py-2">
        <Loader2 size={16} className="animate-spin" />
        <span className="font-mono text-sm animate-pulse">{output.data}</span>
      </div>
    );
  }

  if (output.ui_component === 'error') {
    return (
      <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-lg text-rose-400 font-mono text-sm my-2">
        <div className="flex items-center space-x-2 mb-2 text-rose-500">
          <AlertTriangle size={16} />
          <span className="font-bold tracking-wider">ERR_EXECUTION_FAILED</span>
        </div>
        <pre className="whitespace-pre-wrap leading-relaxed text-rose-300/90">{output.data}</pre>
      </div>
    );
  }

  if (output.ui_component === 'json_table') {
    try {
      const parsedData = JSON.parse(output.data);
      const isArray = Array.isArray(parsedData);
      const dataToRender = isArray ? parsedData : [parsedData];

      if (dataToRender.length === 0) {
        return <div className="text-slate-500 font-mono py-2">No data returned.</div>;
      }

      const headers = Object.keys(dataToRender[0]);

      return (
        <div className="my-3">
          <div className="flex items-center space-x-2 text-indigo-400 mb-2">
            <Table size={14} />
            <span className="font-mono text-xs font-bold tracking-widest">STRUCTURED_OUTPUT</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-900/20">
            <table className="w-full text-left text-sm font-mono border-collapse">
              <thead className="bg-slate-900/80">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-4 py-2 border-b border-slate-700/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {dataToRender.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    {headers.map((header) => (
                      <td key={`${i}-${header}`} className="px-4 py-2 text-slate-300">
                        {typeof row[header] === 'object' 
                          ? JSON.stringify(row[header]) 
                          : String(row[header])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } catch (e) {
      return (
        <div className="p-4 bg-slate-900/50 rounded-lg font-mono text-sm text-slate-300 border border-slate-800 my-2">
          <div className="flex items-center text-amber-500/80 mb-2 text-xs">
            <AlertTriangle size={14} className="mr-2" />
            Warning: Failed to parse JSON table. Displaying raw output.
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">{output.data}</pre>
        </div>
      );
    }
  }

  // Default to terminal_text
  return (
    <div className="font-mono text-sm text-slate-300 py-1">
      <pre className="whitespace-pre-wrap leading-relaxed text-slate-300/90">
        {output.data}
      </pre>
    </div>
  );
};
