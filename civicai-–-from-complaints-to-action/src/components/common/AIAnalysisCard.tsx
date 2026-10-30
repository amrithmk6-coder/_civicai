import React from 'react';
import { AIAnalysis } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import {
  Sparkles,
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Compass,
} from 'lucide-react';

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
  complaintId?: string;
  onSelectRelatedId?: (id: string) => void;
  compact?: boolean;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  complaintId,
  onSelectRelatedId,
  compact = false,
}) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
      {/* Background subtle mesh glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold tracking-tight text-white">
                CivicAI Diagnostic Engine
              </h4>
              <span className="text-[10px] font-mono tracking-wider uppercase bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-700/50">
                Simulated AI Demo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated NLP category extraction, triage & spatial deduplication
            </p>
          </div>
        </div>

        {/* Confidence score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Model Confidence</div>
            <div className="text-sm font-bold text-teal-400">
              {analysis.confidence}% Match
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-teal-500/40 flex items-center justify-center text-xs font-bold text-teal-300 bg-slate-950">
            {analysis.confidence}%
          </div>
        </div>
      </div>

      {/* Core Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 my-4 relative z-10">
        {/* Identified Category */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            Identified Category
          </div>
          <div className="text-sm font-semibold text-white">
            {analysis.identifiedCategory}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Auto-classified via municipal ontology
          </div>
        </div>

        {/* Assessed Priority */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            Priority Level
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <PriorityBadge priority={analysis.priority} size="md" />
            <span className="text-[11px] text-slate-400">
              SLA: {analysis.slaHours}h
            </span>
          </div>
        </div>

        {/* Suggested Department */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Recommended Routing
          </div>
          <div className="text-sm font-semibold text-slate-100 truncate">
            {analysis.suggestedDepartment}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Direct queue dispatch ready
          </div>
        </div>

        {/* Impact Level */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Estimated Impact
          </div>
          <div className="text-sm font-semibold text-slate-100 line-clamp-1">
            {analysis.estimatedImpact}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Sentiment: {analysis.sentimentScore}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="mb-4 bg-slate-950/50 p-3.5 rounded-lg border border-slate-800/80 relative z-10">
        <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          AI Synthesis
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Priority Rationale & Explanation (CRITICAL REQUIREMENT) */}
      <div className="mb-4 bg-amber-950/20 border border-amber-800/40 rounded-lg p-3.5 relative z-10">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-amber-300 mb-1 flex items-center justify-between">
              <span>Why the AI Assigned this Priority ({analysis.priority})</span>
              <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-mono">
                Explainable Rationale
              </span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed font-sans">
              {analysis.reason}
            </p>
            {analysis.keywordsDetected && analysis.keywordsDetected.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Trigger Tokens:</span>
                {analysis.keywordsDetected.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-amber-900/40 text-amber-200 border border-amber-700/50 px-2 py-0.5 rounded text-[10px] font-mono"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="mb-4 bg-teal-950/20 border border-teal-800/40 rounded-lg p-3.5 relative z-10">
        <div className="flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-teal-300 mb-1">
              AI Recommended Municipal Action
            </div>
            <p className="text-xs text-teal-100/90 leading-relaxed">
              {analysis.recommendedAction}
            </p>
          </div>
        </div>
      </div>

      {/* Duplicate & Cluster Detection */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">
              Spatial Duplicate & Cluster Analysis
            </span>
          </div>
          {analysis.duplicateDetection.isDuplicateOrCluster ? (
            <span className="inline-flex items-center text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
              {analysis.duplicateDetection.duplicateCount} Duplicate / Cluster Match(es) Found
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
              Unique Isolated Report (No Clustered Duplicates)
            </span>
          )}
        </div>

        {analysis.duplicateDetection.isDuplicateOrCluster ? (
          <div>
            <p className="text-xs text-slate-300 mb-2">
              CivicAI spatial radius filter detected {analysis.duplicateDetection.duplicateCount} similar
              reports within 800m sharing corresponding infrastructure choke points.
              {analysis.duplicateDetection.clusterName && (
                <span className="font-semibold text-teal-300 ml-1">
                  Assigned Cluster: {analysis.duplicateDetection.clusterName}
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400">Related Complaints:</span>
              {analysis.duplicateDetection.relatedComplaintIds.map((id) => (
                <button
                  key={id}
                  onClick={() => onSelectRelatedId && onSelectRelatedId(id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-mono transition-colors border border-slate-700"
                  title="Click to view related complaint details"
                >
                  <span>{id}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No redundant reports detected within a 1.5km geofence. Dispatched as single independent work order.
          </p>
        )}
      </div>

      {/* Model footnote */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 relative z-10">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          CivicAI Transformer Model v2.4 (Fine-tuned for Municipal Infrastructure Triage)
        </span>
        <span>Ready for Gemini 2.5 Flash Production Hook</span>
      </div>
    </div>
  );
};
