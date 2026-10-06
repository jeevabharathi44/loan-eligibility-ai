import React from 'react';
import { Cpu, Database, Layout, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-line/60 bg-card/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-center text-ink">
          Production Architecture & Technologies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <section className="bg-card/90 border border-line/70 rounded-2xl p-4 shadow-sm hover:border-cy/40 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-cy font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <h3>Machine Learning</h3>
            </div>
            <ul className="text-xs text-mute space-y-1 pl-1">
              <li>• InterpretML (EBM) Glassbox</li>
              <li>• scikit-learn (LR baseline)</li>
              <li>• Dynamic feature explanations</li>
              <li>• Calibrated risk scoring</li>
            </ul>
          </section>

          <section className="bg-card/90 border border-line/70 rounded-2xl p-4 shadow-sm hover:border-cy/40 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-cy font-bold text-sm">
              <Database className="w-4 h-4" />
              <h3>Backend & Database</h3>
            </div>
            <ul className="text-xs text-mute space-y-1 pl-1">
              <li>• Node.js + Express (TypeScript)</li>
              <li>• MySQL 8.0 & Prisma ORM</li>
              <li>• JWT, bcrypt, Helmet, CORS</li>
              <li>• Audit logging & RBAC</li>
            </ul>
          </section>

          <section className="bg-card/90 border border-line/70 rounded-2xl p-4 shadow-sm hover:border-cy/40 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-cy font-bold text-sm">
              <Layout className="w-4 h-4" />
              <h3>Frontend & UI</h3>
            </div>
            <ul className="text-xs text-mute space-y-1 pl-1">
              <li>• React 18 + Vite + TypeScript</li>
              <li>• Tailwind CSS Design System</li>
              <li>• Interactive CIBIL gauge</li>
              <li>• Mobile-first responsive UX</li>
            </ul>
          </section>

          <section className="bg-card/90 border border-line/70 rounded-2xl p-4 shadow-sm hover:border-cy/40 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-cy font-bold text-sm">
              <Server className="w-4 h-4" />
              <h3>Deployment</h3>
            </div>
            <ul className="text-xs text-mute space-y-1 pl-1">
              <li>• Docker & Docker Compose</li>
              <li>• Python FastAPI (Uvicorn)</li>
              <li>• Microservices networking</li>
              <li>• Production container builds</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 text-center text-xs text-dim">
          <p className="mb-1">
            Loan Eligibility AI — Full-Stack Explainable Credit Risk Platform
          </p>
          <p className="text-[11px] text-mute/80">
            This platform is an AI-assisted demonstration/research system. Not a regulated financial product or guaranteed loan commitment.
          </p>
        </div>
      </div>
    </footer>
  );
};
