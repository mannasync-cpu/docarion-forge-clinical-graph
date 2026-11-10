import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Docarion CareGraph & Rovo Clinical Triage Copilot | Atlassian Forge',
  description:
    'Healthcare Teamwork Graph, Assignable Rovo Clinical Triage Agent, Confluence SOP Runbooks & Atlassian MCP Server built on Atlassian Forge.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-500 selection:text-white">{children}</body>
    </html>
  );
}
