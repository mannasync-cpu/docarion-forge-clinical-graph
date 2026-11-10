import { NextRequest, NextResponse } from 'next/server';
import {
  INITIAL_HOSPITAL_INCIDENTS,
  buildTeamworkGraphForIncident,
  executeRovoClinicalAction,
  sanitizeClinicalTextForAtlassian,
} from '@/lib/caregraph-engine';

export const MCP_TOOL_DEFINITIONS = [
  {
    name: 'query_clinical_teamwork_graph',
    description:
      'Traverse Atlassian Teamwork Graph for linked Jira incidents, Confluence SOP runbooks, biomedical assets, and on-call care teams.',
    inputSchema: {
      type: 'object',
      properties: { issueKey: { type: 'string' } },
      required: ['issueKey'],
    },
  },
  {
    name: 'triage_hospital_jsm_incident',
    description: 'Audit patient NEWS2 acuity & JSM SLA timers and escalate priority to P1 Critical.',
    inputSchema: {
      type: 'object',
      properties: { issueKey: { type: 'string' } },
      required: ['issueKey'],
    },
  },
  {
    name: 'attach_confluence_clinical_sop',
    description: 'Attach the hospital-approved Confluence Clinical SOP checklist to the active Jira incident.',
    inputSchema: {
      type: 'object',
      properties: { issueKey: { type: 'string' } },
      required: ['issueKey'],
    },
  },
  {
    name: 'generate_sbar_handoff',
    description: 'Generate a structured SBAR specialist handoff and dispatch the on-call hospital team.',
    inputSchema: {
      type: 'object',
      properties: { issueKey: { type: 'string' } },
      required: ['issueKey'],
    },
  },
  {
    name: 'create_confluence_capa_report',
    description: 'Create a Confluence CAPA Root-Cause Postmortem page linked in Teamwork Graph.',
    inputSchema: {
      type: 'object',
      properties: { issueKey: { type: 'string' } },
      required: ['issueKey'],
    },
  },
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { jsonrpc = '2.0', id = 1, method = 'tools/list', params = {} } = body;

  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc,
      id,
      result: {
        serverInfo: {
          name: 'docarion-forge-atlassian-mcp',
          version: '1.0.0',
          forgeAppId: 'ari:cloud:ecosystem::app/8f4c9e21-6b14-4d9a-a7c3-2e5b9104d8c2',
        },
        tools: MCP_TOOL_DEFINITIONS,
      },
    });
  }

  const toolName = params.name || method;
  const issueKey = params.arguments?.issueKey || 'HOSP-401';
  const rawNote = params.arguments?.clinicalNote || '';
  const redaction = sanitizeClinicalTextForAtlassian(rawNote);
  const incident =
    INITIAL_HOSPITAL_INCIDENTS.find((i) => i.issueKey === issueKey) || INITIAL_HOSPITAL_INCIDENTS[0];

  if (toolName === 'query_clinical_teamwork_graph') {
    const graph = buildTeamworkGraphForIncident(incident);
    return NextResponse.json({
      jsonrpc,
      id,
      result: {
        tool: toolName,
        issueKey: incident.issueKey,
        hipaaSafeHarbor: redaction,
        teamworkGraph: graph,
      },
    });
  }

  const actionMap: Record<
    string,
    | 'audit-clinical-sla-and-news2'
    | 'match-confluence-clinical-sop'
    | 'dispatch-oncall-sbar-handoff'
    | 'generate-confluence-capa-postmortem'
  > = {
    triage_hospital_jsm_incident: 'audit-clinical-sla-and-news2',
    attach_confluence_clinical_sop: 'match-confluence-clinical-sop',
    generate_sbar_handoff: 'dispatch-oncall-sbar-handoff',
    create_confluence_capa_report: 'generate-confluence-capa-postmortem',
  };

  const mappedAction = actionMap[toolName] || 'audit-clinical-sla-and-news2';
  const execution = executeRovoClinicalAction(mappedAction, issueKey);

  return NextResponse.json({
    jsonrpc,
    id,
    result: {
      tool: toolName,
      hipaaSafeHarbor: redaction,
      execution,
    },
  });
}
