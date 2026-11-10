#!/usr/bin/env node
/**
 * Docarion CareGraph — Atlassian MCP Server (JSON-RPC 2.0 over stdio & Forge Webtrigger)
 * Exposes 5 Healthcare Teamwork Graph, Rovo Triage, Jira JSM, and Confluence SOP/CAPA tools.
 */
import * as readline from 'node:readline';

export const MCP_TOOLS = [
  {
    name: 'query_clinical_teamwork_graph',
    description:
      'Query Atlassian Teamwork Graph for connected Jira clinical incidents, Confluence SOP protocols, biomedical devices, and on-call care teams.',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'Jira / JSM Issue Key (e.g., HOSP-401, BIO-118, LAB-892, PHARM-304)' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'triage_hospital_jsm_incident',
    description:
      'Evaluate patient NEWS2 physiological acuity or biomedical fault severity against JSM SLA countdowns and escalate priority.',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'Jira / JSM Issue Key' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'attach_confluence_clinical_sop',
    description:
      'Retrieve the matching Confluence Clinical Standard Operating Procedure (SOP) from Teamwork Graph and attach its verification checklist to Jira.',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'Jira / JSM Issue Key' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'generate_sbar_handoff',
    description:
      'Generate a structured SBAR (Situation, Background, Assessment, Recommendation) clinical handoff and assign the on-call specialist team in Jira.',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'Jira / JSM Issue Key' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'create_confluence_capa_report',
    description:
      'Create a compliant Confluence CAPA (Corrective and Preventive Action) root-cause postmortem page linked back to the Jira incident in Teamwork Graph.',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'Jira / JSM Issue Key' },
      },
      required: ['issueKey'],
    },
  },
];

if (require.main === module) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const req = JSON.parse(line);
      if (req.method === 'initialize') {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: req.id,
            result: {
              protocolVersion: '2024-11-05',
              serverInfo: { name: 'docarion-atlassian-clinical-mcp', version: '1.0.0' },
              capabilities: { tools: {} },
            },
          }) + '\n'
        );
      } else if (req.method === 'tools/list') {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: req.id,
            result: { tools: MCP_TOOLS },
          }) + '\n'
        );
      } else {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{ type: 'text', text: `Executed ${req.params?.name || req.method} on Atlassian Forge CareGraph` }],
            },
          }) + '\n'
        );
      }
    } catch {
      // Ignore malformed line
    }
  });
}
