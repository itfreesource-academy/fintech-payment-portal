import React from 'react';
import { FileCode2, ExternalLink, Code2, Download } from 'lucide-react';

export const SwaggerPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-teal-400 font-semibold uppercase tracking-wider">
            <FileCode2 className="w-4 h-4" />
            <span>OpenAPI 3.0 Interactive Specification</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            API Reference & Swagger Documentation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized OpenAPI 3.0 contract covering all 8 microservices, schemas, error codes, and Bearer JWT auth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5001/api/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <span>Open in Fullscreen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="http://localhost:5001/api/swagger.json"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>swagger.json</span>
          </a>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 h-[750px]">
        <iframe
          src="http://localhost:5001/api/docs"
          title="Swagger OpenAPI Documentation"
          className="w-full h-full border-0 bg-white"
        />
      </div>
    </div>
  );
};
