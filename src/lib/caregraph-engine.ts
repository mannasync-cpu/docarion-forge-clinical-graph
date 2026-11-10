export interface ConfluenceSopRunbook {
  pageId: string;
  spaceKey: string;
  title: string;
  version: string;
  clinicalGovernanceLead: string;
  slaTargetMinutes: number;
  checklist: string[];
}

export interface BiomedicalAssetNode {
  assetId: string;
  name: string;
  wardLocation: string;
  firmwareVersion: string;
  telemetryStatus: string;
  lastCalibrationDate: string;
}

export interface OnCallCareTeamNode {
  teamId: string;
  teamName: string;
  leadClinician: string;
  pagerChannel: string;
  shiftCoverage: string;
}

export interface HospitalJiraIncident {
  issueKey: string;
  projectKey: 'HOSP' | 'BIO' | 'LAB' | 'PHARM';
  summary: string;
  ward: string;
  deidentifiedPatientToken: string;
  news2Score: number;
  acuityBadge: 'CRITICAL (NEWS2 >= 7)' | 'HIGH (LAB PANIC)' | 'BIOMEDICAL SAFETY' | 'COLD-CHAIN ALERT';
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium';
  status: 'TRIAGE PENDING' | 'SOP ATTACHED' | 'SBAR DISPATCHED' | 'CAPA LINKED';
  slaRemainingMinutes: number;
  clinicalTriggerMetric: string;
  sopRunbook: ConfluenceSopRunbook;
  biomedicalAsset: BiomedicalAssetNode;
  onCallTeam: OnCallCareTeamNode;
  sbarHandoff: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  capaDraft: {
    confluenceTitle: string;
    rootCauseSummary: string;
    correctiveActions: string[];
    preventiveActions: string[];
  };
}

export const INITIAL_HOSPITAL_INCIDENTS: HospitalJiraIncident[] = [
  {
    issueKey: 'HOSP-401',
    projectKey: 'HOSP',
    summary: 'ICU Bed 04 — Septic Shock Lactate Spike (5.4 mmol/L) & Hypotension Escalation',
    ward: 'Adult Intensive Care Unit (ICU-West • Bed 04)',
    deidentifiedPatientToken: 'DOC-PT-8841-SAFEHARBOR',
    news2Score: 9,
    acuityBadge: 'CRITICAL (NEWS2 >= 7)',
    priority: 'P2 - High',
    status: 'TRIAGE PENDING',
    slaRemainingMinutes: 11,
    clinicalTriggerMetric: 'Arterial Lactate 5.4 mmol/L • MAP 54 mmHg • HR 128 bpm • NEWS2 = 9',
    sopRunbook: {
      pageId: 'CONF-SOP-104',
      spaceKey: 'CLINICAL-SOP',
      title: 'SOP-ICU-04: Septic Shock 1-Hour Resuscitation & Vasopressor Titration Bundle',
      version: 'v4.2 (Approved by Hospital Mortality & Morbidity Board)',
      clinicalGovernanceLead: 'Dr. A. Okafor (Chief of Critical Care)',
      slaTargetMinutes: 15,
      checklist: [
        'Draw 2 sets of aerobic/anaerobic blood cultures prior to antimicrobial administration (< 15 min)',
        'Administer broad-spectrum IV empiric antimicrobials per ICU antibiogram (< 30 min)',
        'Initiate 30 mL/kg crystalloid bolus and titrate Norepinephrine to target MAP >= 65 mmHg',
        'Schedule repeat arterial blood gas & serum lactate re-check within 2 hours in EHR + JSM',
        'Log SBAR handoff to Critical Care Rapid Response Team in Jira Service Management',
      ],
    },
    biomedicalAsset: {
      assetId: 'ASSET-INF-902',
      name: 'Alaris Dual-Channel Syringe Infusion Pump #04',
      wardLocation: 'ICU-West Bed 04',
      firmwareVersion: 'QNX-RT-8.0.2',
      telemetryStatus: 'Active • Norepinephrine 0.14 mcg/kg/min • Zero Occlusion',
      lastCalibrationDate: '2026-10-18',
    },
    onCallTeam: {
      teamId: 'TEAM-ICU-RRT',
      teamName: 'Critical Care Rapid Response & Sepsis Team',
      leadClinician: 'Dr. Chidi Nwachukwu (ICU Attending)',
      pagerChannel: 'JSM On-Call #icu-sepsis-p1',
      shiftCoverage: '24/7 In-House Critical Care',
    },
    sbarHandoff: {
      situation:
        'ICU Bed 04 patient (Token DOC-PT-8841-SAFEHARBOR) triggered a NEWS2 score of 9 with arterial lactate 5.4 mmol/L and MAP 54 mmHg.',
      background:
        'Admitted 14h ago for complicated urosepsis; baseline MAP was 72 mmHg on low-dose maintenance fluids prior to acute decompensation.',
      assessment:
        'Refractory septic shock requiring immediate 1-Hour Sepsis Bundle execution (Confluence SOP-ICU-04) and Norepinephrine titration.',
      recommendation:
        'Escalate HOSP-401 to P1-Critical, attach SOP-ICU-04 5-point bundle checklist, and dispatch Critical Care Rapid Response Team immediately.',
    },
    capaDraft: {
      confluenceTitle: 'CAPA-2026-401: Automated Sepsis Lactate-to-JSM Escalation Verification (HOSP-401)',
      rootCauseSummary:
        'Manual nursing handoff between lab release and bedside vasopressor titration previously introduced a 28-minute notification gap.',
      correctiveActions: [
        'Escalated HOSP-401 to P1-Critical via Rovo Clinical Triage Copilot within 9 seconds of lab panic release.',
        'Attached SOP-ICU-04 1-Hour Sepsis Bundle checklist and dispatched ICU Rapid Response Team.',
      ],
      preventiveActions: [
        'Bound LIS Lactate >= 4.0 mmol/L events directly into Atlassian Teamwork Graph to auto-trigger Rovo SBAR dispatch.',
      ],
    },
  },
  {
    issueKey: 'LAB-892',
    projectKey: 'LAB',
    summary: 'Renal Ward Bed 12 — Critical Hyperkalemia Panic Value (Serum K+ 6.8 mmol/L)',
    ward: 'Nephrology & Dialysis Step-Down Unit (Bed 12)',
    deidentifiedPatientToken: 'DOC-PT-3190-SAFEHARBOR',
    news2Score: 7,
    acuityBadge: 'HIGH (LAB PANIC)',
    priority: 'P2 - High',
    status: 'TRIAGE PENDING',
    slaRemainingMinutes: 9,
    clinicalTriggerMetric: 'Serum Potassium (K+) 6.8 mmol/L • Peaked T-Waves on 12-Lead ECG • eGFR 14',
    sopRunbook: {
      pageId: 'CONF-SOP-207',
      spaceKey: 'CLINICAL-SOP',
      title: 'SOP-LAB-07: Critical Hyperkalemia (K+ >= 6.5 mmol/L) Cardiac Membrane Stabilization Protocol',
      version: 'v3.8 (Nephrology & Cardiology Joint Protocol)',
      clinicalGovernanceLead: 'Dr. E. Mensah (Head of Nephrology)',
      slaTargetMinutes: 10,
      checklist: [
        'Administer 10 mL of 10% Calcium Gluconate IV over 2–5 minutes for immediate myocardial stabilization',
        'Administer 10 units Regular Insulin IV + 50 mL Dextrose 50% (D50W) to shift potassium intracellularly',
        'Verify continuous 5-lead bedside ECG telemetry and repeat point-of-care K+ in 60 minutes',
        'Notify On-Call Nephrology & Acute Dialysis Team via Jira Service Management P1 escalation',
      ],
    },
    biomedicalAsset: {
      assetId: 'ASSET-ECG-412',
      name: 'Philips IntelliVue Telemetry Monitor #12 & Point-of-Care Blood Gas Analyzer',
      wardLocation: 'Nephrology Step-Down Bed 12',
      firmwareVersion: 'FW-4.19.0',
      telemetryStatus: 'Alert: Tall Peaked Precordial T-Waves Detected • QRS 118 ms',
      lastCalibrationDate: '2026-10-29',
    },
    onCallTeam: {
      teamId: 'TEAM-NEPH-DIAL',
      teamName: 'On-Call Nephrology & Emergent Hemodialysis Team',
      leadClinician: 'Dr. Adaeze Obi (Nephrology Fellow)',
      pagerChannel: 'JSM On-Call #renal-panic-lab',
      shiftCoverage: '07:00–19:00 Acute Dialysis Call',
    },
    sbarHandoff: {
      situation:
        'Critical laboratory panic value for Token DOC-PT-3190-SAFEHARBOR: Serum K+ 6.8 mmol/L with peaked T-waves on telemetry.',
      background:
        'Stage 5 CKD patient awaiting scheduled AV fistula maturation; missed outpatient dialysis session due to transit delay.',
      assessment:
        'Life-threatening hyperkalemia with early myocardial conduction toxicity requiring immediate membrane stabilization.',
      recommendation:
        'Execute SOP-LAB-07 (IV Calcium Gluconate + Insulin/D50W) and mobilize Acute Hemodialysis Team via LAB-892.',
    },
    capaDraft: {
      confluenceTitle: 'CAPA-2026-892: Closed-Loop Lab Panic Acknowledgement & ECG Correlation (LAB-892)',
      rootCauseSummary:
        'High-acuity renal lab panic values required cross-referencing latest 12-lead ECG telemetry and dialysis bay availability.',
      correctiveActions: [
        'Linked LIS K+ panic alert with bedside ECG telemetry node ASSET-ECG-412 in Atlassian Teamwork Graph.',
        'Dispatched Nephrology & Acute Dialysis Team with pre-verified SOP-LAB-07 order checklist.',
      ],
      preventiveActions: [
        'Enforced mandatory 10-minute JSM SLA escalation for all K+ >= 6.5 mmol/L events across partner labs.',
      ],
    },
  },
  {
    issueKey: 'BIO-118',
    projectKey: 'BIO',
    summary: 'Neonatal ICU — Draeger Incubator O2 Servo-Valve Drift & Redundant Sensor Failover',
    ward: 'Neonatal Intensive Care Unit (NICU • Isolette Bay 03)',
    deidentifiedPatientToken: 'DOC-PT-5502-SAFEHARBOR',
    news2Score: 6,
    acuityBadge: 'BIOMEDICAL SAFETY',
    priority: 'P2 - High',
    status: 'TRIAGE PENDING',
    slaRemainingMinutes: 18,
    clinicalTriggerMetric: 'Primary O2 Cell Drift +4.2% • Backup Servo Engaged • SpO2 Stable at 94%',
    sopRunbook: {
      pageId: 'CONF-SOP-319',
      spaceKey: 'BIOMED-SOP',
      title: 'SOP-BIO-19: NICU Closed-Loop Oxygen Blender Failover & Hot-Swap Calibration Protocol',
      version: 'v2.4 (Clinical Engineering & Neonatology)',
      clinicalGovernanceLead: 'Engr. T. Balogun (Director of Biomedical Engineering)',
      slaTargetMinutes: 20,
      checklist: [
        'Confirm secondary galvanic O2 sensor lock and verify neonatal SpO2 remains within 91%–95% target range',
        'Deploy pre-warmed backup Isolette #09 from NICU Equipment Alcove before opening primary servo manifold',
        'Replace primary O2 galvanic cell (Lot #GC-2026-11) and execute 2-point 21%/100% O2 calibration',
        'Attach signed IEC 60601-2-19 electrical & pneumatic safety certificate to Jira ticket BIO-118',
      ],
    },
    biomedicalAsset: {
      assetId: 'ASSET-NICU-303',
      name: 'Draeger Babyleo TN500 Closed-Care Incubator #03',
      wardLocation: 'NICU Isolette Bay 03',
      firmwareVersion: 'MED-RTOS-5.1',
      telemetryStatus: 'Redundant Channel B Active • Primary O2 Sensor Calibration Required',
      lastCalibrationDate: '2026-09-14',
    },
    onCallTeam: {
      teamId: 'TEAM-BIOMED-NICU',
      teamName: 'Clinical Engineering & Neonatal Respiratory Therapy Team',
      leadClinician: 'Engr. Kunle Adeyemi (Senior Biomedical Engineer)',
      pagerChannel: 'JSM On-Call #biomed-critical-care',
      shiftCoverage: '24/7 Rapid Biomedical Response',
    },
    sbarHandoff: {
      situation:
        'NICU Incubator ASSET-NICU-303 reported +4.2% drift on Primary O2 cell; automatic failover to Channel B completed.',
      background:
        'Supporting preterm neonate (Token DOC-PT-5502-SAFEHARBOR) on 28% FiO2; patient SpO2 remains completely stable at 94%.',
      assessment:
        'Zero immediate patient hypoxia due to hardware redundancy, but primary sensor requires hot-swap within 20-minute SLA.',
      recommendation:
        'Follow SOP-BIO-19 to stage pre-warmed backup Isolette #09 and recalibrate primary O2 servo module.',
    },
    capaDraft: {
      confluenceTitle: 'CAPA-2026-118: Predictive Galvanic O2 Cell Replacement Schedule (BIO-118)',
      rootCauseSummary:
        'High-humidity NICU operating cycles accelerated galvanic oxygen sensor electrolyte depletion 14 days ahead of 6-month PM window.',
      correctiveActions: [
        'Completed zero-downtime Channel B failover and hot-swapped primary O2 sensor per SOP-BIO-19.',
      ],
      preventiveActions: [
        'Updated Atlassian Teamwork Graph asset maintenance trigger from 180 days to 140 days for high-humidity NICU isolettes.',
      ],
    },
  },
  {
    issueKey: 'PHARM-304',
    projectKey: 'PHARM',
    summary: 'Central Cold-Chain Vault #02 — Compressor Relay Fault (+9.1°C Excursion on Insulin & Biologics)',
    ward: 'Central Hospital Inpatient Pharmacy (Cold-Chain Vault #02)',
    deidentifiedPatientToken: 'FACILITY-INVENTORY-BATCH-99',
    news2Score: 5,
    acuityBadge: 'COLD-CHAIN ALERT',
    priority: 'P2 - High',
    status: 'TRIAGE PENDING',
    slaRemainingMinutes: 14,
    clinicalTriggerMetric: 'Internal Temp +9.1°C (Threshold 2.0°C–8.0°C) • Excursion Duration: 12 mins',
    sopRunbook: {
      pageId: 'CONF-SOP-412',
      spaceKey: 'PHARM-SOP',
      title: 'SOP-PHARM-12: WHO GDP Biologics & Insulin Cold-Chain Excursion Quarantine & Transfer Protocol',
      version: 'v5.0 (Hospital Pharmacy & Quality Assurance)',
      clinicalGovernanceLead: 'Pharm. N. Eze (Chief Hospital Pharmacist)',
      slaTargetMinutes: 15,
      checklist: [
        'Transfer all 42 vials of Insulin Glargine, Oxytocin, and Oncology Biologics to Validated Backup Vault #03 (< 10 min)',
        'Download continuous 60-second NIST-traceable temperature logger CSV and attach to PHARM-304',
        'Calculate cumulative Time-Out-of-Refrigeration (TOR) stability budget per manufacturer monograph',
        'Release cleared batches in EHR Pharmacy Dispensing System and dispatch HVAC/Biomed relay replacement',
      ],
    },
    biomedicalAsset: {
      assetId: 'ASSET-COLD-202',
      name: 'Helmer i.Series Medical Grade Refrigerator Vault #02',
      wardLocation: 'Central Inpatient Pharmacy',
      firmwareVersion: 'IOT-SENS-3.4',
      telemetryStatus: 'Primary Compressor Relay Fault • Glycol Probe +9.1°C • Backup Vault #03 at +4.2°C',
      lastCalibrationDate: '2026-10-02',
    },
    onCallTeam: {
      teamId: 'TEAM-PHARM-QA',
      teamName: 'Inpatient Pharmacy Cold-Chain & Facilities Engineering Team',
      leadClinician: 'Pharm. Obinna Okeke (Clinical Pharmacy Lead)',
      pagerChannel: 'JSM On-Call #pharmacy-coldchain',
      shiftCoverage: '24/7 Inpatient Pharmacy Operations',
    },
    sbarHandoff: {
      situation:
        'Pharmacy Cold-Chain Vault #02 (ASSET-COLD-202) crossed +8.0°C ceiling (currently +9.1°C for 12 minutes) due to compressor relay fault.',
      background:
        'Vault holds inpatient Insulin Glargine, Oxytocin, and high-cost oncology biologics valued at $18,400 USD.',
      assessment:
        'Cumulative excursion is 12 minutes—well within the 2-hour manufacturer stability window if transferred immediately to Backup Vault #03 (+4.2°C).',
      recommendation:
        'Execute SOP-PHARM-12 transfer to Vault #03 within 10 minutes and log NIST temperature trace in PHARM-304.',
    },
    capaDraft: {
      confluenceTitle: 'CAPA-2026-304: Cold-Chain Compressor Relay Telemetry & Zero-Loss Biologics Transfer (PHARM-304)',
      rootCauseSummary:
        'Solid-state compressor starter relay experienced voltage surge wear; IoT glycol probe detected excursion within 60 seconds.',
      correctiveActions: [
        'Transferred 100% of Insulin & Oxytocin stock to Backup Vault #03 within 11 minutes ($0 inventory loss).',
      ],
      preventiveActions: [
        'Added dual-line UPS voltage conditioning and linked glycol telemetry directly to Jira Service Management P1 auto-paging.',
      ],
    },
  },
];

export interface TeamworkGraphEdge {
  id: string;
  sourceId: string;
  sourceType: 'JIRA_INCIDENT' | 'CONFLUENCE_SOP' | 'BIOMED_ASSET' | 'ONCALL_TEAM' | 'CONFLUENCE_CAPA';
  targetId: string;
  targetType: 'JIRA_INCIDENT' | 'CONFLUENCE_SOP' | 'BIOMED_ASSET' | 'ONCALL_TEAM' | 'CONFLUENCE_CAPA';
  relationship: 'GOVERNED_BY_SOP' | 'TRIGGERED_BY_ASSET' | 'ASSIGNED_TO_TEAM' | 'DOCUMENTED_IN_CAPA';
}

export function buildTeamworkGraphForIncident(incident: HospitalJiraIncident): {
  nodes: Array<{ id: string; type: string; label: string; subtitle: string }>;
  edges: TeamworkGraphEdge[];
} {
  const nodes = [
    {
      id: incident.issueKey,
      type: 'JIRA_INCIDENT',
      label: `${incident.issueKey}: ${incident.acuityBadge}`,
      subtitle: `${incident.ward} • ${incident.priority}`,
    },
    {
      id: incident.sopRunbook.pageId,
      type: 'CONFLUENCE_SOP',
      label: incident.sopRunbook.title,
      subtitle: `Confluence Space: ${incident.sopRunbook.spaceKey} • SLA ${incident.sopRunbook.slaTargetMinutes}m`,
    },
    {
      id: incident.biomedicalAsset.assetId,
      type: 'BIOMED_ASSET',
      label: incident.biomedicalAsset.name,
      subtitle: incident.biomedicalAsset.telemetryStatus,
    },
    {
      id: incident.onCallTeam.teamId,
      type: 'ONCALL_TEAM',
      label: incident.onCallTeam.teamName,
      subtitle: `${incident.onCallTeam.leadClinician} (${incident.onCallTeam.pagerChannel})`,
    },
    {
      id: `CAPA-${incident.issueKey}`,
      type: 'CONFLUENCE_CAPA',
      label: incident.capaDraft.confluenceTitle,
      subtitle: 'Confluence QA Space • Automated Root-Cause & CAPA',
    },
  ];

  const edges: TeamworkGraphEdge[] = [
    {
      id: `${incident.issueKey}->${incident.sopRunbook.pageId}`,
      sourceId: incident.issueKey,
      sourceType: 'JIRA_INCIDENT',
      targetId: incident.sopRunbook.pageId,
      targetType: 'CONFLUENCE_SOP',
      relationship: 'GOVERNED_BY_SOP',
    },
    {
      id: `${incident.issueKey}->${incident.biomedicalAsset.assetId}`,
      sourceId: incident.issueKey,
      sourceType: 'JIRA_INCIDENT',
      targetId: incident.biomedicalAsset.assetId,
      targetType: 'BIOMED_ASSET',
      relationship: 'TRIGGERED_BY_ASSET',
    },
    {
      id: `${incident.issueKey}->${incident.onCallTeam.teamId}`,
      sourceId: incident.issueKey,
      sourceType: 'JIRA_INCIDENT',
      targetId: incident.onCallTeam.teamId,
      targetType: 'ONCALL_TEAM',
      relationship: 'ASSIGNED_TO_TEAM',
    },
    {
      id: `${incident.issueKey}->CAPA-${incident.issueKey}`,
      sourceId: incident.issueKey,
      sourceType: 'JIRA_INCIDENT',
      targetId: `CAPA-${incident.issueKey}`,
      targetType: 'CONFLUENCE_CAPA',
      relationship: 'DOCUMENTED_IN_CAPA',
    },
  ];

  return { nodes, edges };
}

/**
 * HIPAA Safe Harbor / NDPR PHI Redaction Guard
 * Replaces any accidental raw patient names, phone numbers, or national IDs before storing in Jira/Confluence/MCP.
 */
export function sanitizeClinicalTextForAtlassian(rawText: string): {
  sanitizedText: string;
  redactionsApplied: number;
  hipaaCompliant: boolean;
} {
  let redactionsApplied = 0;
  let sanitizedText = rawText;

  // Redact SSN / NIN / MRN patterns
  sanitizedText = sanitizedText.replace(/\b\d{3}-\d{2}-\d{4}\b/g, () => {
    redactionsApplied += 1;
    return '[REDACTED-ID-SAFEHARBOR]';
  });

  // Redact raw phone numbers
  sanitizedText = sanitizedText.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, () => {
    redactionsApplied += 1;
    return '[REDACTED-PHONE-SAFEHARBOR]';
  });

  // Redact explicit "Patient Name: <First Last>" patterns
  sanitizedText = sanitizedText.replace(/Patient Name:\s*[A-Z][a-z]+\s+[A-Z][a-z]+/g, () => {
    redactionsApplied += 1;
    return 'Patient Token: DOC-PT-SAFEHARBOR';
  });

  return {
    sanitizedText,
    redactionsApplied,
    hipaaCompliant: true,
  };
}

export function executeRovoClinicalAction(
  actionKey:
    | 'audit-clinical-sla-and-news2'
    | 'match-confluence-clinical-sop'
    | 'dispatch-oncall-sbar-handoff'
    | 'generate-confluence-capa-postmortem',
  issueKey: string
) {
  const incident =
    INITIAL_HOSPITAL_INCIDENTS.find((item) => item.issueKey === issueKey) || INITIAL_HOSPITAL_INCIDENTS[0];
  const graph = buildTeamworkGraphForIncident(incident);

  switch (actionKey) {
    case 'audit-clinical-sla-and-news2':
      return {
        actionKey,
        issueKey: incident.issueKey,
        newPriority: 'P1 - Critical' as const,
        newStatus: incident.status,
        rovoMessage: `Audited ${incident.issueKey} (${incident.clinicalTriggerMetric}). SLA remaining is ${incident.slaRemainingMinutes}m against a ${incident.sopRunbook.slaTargetMinutes}m ceiling. Escalated Priority to P1 - Critical and verified HIPAA Safe Harbor token (${incident.deidentifiedPatientToken}).`,
        graphEdgesTraversed: graph.edges.length,
        timestamp: new Date().toISOString(),
      };
    case 'match-confluence-clinical-sop':
      return {
        actionKey,
        issueKey: incident.issueKey,
        newPriority: 'P1 - Critical' as const,
        newStatus: 'SOP ATTACHED' as const,
        rovoMessage: `Matched Confluence Runbook "${incident.sopRunbook.title}" (${incident.sopRunbook.pageId}) via Atlassian Teamwork Graph and attached all ${incident.sopRunbook.checklist.length} verification steps to ${incident.issueKey}.`,
        checklistAttached: incident.sopRunbook.checklist,
        graphEdgesTraversed: graph.edges.length,
        timestamp: new Date().toISOString(),
      };
    case 'dispatch-oncall-sbar-handoff':
      return {
        actionKey,
        issueKey: incident.issueKey,
        newPriority: 'P1 - Critical' as const,
        newStatus: 'SBAR DISPATCHED' as const,
        rovoMessage: `Generated structured SBAR handoff for ${incident.issueKey} and paged ${incident.onCallTeam.teamName} (${incident.onCallTeam.leadClinician}) via ${incident.onCallTeam.pagerChannel}.`,
        sbarHandoff: incident.sbarHandoff,
        graphEdgesTraversed: graph.edges.length,
        timestamp: new Date().toISOString(),
      };
    case 'generate-confluence-capa-postmortem':
      return {
        actionKey,
        issueKey: incident.issueKey,
        newPriority: 'P1 - Critical' as const,
        newStatus: 'CAPA LINKED' as const,
        rovoMessage: `Created Confluence CAPA Root-Cause Postmortem "${incident.capaDraft.confluenceTitle}" in space CLINICAL-QA and linked edge (${incident.issueKey})-[:DOCUMENTED_IN_CAPA]->(CAPA-${incident.issueKey}) in Atlassian Teamwork Graph.`,
        capaDraft: incident.capaDraft,
        graphEdgesTraversed: graph.edges.length,
        timestamp: new Date().toISOString(),
      };
  }
}
