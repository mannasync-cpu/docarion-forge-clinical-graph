import { describe, it, expect } from 'vitest';
import {
  INITIAL_HOSPITAL_INCIDENTS,
  buildTeamworkGraphForIncident,
  executeRovoClinicalAction,
  sanitizeClinicalTextForAtlassian,
} from '../lib/caregraph-engine';

describe('Docarion CareGraph & Rovo Clinical Triage Copilot — Atlassian Forge Engine', () => {
  it('builds complete Teamwork Graph nodes and associative edges for ICU Sepsis incident HOSP-401', () => {
    const icuIncident = INITIAL_HOSPITAL_INCIDENTS[0];
    const graph = buildTeamworkGraphForIncident(icuIncident);

    expect(graph.nodes).toHaveLength(5);
    expect(graph.edges).toHaveLength(4);
    expect(graph.edges.map((e) => e.relationship)).toEqual([
      'GOVERNED_BY_SOP',
      'TRIGGERED_BY_ASSET',
      'ASSIGNED_TO_TEAM',
      'DOCUMENTED_IN_CAPA',
    ]);
  });

  it('executes all 4 Rovo Clinical Actions deterministically and transitions Jira status', () => {
    const auditRes = executeRovoClinicalAction('audit-clinical-sla-and-news2', 'HOSP-401');
    expect(auditRes.newPriority).toBe('P1 - Critical');

    const sopRes = executeRovoClinicalAction('match-confluence-clinical-sop', 'HOSP-401');
    expect(sopRes.newStatus).toBe('SOP ATTACHED');
    expect(sopRes.checklistAttached?.length).toBeGreaterThanOrEqual(4);

    const sbarRes = executeRovoClinicalAction('dispatch-oncall-sbar-handoff', 'HOSP-401');
    expect(sbarRes.newStatus).toBe('SBAR DISPATCHED');

    const capaRes = executeRovoClinicalAction('generate-confluence-capa-postmortem', 'HOSP-401');
    expect(capaRes.newStatus).toBe('CAPA LINKED');
  });

  it('enforces HIPAA Safe Harbor & NDPR PHI redaction before storing clinical context in Jira/Confluence/MCP', () => {
    const raw =
      'Patient Name: John Doe (Phone: 555-234-8910, ID: 412-88-9012) triggered Lactate 5.4 mmol/L.';
    const sanitized = sanitizeClinicalTextForAtlassian(raw);

    expect(sanitized.hipaaCompliant).toBe(true);
    expect(sanitized.redactionsApplied).toBe(3);
    expect(sanitized.sanitizedText).not.toContain('John Doe');
    expect(sanitized.sanitizedText).not.toContain('555-234-8910');
    expect(sanitized.sanitizedText).not.toContain('412-88-9012');
    expect(sanitized.sanitizedText).toContain('DOC-PT-SAFEHARBOR');
  });
});
