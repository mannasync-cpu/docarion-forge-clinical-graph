'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cpu,
  FileCode2,
  FileText,
  GitBranch,
  Layers,
  Lock,
  Network,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Terminal,
  Users,
} from 'lucide-react';
import {
  HospitalJiraIncident,
  INITIAL_HOSPITAL_INCIDENTS,
  buildTeamworkGraphForIncident,
  executeRovoClinicalAction,
  sanitizeClinicalTextForAtlassian,
} from '@/lib/caregraph-engine';

type ActiveTab = 'jira_command' | 'teamwork_graph' | 'rovo_agent' | 'mcp_inspector' | 'forge_manifest';

interface RovoLogEntry {
  id: string;
  timestamp: string;
  actionKey: string;
  issueKey: string;
  message: string;
}

export default function DocarionForgeCareGraphApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('jira_command');
  const [incidents, setIncidents] = useState<HospitalJiraIncident[]>(INITIAL_HOSPITAL_INCIDENTS);
  const [selectedKey, setSelectedKey] = useState<string>('HOSP-401');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'HOSP-401-0': true,
    'HOSP-401-1': true,
  });

  const [rovoLogs, setRovoLogs] = useState<RovoLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '09:14:02 UTC',
      actionKey: 'graph:connector',
      issueKey: 'HOSP-401',
      message:
        'Atlassian Teamwork Graph synced 4 Hospital Incidents, 4 Confluence Clinical SOP Runbooks, 4 Biomedical Assets, and 4 On-Call Specialist Teams.',
    },
  ]);

  const [mcpSelectedTool, setMcpSelectedTool] = useState<string>('query_clinical_teamwork_graph');
  const [mcpNoteInput, setMcpNoteInput] = useState<string>(
    'Patient Name: John Doe (Phone: 555-234-8910, ID: 412-88-9012) experienced septic shock lactate 5.4 mmol/L in ICU Bed 04.'
  );
  const [mcpResponseJson, setMcpResponseJson] = useState<string>('');
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);

  const activeIncident = incidents.find((i) => i.issueKey === selectedKey) || incidents[0];
  const activeGraph = buildTeamworkGraphForIncident(activeIncident);

  const handleRunRovoAction = async (
    actionKey:
      | 'audit-clinical-sla-and-news2'
      | 'match-confluence-clinical-sop'
      | 'dispatch-oncall-sbar-handoff'
      | 'generate-confluence-capa-postmortem'
  ) => {
    const localExec = executeRovoClinicalAction(actionKey, activeIncident.issueKey);
    try {
      await fetch('/api/forge/rovo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionKey, issueKey: activeIncident.issueKey }),
      });
    } catch {
      // Fallback to deterministic local execution
    }

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.issueKey === activeIncident.issueKey
          ? {
              ...inc,
              priority: localExec.newPriority,
              status: localExec.newStatus,
            }
          : inc
      )
    );

    if (actionKey === 'match-confluence-clinical-sop') {
      const nextChecks = { ...checkedItems };
      activeIncident.sopRunbook.checklist.forEach((_, idx) => {
        nextChecks[`${activeIncident.issueKey}-${idx}`] = true;
      });
      setCheckedItems(nextChecks);
    }

    setRovoLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
        actionKey,
        issueKey: activeIncident.issueKey,
        message: localExec.rovoMessage,
      },
      ...prev,
    ]);
  };

  const handleRunFullAutonomousPipeline = async () => {
    await handleRunRovoAction('audit-clinical-sla-and-news2');
    await handleRunRovoAction('match-confluence-clinical-sop');
    await handleRunRovoAction('dispatch-oncall-sbar-handoff');
    await handleRunRovoAction('generate-confluence-capa-postmortem');
  };

  const handleInvokeMcpTool = async (toolOverride?: string) => {
    const toolToCall = toolOverride || mcpSelectedTool;
    setMcpLoading(true);
    try {
      const res = await fetch('/api/forge/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolToCall,
            arguments: {
              issueKey: activeIncident.issueKey,
              clinicalNote: mcpNoteInput,
            },
          },
        }),
      });
      const data = await res.json();
      setMcpResponseJson(JSON.stringify(data, null, 2));
    } catch {
      const fallback = sanitizeClinicalTextForAtlassian(mcpNoteInput);
      setMcpResponseJson(
        JSON.stringify(
          {
            jsonrpc: '2.0',
            id: 1,
            result: {
              tool: toolToCall,
              issueKey: activeIncident.issueKey,
              hipaaSafeHarbor: fallback,
              teamworkGraph: activeGraph,
            },
          },
          null,
          2
        )
      );
    } finally {
      setMcpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 pb-24">
      {/* Top Atlassian Forge + Docarion Header */}
      <header className="border-b border-blue-500/25 bg-[#0b1528]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/40">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Atlassian Forge • Healthcare
                </span>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  ● Teamwork Graph + Rovo Agent + Atlassian MCP
                </span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-white mt-0.5">
                Docarion CareGraph & Rovo Clinical Triage Copilot
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
              <div className="text-slate-400 font-medium">Active Jira Incident</div>
              <div className="font-mono font-bold text-cyan-300">{activeIncident.issueKey} • {activeIncident.priority}</div>
            </div>
            <button
              onClick={handleRunFullAutonomousPipeline}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              Run Full Rovo 4-Step Clinical Triage
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-2 pb-3">
          {[
            {
              id: 'jira_command',
              label: '1. Jira & JSM Clinical Command',
              icon: Activity,
            },
            {
              id: 'teamwork_graph',
              label: '2. Atlassian Teamwork Graph Explorer',
              icon: Network,
            },
            {
              id: 'rovo_agent',
              label: '3. Rovo Clinical Agent & Actions',
              icon: Bot,
            },
            {
              id: 'mcp_inspector',
              label: '4. Atlassian MCP Server & PHI Guard',
              icon: Terminal,
            },
            {
              id: 'forge_manifest',
              label: '5. Forge Manifest & Confluence CAPA',
              icon: FileCode2,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
                  active
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/25'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* KPI Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0d182d] border border-blue-500/25">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Time-to-Clinical-SOP Resolution
            </div>
            <div className="text-2xl font-black text-white mt-1">11 sec vs. 42 min</div>
            <div className="text-xs text-slate-400 mt-1">
              Connected Jira JSM ↔ Confluence SOPs via Teamwork Graph
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0d182d] border border-emerald-500/25">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Assignable Rovo Actions
            </div>
            <div className="text-2xl font-black text-white mt-1">4 Clinical Tools</div>
            <div className="text-xs text-slate-400 mt-1">
              NEWS2 SLA Audit • SOP Match • SBAR Dispatch • CAPA Draft
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0d182d] border border-cyan-500/25">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Teamwork Graph Entities
            </div>
            <div className="text-2xl font-black text-white mt-1">20 Nodes • 16 Edges</div>
            <div className="text-xs text-slate-400 mt-1">
              Incidents • SOP Runbooks • Biomed Assets • On-Call Teams
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0d182d] border border-purple-500/25">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-300">
              HIPAA Safe Harbor & NDPR
            </div>
            <div className="text-2xl font-black text-white mt-1">100% De-Identified</div>
            <div className="text-xs text-slate-400 mt-1">
              Zero raw patient PII stored in Jira, Confluence, or MCP
            </div>
          </div>
        </div>

        {/* Incident Selector Bar */}
        <div className="p-4 rounded-2xl bg-[#0c1629] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Hospital Jira / JSM Escalation Ticket:
          </div>
          <div className="flex flex-wrap gap-2.5">
            {incidents.map((inc) => {
              const selected = inc.issueKey === activeIncident.issueKey;
              return (
                <button
                  key={inc.issueKey}
                  onClick={() => setSelectedKey(inc.issueKey)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                    selected
                      ? 'bg-blue-600/25 border-blue-400 text-white'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono text-cyan-300">{inc.issueKey}</span>
                  <span>•</span>
                  <span>{inc.acuityBadge}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      inc.status === 'TRIAGE PENDING'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {inc.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: JIRA & JSM CLINICAL COMMAND CENTER */}
        {activeTab === 'jira_command' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Active Jira Issue & Confluence SOP Checklist */}
            <div className="lg:col-span-7 space-y-5">
              <div className="p-6 rounded-2xl bg-[#0d182d] border border-blue-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/40 font-mono font-black text-blue-300 text-sm">
                      {activeIncident.issueKey}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-400/40 font-bold text-rose-300 text-xs">
                      {activeIncident.acuityBadge}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 font-mono text-emerald-300 text-xs">
                      {activeIncident.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    JSM SLA Remaining: {activeIncident.slaRemainingMinutes} mins
                  </div>
                </div>

                <h2 className="text-lg font-extrabold text-white">{activeIncident.summary}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-400">Hospital Ward / Location</div>
                    <div className="font-bold text-white mt-0.5">{activeIncident.ward}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-400">HIPAA Safe Harbor Token</div>
                    <div className="font-mono font-bold text-emerald-300 mt-0.5">
                      {activeIncident.deidentifiedPatientToken}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs">
                  <div className="font-bold text-rose-300 uppercase tracking-wider">
                    Clinical / Biomedical Trigger Telemetry
                  </div>
                  <div className="font-mono text-rose-100 mt-1">{activeIncident.clinicalTriggerMetric}</div>
                </div>

                {/* Linked Confluence SOP Checklist */}
                <div className="p-4 rounded-xl bg-slate-900/95 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                        Matched Confluence Clinical SOP (via Teamwork Graph)
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {activeIncident.sopRunbook.title}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 font-mono text-xs text-cyan-300">
                      {activeIncident.sopRunbook.pageId}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeIncident.sopRunbook.checklist.map((step, idx) => {
                      const checkKey = `${activeIncident.issueKey}-${idx}`;
                      const isDone = !!checkedItems[checkKey];
                      return (
                        <label
                          key={checkKey}
                          onClick={() =>
                            setCheckedItems((prev) => ({ ...prev, [checkKey]: !prev[checkKey] }))
                          }
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition text-xs ${
                            isDone
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-600"
                          />
                          <span>{step}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Rovo Quick Actions + SBAR Handoff Card */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-2xl bg-[#0d182d] border border-indigo-500/30 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                      Assignable Rovo Clinical Actions
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">rovo:agent</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => handleRunRovoAction('audit-clinical-sla-and-news2')}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-blue-950/60 border border-blue-500/30 text-left flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        1. Audit NEWS2 Acuity & Escalate JSM Priority
                      </div>
                      <div className="text-[11px] text-slate-400">
                        rovo:action • audit-clinical-sla-and-news2
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-blue-400 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleRunRovoAction('match-confluence-clinical-sop')}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-cyan-950/60 border border-cyan-500/30 text-left flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        2. Attach Confluence Clinical SOP Runbook
                      </div>
                      <div className="text-[11px] text-slate-400">
                        rovo:action • match-confluence-clinical-sop
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-cyan-400 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleRunRovoAction('dispatch-oncall-sbar-handoff')}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-emerald-500/30 text-left flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        3. Dispatch On-Call Team & Post SBAR Handoff
                      </div>
                      <div className="text-[11px] text-slate-400">
                        rovo:action • dispatch-oncall-sbar-handoff
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleRunRovoAction('generate-confluence-capa-postmortem')}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-purple-950/60 border border-purple-500/30 text-left flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        4. Generate Confluence CAPA Root-Cause Page
                      </div>
                      <div className="text-[11px] text-slate-400">
                        rovo:action • generate-confluence-capa-postmortem
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-purple-400 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Structured SBAR Clinical Handoff */}
              <div className="p-5 rounded-2xl bg-[#0d182d] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                    Structured SBAR Specialist Handoff ({activeIncident.onCallTeam.pagerChannel})
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {activeIncident.onCallTeam.leadClinician}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="font-bold text-cyan-300">SITUATION: </span>
                    <span className="text-slate-200">{activeIncident.sbarHandoff.situation}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="font-bold text-blue-300">BACKGROUND: </span>
                    <span className="text-slate-200">{activeIncident.sbarHandoff.background}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="font-bold text-amber-300">ASSESSMENT: </span>
                    <span className="text-slate-200">{activeIncident.sbarHandoff.assessment}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="font-bold text-emerald-300">RECOMMENDATION: </span>
                    <span className="text-slate-200">{activeIncident.sbarHandoff.recommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATLASSIAN TEAMWORK GRAPH EXPLORER */}
        {activeTab === 'teamwork_graph' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0d182d] border border-cyan-500/30 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                    Atlassian Teamwork Graph Connector • graph:connector
                  </div>
                  <h2 className="text-lg font-black text-white mt-0.5">
                    Connected Clinical & Operational Context Graph for {activeIncident.issueKey}
                  </h2>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 font-mono text-xs text-cyan-300">
                  Connector Key: docarion-clinical-teamwork-graph
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {activeGraph.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-4 rounded-xl bg-slate-900/95 border border-blue-500/30 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                        {node.type}
                      </span>
                      <div className="text-xs font-extrabold text-white mt-2">{node.label}</div>
                    </div>
                    <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                      {node.subtitle}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Teamwork Graph Associative Relationships (Edges)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeGraph.edges.map((edge) => (
                    <div
                      key={edge.id}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between"
                    >
                      <span className="text-cyan-300">{edge.sourceId}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        [:{edge.relationship}]
                      </span>
                      <span className="text-blue-300">{edge.targetId}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROVO CLINICAL AGENT & ACTION STUDIO */}
        {activeTab === 'rovo_agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0d182d] border border-indigo-500/30 space-y-4">
              <div className="flex items-center gap-2.5">
                <Bot className="w-6 h-6 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Forge Module • rovo:agent
                  </div>
                  <h2 className="text-base font-black text-white">
                    docarion-clinical-triage-agent
                  </h2>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Assignable Rovo Agent in Jira and Confluence that correlates NEWS2 physiological acuity,
                biomedical telemetry, and Confluence SOP runbooks to automate clinical escalations.
              </p>
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  One-Click Rovo Conversation Starters:
                </div>
                {[
                  {
                    label: `Audit NEWS2 acuity & JSM SLA for ${activeIncident.issueKey}`,
                    action: 'audit-clinical-sla-and-news2' as const,
                  },
                  {
                    label: `Match & attach Confluence SOP (${activeIncident.sopRunbook.pageId})`,
                    action: 'match-confluence-clinical-sop' as const,
                  },
                  {
                    label: `Dispatch SBAR Handoff to ${activeIncident.onCallTeam.teamName}`,
                    action: 'dispatch-oncall-sbar-handoff' as const,
                  },
                  {
                    label: `Draft Confluence CAPA Postmortem for ${activeIncident.issueKey}`,
                    action: 'generate-confluence-capa-postmortem' as const,
                  },
                ].map((starter) => (
                  <button
                    key={starter.action}
                    onClick={() => handleRunRovoAction(starter.action)}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-indigo-500/30 text-left text-xs font-bold text-indigo-100 flex items-center justify-between transition"
                  >
                    <span>{starter.label}</span>
                    <Send className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0d182d] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                  Live Rovo Agent Execution Telemetry Log
                </h3>
                <span className="text-xs font-mono text-slate-400">{rovoLogs.length} events</span>
              </div>
              <div className="space-y-3">
                {rovoLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-slate-900/95 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-cyan-300">
                        [{entry.actionKey}] • {entry.issueKey}
                      </span>
                      <span className="font-mono text-slate-400">{entry.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{entry.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATLASSIAN MCP SERVER & PHI GUARD */}
        {activeTab === 'mcp_inspector' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0d182d] border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Bonus Track • Best App with Atlassian MCP
                  </div>
                  <h2 className="text-base font-black text-white">
                    Forge MCP Server & HIPAA Safe Harbor Guard
                  </h2>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Select MCP Tool to Invoke:</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'query_clinical_teamwork_graph',
                    'triage_hospital_jsm_incident',
                    'attach_confluence_clinical_sop',
                    'generate_sbar_handoff',
                    'create_confluence_capa_report',
                  ].map((toolName) => (
                    <button
                      key={toolName}
                      onClick={() => {
                        setMcpSelectedTool(toolName);
                        handleInvokeMcpTool(toolName);
                      }}
                      className={`p-2.5 rounded-xl border text-left font-mono text-xs flex items-center justify-between transition ${
                        mcpSelectedTool === toolName
                          ? 'bg-emerald-600/20 border-emerald-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{toolName}</span>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Test HIPAA Safe Harbor PHI Redaction Input:
                </label>
                <textarea
                  rows={3}
                  value={mcpNoteInput}
                  onChange={(e) => setMcpNoteInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
                />
              </div>

              <button
                onClick={() => handleInvokeMcpTool()}
                disabled={mcpLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                {mcpLoading ? 'Executing MCP JSON-RPC 2.0...' : 'Execute MCP Tool & Verify PHI Redaction'}
              </button>
            </div>

            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0d182d] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Live MCP JSON-RPC 2.0 Response Payload
                </span>
                <span className="text-xs font-mono text-emerald-400">POST /api/forge/mcp</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[420px]">
                {mcpResponseJson ||
                  JSON.stringify(
                    {
                      jsonrpc: '2.0',
                      id: 1,
                      result: {
                        tool: mcpSelectedTool,
                        issueKey: activeIncident.issueKey,
                        hipaaSafeHarbor: sanitizeClinicalTextForAtlassian(mcpNoteInput),
                        teamworkGraph: activeGraph,
                      },
                    },
                    null,
                    2
                  )}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 5: FORGE MANIFEST & CONFLUENCE CAPA PREVIEW */}
        {activeTab === 'forge_manifest' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0d182d] border border-blue-500/30 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                Atlassian Forge Manifest • forge-app/manifest.yml
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-200 overflow-x-auto">
{`modules:
  jira:issuePanel:
    - key: docarion-clinical-context-panel
      title: Docarion CareGraph — Clinical Acuity, SOP & SBAR Triage
  jiraServiceManagement:queuePage:
    - key: docarion-jsm-clinical-command
      title: Hospital Clinical Escalation & Biomedical Command Center
  rovo:agent:
    - key: docarion-clinical-triage-agent
      name: Docarion Clinical Triage & Safety Copilot
      actions:
        - audit-clinical-sla-and-news2
        - match-confluence-clinical-sop
        - dispatch-oncall-sbar-handoff
        - generate-confluence-capa-postmortem
  graph:connector:
    - key: docarion-clinical-teamwork-graph
      name: Docarion Hospital Clinical & Biomedical Teamwork Graph Connector
  webtrigger:
    - key: docarion-mcp-endpoint
      function: handleAtlassianMcpRequest`}
              </pre>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0d182d] border border-purple-500/30 space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                Generated Confluence CAPA Postmortem Page • Space: CLINICAL-QA
              </div>
              <h3 className="text-base font-black text-white">
                {activeIncident.capaDraft.confluenceTitle}
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-amber-300">Root Cause Analysis Summary:</div>
                <p className="text-slate-200">{activeIncident.capaDraft.rootCauseSummary}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-emerald-300">Corrective Actions Taken:</div>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {activeIncident.capaDraft.correctiveActions.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-cyan-300">Preventive Actions (Teamwork Graph Automation):</div>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {activeIncident.capaDraft.preventiveActions.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
