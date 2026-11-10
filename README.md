# Docarion CareGraph & Rovo Clinical Triage Copilot for Atlassian Forge

Built for **Atlassian Codegeist 2026: Build with context. Ship with confidence.**
- **Primary Category:** Apps for Specialized Industries (**Healthcare**)
- **Bonus Prizes Targeted:**
  1. **Best Agents — Rovo / Assignable Agents** (`rovo:agent` + 4 reusable `action` modules)
  2. **Best App with Atlassian MCP** (`webtrigger` MCP JSON-RPC 2.0 endpoint + `forge-app/mcp-server/index.ts`)
  3. **Best Apps with Teamwork Graph Integration** (`graph:connector` linking Hospital Jira/JSM Incidents ↔ Confluence Clinical SOP Runbooks ↔ Biomedical Assets ↔ On-Call Specialist Teams ↔ CAPA Postmortems)

---

## Overview

In hospitals and multi-site clinics, critical laboratory panic alerts (`K+ 6.8 mmol/L`, `Lactate 5.4 mmol/L`), NICU biomedical equipment failovers, and pharmacy cold-chain excursions are tracked in **Jira Service Management (JSM)** and **Jira**, while clinical Standard Operating Procedures (SOPs) and CAPA postmortems live in **Confluence**.

**Docarion CareGraph** connects these clinical and operational silos on **Atlassian Forge** using **Teamwork Graph**, **Assignable Rovo Clinical Agents**, and an **Atlassian MCP Server** with automatic **HIPAA Safe Harbor & NDPR PHI Redaction**.

---

## Repository Structure

- `forge-app/manifest.yml` — Atlassian Forge manifest declaring `jira:issuePanel`, `jiraServiceManagement:queuePage`, `confluence:contentBylineItem`, `rovo:agent`, 4 `action` modules, `graph:connector`, and `webtrigger`.
- `forge-app/src/index.ts` — Forge backend resolvers (`@forge/resolver`, `@forge/api` `requestJira` & `requestConfluence`), Rovo action handlers, Teamwork Graph ingestion connector, and MCP webtrigger handler.
- `forge-app/mcp-server/index.ts` — Model Context Protocol (MCP) server exposing 5 healthcare tools (`query_clinical_teamwork_graph`, `triage_hospital_jsm_incident`, `attach_confluence_clinical_sop`, `generate_sbar_handoff`, `create_confluence_capa_report`).
- `src/` — Interactive Next.js 14 + TypeScript Custom UI Workbench & Simulator for evaluating Jira/JSM Clinical Triage, Teamwork Graph visualization, Rovo Agent actions, and live MCP JSON-RPC 2.0 inspection.

---

## Quick Start & Verification

```bash
npm install
npm run typecheck
npm test
npm run dev
# Open http://localhost:3097
```
