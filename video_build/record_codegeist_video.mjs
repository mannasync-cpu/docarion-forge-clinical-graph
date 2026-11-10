import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const requireFromFrontend = createRequire('/Users/gcole/Applications/docarion/frontend/package.json');
const { chromium } = requireFromFrontend('@playwright/test');

const ROOT_DIR = '/Volumes/External/Hackathons/docarion-forge-clinical-graph';
const OUT_DIR = path.join(ROOT_DIR, 'video_build');
const RAW_VIDEO_DIR = path.join(OUT_DIR, 'raw_video');
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'screenshots');
fs.mkdirSync(RAW_VIDEO_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'codegeist_narration_manifest.json'), 'utf8'));
console.log('Loaded manifest for', manifest.scenes.length, 'scenes. Total audio:', manifest.total_duration, 's');

const SCENE_HUD = [
  {
    badge: 'ATLASSIAN CODEGEIST 2026 • APPS FOR SPECIALIZED INDUSTRIES: HEALTHCARE',
    title: 'Connecting Hospital Jira Incidents, Confluence Clinical SOPs & Biomedical Assets on Forge',
  },
  {
    badge: 'ROVO CLINICAL TRIAGE COPILOT • JIRA SERVICE MANAGEMENT & CONFLUENCE',
    title: '11-Second NEWS2 Acuity Audit, P1 SLA Escalation & Automated Confluence SOP Checklist Attachment',
  },
  {
    badge: 'BEST APPS WITH TEAMWORK GRAPH INTEGRATION • SBAR SPECIALIST HANDOFF',
    title: 'Structured SBAR Clinical Handoff & Associative Teamwork Graph Traversal Across 20 Hospital Nodes',
  },
  {
    badge: 'BEST AGENTS (ROVO) + BEST APP WITH ATLASSIAN MCP • HIPAA SAFE HARBOR',
    title: 'Assignable Rovo Action Studio, Forge MCP JSON-RPC 2.0 Server & Automated PHI Redaction Guard',
  },
  {
    badge: 'CLOSED-LOOP CLINICAL GOVERNANCE • CONFLUENCE CAPA POSTMORTEMS',
    title: 'Automated Confluence Root-Cause & CAPA Postmortem Generation Linked in Teamwork Graph',
  },
];

async function setHud(page, badge, title) {
  await page.evaluate(
    ({ b, t }) => {
      let hud = document.getElementById('codegeist-video-hud');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'codegeist-video-hud';
        hud.style.cssText = [
          'position:fixed',
          'bottom:22px',
          'left:50%',
          'transform:translateX(-50%)',
          'z-index:99999',
          'background:linear-gradient(135deg, rgba(7,13,25,0.96) 0%, rgba(15,32,68,0.96) 100%)',
          'border:1.5px solid rgba(59,130,246,0.65)',
          'border-radius:16px',
          'padding:14px 26px',
          'box-shadow:0 20px 50px rgba(0,0,0,0.85)',
          'display:flex',
          'align-items:center',
          'justify-content:space-between',
          'gap:24px',
          'width:88%',
          'max-width:1420px',
          'backdrop-filter:blur(12px)',
          'pointer-events:none',
        ].join(';');
        document.body.appendChild(hud);
      }
      hud.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:4px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;color:#60a5fa;text-transform:uppercase;">
            ${b}
          </div>
          <div style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.01em;">
            ${t}
          </div>
        </div>
        <div style="padding:7px 16px;border-radius:999px;background:rgba(16,185,129,0.16);border:1px solid rgba(16,185,129,0.45);color:#6ee7b7;font-family:monospace;font-size:13px;font-weight:700;white-space:nowrap;">
          ● Atlassian Forge • Rovo + Teamwork Graph + MCP
        </div>
      `;
    },
    { b: badge, t: title }
  );
}

async function sleepUntil(startWallMs, targetSec) {
  const elapsedSec = (Date.now() - startWallMs) / 1000;
  const remainMs = Math.max(50, (targetSec - elapsedSec) * 1000);
  await new Promise((r) => setTimeout(r, remainMs));
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  }

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: RAW_VIDEO_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  const startWallMs = Date.now();

  await page.goto('http://localhost:3097', { waitUntil: 'networkidle' });

  // Scene 1: Overview & Hospital Command Center
  const s1 = manifest.scenes[0];
  await setHud(page, SCENE_HUD[0].badge, SCENE_HUD[0].title);
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_jira_jsm_clinical_command_center.png') });
  await page.evaluate(() => window.scrollTo({ top: 220, behavior: 'smooth' }));
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleepUntil(startWallMs, s1.end);

  // Scene 2: Run Rovo Action 1 (Audit NEWS2) & Rovo Action 2 (Attach Confluence SOP)
  const s2 = manifest.scenes[1];
  await setHud(page, SCENE_HUD[1].badge, SCENE_HUD[1].title);
  await page.waitForTimeout(2000);
  try {
    await page.locator('button:has-text("1. Audit NEWS2 Acuity & Escalate JSM Priority")').first().click();
  } catch {}
  await page.waitForTimeout(4000);
  try {
    await page.locator('button:has-text("2. Attach Confluence Clinical SOP Runbook")').first().click();
  } catch {}
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_rovo_sop_checklist_attached.png') });
  await sleepUntil(startWallMs, s2.end);

  // Scene 3: Run SBAR Handoff + Switch to Tab 2 (Atlassian Teamwork Graph Explorer)
  const s3 = manifest.scenes[2];
  await setHud(page, SCENE_HUD[2].badge, SCENE_HUD[2].title);
  try {
    await page.locator('button:has-text("3. Dispatch On-Call Team & Post SBAR Handoff")').first().click();
  } catch {}
  await page.waitForTimeout(3500);
  try {
    await page.locator('button:has-text("2. Atlassian Teamwork Graph Explorer")').first().click();
  } catch {}
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_atlassian_teamwork_graph_explorer.png') });
  await sleepUntil(startWallMs, s3.end);

  // Scene 4: Tab 3 (Rovo Agent Studio) & Tab 4 (Atlassian MCP Server & PHI Guard)
  const s4 = manifest.scenes[3];
  await setHud(page, SCENE_HUD[3].badge, SCENE_HUD[3].title);
  try {
    await page.locator('button:has-text("3. Rovo Clinical Agent & Actions")').first().click();
  } catch {}
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_rovo_clinical_agent_studio.png') });
  try {
    await page.locator('button:has-text("4. Atlassian MCP Server & PHI Guard")').first().click();
  } catch {}
  await page.waitForTimeout(2500);
  try {
    await page.locator('button:has-text("Execute MCP Tool & Verify PHI Redaction")').first().click();
  } catch {}
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_atlassian_mcp_server_phi_guard.png') });
  await sleepUntil(startWallMs, s4.end);

  // Scene 5: Tab 5 (Forge Manifest & Confluence CAPA Postmortem)
  const s5 = manifest.scenes[4];
  await setHud(page, SCENE_HUD[4].badge, SCENE_HUD[4].title);
  try {
    await page.locator('button:has-text("5. Forge Manifest & Confluence CAPA")').first().click();
  } catch {}
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_forge_manifest_and_confluence_capa.png') });
  await sleepUntil(startWallMs, s5.end);

  const videoObj = page.video();
  await context.close();
  await browser.close();

  const rawWebmPath = await videoObj.path();
  console.log('Raw Playwright WebM recorded at:', rawWebmPath);

  const masterAudio = path.join(OUT_DIR, 'codegeist_full_narration.mp3');
  const finalMp4 = path.join(ROOT_DIR, 'Docarion_CareGraph_Codegeist2026_Demo.mp4');
  const thumbJpg = path.join(ROOT_DIR, 'Docarion_CareGraph_Thumbnail.jpg');

  execSync(
    `ffmpeg -y -i "${rawWebmPath}" -i "${masterAudio}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest "${finalMp4}"`,
    { stdio: 'inherit' }
  );

  execSync(
    `ffmpeg -y -ss 00:00:08 -i "${finalMp4}" -frames:v 1 -q:v 2 "${thumbJpg}"`,
    { stdio: 'inherit' }
  );

  fs.rmSync(RAW_VIDEO_DIR, { recursive: true, force: true });
  console.log('SUCCESS! Final 1080p MP4 saved to:', finalMp4);
})();
