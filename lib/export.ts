import type { AnalysisResult } from '@/lib/supabase';

/* ================================================================ */
/*  CSV Export                                                        */
/* ================================================================ */

export function exportCSV(result: AnalysisResult, storeName: string): void {
  const lines: string[] = [];
  const sep = ';';

  lines.push(`SMARTZONES Analyse — ${storeName}`);
  lines.push(`Gegenereerd op ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  lines.push('');
  lines.push('=== OVERZICHT ===');
  lines.push(`Oppervlakte${sep}${result.overview.area_sqm} m²`);
  lines.push(`Zones${sep}${result.overview.zones_count}`);
  lines.push(`Dode zones${sep}${result.overview.dead_zones}`);
  lines.push(`Verwachte groei${sep}${result.overview.growth_potential}`);
  lines.push('');

  lines.push('=== ZONES ===');
  lines.push(`Zone${sep}Type${sep}Oppervlakte${sep}Producten${sep}Problemen`);
  for (const zone of result.zones) {
    lines.push(`${esc(zone.name)}${sep}${esc(zone.type)}${sep}${esc(zone.area)}${sep}${esc((zone.products || []).join(', '))}${sep}${esc((zone.issues || []).join(', '))}`);
  }
  lines.push('');

  if (result.traffic_flow?.dead_zones?.length) {
    lines.push('=== DODE ZONES ===');
    lines.push(`Naam${sep}Reden${sep}Oplossing`);
    for (const dz of result.traffic_flow.dead_zones) {
      lines.push(`${esc(dz.name)}${sep}${esc(dz.reason)}${sep}${esc(dz.solution)}`);
    }
    lines.push('');
  }

  if (result.implementation_plan?.phases?.length) {
    lines.push('=== IMPLEMENTATIEPLAN ===');
    lines.push(`Fase${sep}Stap${sep}Beschrijving${sep}Locatie${sep}Impact`);
    for (const phase of result.implementation_plan.phases) {
      for (const step of phase.steps) {
        lines.push(`${esc(phase.title)}${sep}${esc(step.title)}${sep}${esc(step.description)}${sep}${esc(step.location)}${sep}${esc(step.impact)}`);
      }
    }
    lines.push('');
  }

  if (result.neuromarketing?.activations?.length) {
    lines.push('=== NEUROMARKETING ACTIVATIES ===');
    lines.push(`Zone${sep}Product${sep}Label${sep}Social Proof${sep}Gebruik${sep}Placement`);
    for (const a of result.neuromarketing.activations) {
      lines.push(`${esc(a.zone)}${sep}${esc(a.product_or_category)}${sep}${esc(a.personal_favorite_label)}${sep}${esc(a.social_proof_card)}${sep}${esc(a.usage_context)}${sep}${esc(a.placement_advice)}`);
    }
  }

  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${slugify(storeName)}-smartzones.csv`);
}

/* ================================================================ */
/*  PDF Export — volledig herschreven voor leesbaarheid              */
/* ================================================================ */

export function exportPDF(storeName: string, storeType: string, result: AnalysisResult): void {
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pw - margin * 2;
    const orange = '#E87A2E';
    const dark = '#1A1917';
    const dateStr = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

    // ── Helpers ──────────────────────────────────────────────

    function addFooter(pageLabel = '') {
      doc.setDrawColor('#E87A2E');
      doc.setLineWidth(0.4);
      doc.line(margin, ph - 14, pw - margin, ph - 14);
      doc.setFontSize(7.5);
      doc.setTextColor('#888888');
      doc.text('SMARTZONES — AI Winkeloptimalisatie', margin, ph - 9);
      doc.text(`smartzones.nl${pageLabel ? ' | ' + pageLabel : ''}`, pw - margin, ph - 9, { align: 'right' });
    }

    function newPage(label = '') {
      doc.addPage();
      addFooter(label);
      // Orange accent top
      doc.setFillColor(orange);
      doc.rect(0, 0, pw, 2.5, 'F');
      return margin + 8;
    }

    function ensureSpace(needed: number, y: number, label = ''): number {
      if (y + needed > ph - 22) {
        return newPage(label);
      }
      return y;
    }

    function sectionHeader(text: string, y: number): number {
      doc.setFillColor(dark);
      doc.rect(margin, y - 3, contentW, 9, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#FFFFFF');
      doc.text(text, margin + 4, y + 3);
      return y + 12;
    }

    function subHeader(text: string, color: string, y: number): number {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color);
      doc.text(text, margin, y);
      doc.setDrawColor(color);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 1.5, margin + doc.getTextWidth(text), y + 1.5);
      return y + 8;
    }

    function bulletPoints(items: string[], y: number, color = '#444444', pageLabel = ''): number {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(color);
      for (const item of items) {
        // Bullet points from detailed_instructions (lines starting with •)
        const cleanItem = item.startsWith('• ') ? item : `• ${item}`;
        const lines = doc.splitTextToSize(cleanItem, contentW - 8);
        y = ensureSpace(lines.length * 4.5 + 2, y, pageLabel);
        doc.text(lines, margin + 4, y);
        y += lines.length * 4.5 + 2;
      }
      return y;
    }

    function detailedInstructions(text: string, y: number, pageLabel = ''): number {
      if (!text) return y;
      // Parse bullet points (• prefixed lines)
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const bullets = lines.filter(l => l.startsWith('•') || l.startsWith('-'));
      const prose = lines.filter(l => !l.startsWith('•') && !l.startsWith('-'));

      if (prose.length > 0) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#555555');
        for (const p of prose) {
          const pLines = doc.splitTextToSize(p, contentW - 10);
          y = ensureSpace(pLines.length * 4 + 2, y, pageLabel);
          doc.text(pLines, margin + 6, y);
          y += pLines.length * 4 + 2;
        }
      }

      if (bullets.length > 0) {
        y = bulletPoints(bullets, y, '#333333', pageLabel);
      } else if (lines.length > 0 && bullets.length === 0) {
        // If no bullets, split into pseudo-bullets by sentence
        const sentences = text.split('. ').filter(s => s.trim().length > 5).map(s => s.trim());
        y = bulletPoints(sentences, y, '#444444', pageLabel);
      }

      return y;
    }

    function kpiCard(label: string, value: string, x: number, w: number, y: number, color = orange): void {
      doc.setFillColor('#F8F6F2');
      doc.roundedRect(x, y, w, 14, 2, 2, 'F');
      doc.setDrawColor(color);
      doc.setLineWidth(0.5);
      doc.line(x, y + 14, x + w, y + 14);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#888888');
      doc.text(label, x + 4, y + 5.5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color);
      doc.text(value, x + 4, y + 11.5);
    }

    // ── PAGINA 1: Cover ───────────────────────────────────────
    doc.setFillColor(dark);
    doc.rect(0, 0, pw, ph, 'F');

    // Orange top bar
    doc.setFillColor(orange);
    doc.rect(0, 0, pw, 5, 'F');

    // Logo — SMARTZONES bold uppercase
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#FFFFFF');
    doc.text('SMARTZONES', pw / 2, 70, { align: 'center' });

    // Oranje punt
    doc.setTextColor(orange);
    doc.text('.', pw / 2 + doc.getTextWidth('SMARTZONES') / 2 + 1, 70);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(orange);
    doc.text('Winkeloptimalisatie Rapport', pw / 2, 83, { align: 'center' });

    // Divider
    doc.setDrawColor(orange);
    doc.setLineWidth(0.4);
    doc.line(margin + 20, 92, pw - margin - 20, 92);

    // Store info
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#FFFFFF');
    doc.text(storeName, pw / 2, 108, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#BBBBBB');
    doc.text(storeType, pw / 2, 118, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor('#777777');
    doc.text(dateStr, pw / 2, 132, { align: 'center' });

    // KPI's op cover
    const kpiY = 155;
    const kpiW = (contentW - 6) / 4;
    const kpiColors = [orange, '#4A9EE5', '#E53E3E', '#34A853'];
    const kpis = [
      { label: 'Oppervlakte', value: `${result.overview.area_sqm} m²` },
      { label: 'Zones', value: `${result.overview.zones_count}` },
      { label: 'Dode zones', value: `${result.overview.dead_zones}` },
      { label: 'Groeipotentieel', value: result.overview.growth_potential },
    ];
    doc.setFillColor('#FFFFFF');
    doc.setFillColor(orange);

    for (let i = 0; i < kpis.length; i++) {
      const kx = margin + i * (kpiW + 2);
      doc.setFillColor('#1E1C18');
      doc.roundedRect(kx, kpiY, kpiW, 22, 2, 2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#AAAAAA');
      doc.text(kpis[i].label, kx + kpiW / 2, kpiY + 7, { align: 'center' });
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(kpiColors[i]);
      doc.text(kpis[i].value, kx + kpiW / 2, kpiY + 17, { align: 'center' });
    }

    // Footer cover
    doc.setFontSize(8);
    doc.setTextColor('#555555');
    doc.text('Gegenereerd door SMARTZONES — smartzones.nl', pw / 2, ph - 10, { align: 'center' });

    // ── PAGINA 2: Quick Wins & Implementatieplan ─────────────
    let y = newPage('Implementatieplan');

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dark);
    doc.text('Implementatieplan', margin, y);
    y += 12;

    if (result.implementation_plan?.phases?.length) {
      for (let pi = 0; pi < result.implementation_plan.phases.length; pi++) {
        const phase = result.implementation_plan.phases[pi];
        const phaseColor = phase.color || orange;

        y = ensureSpace(28, y, 'Implementatieplan');

        // Fase header
        doc.setFillColor(phaseColor);
        doc.roundedRect(margin, y - 3, contentW, 11, 2, 2, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#FFFFFF');
        doc.text(`Fase ${pi + 1}   ${phase.title}`, margin + 5, y + 4.5);
        y += 14;

        if (phase.description) {
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor('#666666');
          const descLines = doc.splitTextToSize(phase.description, contentW - 6);
          y = ensureSpace(descLines.length * 4 + 3, y, 'Implementatieplan');
          doc.text(descLines, margin + 3, y);
          y += descLines.length * 4 + 4;
        }

        for (let si = 0; si < phase.steps.length; si++) {
          const step = phase.steps[si];
          y = ensureSpace(18, y, 'Implementatieplan');

          // Step number + title
          doc.setFillColor('#F5F3EE');
          doc.roundedRect(margin, y - 2.5, contentW, 8, 1.5, 1.5, 'F');
          doc.setDrawColor(phaseColor);
          doc.setLineWidth(0.4);
          doc.line(margin, y - 2.5, margin, y + 5.5);

          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(dark);
          doc.text(`${si + 1}.  ${step.title}`, margin + 5, y + 3);

          // Impact badge
          if (step.impact) {
            const impactW = doc.getTextWidth(step.impact) + 6;
            doc.setFillColor(phaseColor);
            doc.roundedRect(pw - margin - impactW, y - 1.5, impactW, 6, 1, 1, 'F');
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#FFFFFF');
            doc.text(step.impact, pw - margin - impactW / 2, y + 2.5, { align: 'center' });
          }
          y += 10;

          // Location
          if (step.location) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor('#888888');
            doc.text(`📍 ${step.location}`, margin + 5, y);
            y += 5.5;
          }

          // Detailed instructions as bullet points
          if (step.detailed_instructions) {
            y = detailedInstructions(step.detailed_instructions, y, 'Implementatieplan');
          }

          y += 4;
        }
        y += 6;
      }
    }

    // ── PAGINA: Dode zones & Klantenstromen ──────────────────
    y = newPage('Zones & Stroom');

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dark);
    doc.text('Winkelzones', margin, y);
    y += 12;

    for (const zone of result.zones) {
      y = ensureSpace(24, y, 'Zones & Stroom');

      // Zone header
      doc.setFillColor('#F0EDE8');
      doc.roundedRect(margin, y - 2.5, contentW, 9, 1.5, 1.5, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(dark);
      doc.text(`${zone.name}`, margin + 4, y + 3.5);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#888888');
      doc.text(`${zone.type} · ${zone.area}`, pw - margin - 2, y + 3.5, { align: 'right' });
      y += 12;

      // Products
      if (zone.products?.length) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(orange);
        doc.text('Producten: ', margin + 4, y);
        doc.setTextColor('#444444');
        const prodText = zone.products.join(' · ');
        const prodLines = doc.splitTextToSize(prodText, contentW - 30);
        doc.text(prodLines, margin + 4 + doc.getTextWidth('Producten: '), y);
        y += prodLines.length * 4.5 + 2;
      }

      // Issues as bullet points
      if (zone.issues?.length) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#E53E3E');
        for (const issue of zone.issues) {
          const issueLines = doc.splitTextToSize(`• ${issue}`, contentW - 10);
          y = ensureSpace(issueLines.length * 4 + 1, y, 'Zones & Stroom');
          doc.text(issueLines, margin + 6, y);
          y += issueLines.length * 4 + 1;
        }
      }
      y += 5;
    }

    // Dead zones section
    if (result.traffic_flow?.dead_zones?.length) {
      y = ensureSpace(20, y, 'Zones & Stroom');
      y = sectionHeader('Dode zones — Gemiste verkoopkansen', y);

      for (const dz of result.traffic_flow.dead_zones) {
        y = ensureSpace(18, y, 'Zones & Stroom');
        doc.setFillColor('#FEF2F2');
        doc.roundedRect(margin, y - 2, contentW, 7, 1.5, 1.5, 'F');
        doc.setDrawColor('#E53E3E');
        doc.setLineWidth(0.4);
        doc.line(margin, y - 2, margin, y + 5);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#C53030');
        doc.text(dz.name, margin + 5, y + 3);
        y += 9;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#555555');
        const reasonLines = doc.splitTextToSize(`• Probleem: ${dz.reason}`, contentW - 10);
        doc.text(reasonLines, margin + 6, y);
        y += reasonLines.length * 4 + 1;

        doc.setTextColor('#276749');
        const solLines = doc.splitTextToSize(`• Oplossing: ${dz.solution}`, contentW - 10);
        doc.text(solLines, margin + 6, y);
        y += solLines.length * 4 + 5;
      }
    }

    // ── PAGINA: Neuromarketing ────────────────────────────────
    if (result.neuromarketing?.activations?.length || result.neuromarketing?.bundle_suggestions?.length) {
      y = newPage('Productbeleving & Neuromarketing');

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(dark);
      doc.text('Productbeleving & Extra Omzetverhogers', margin, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#888888');
      doc.text('Direct uitvoerbare neuromarketing-activaties per zone', margin, y);
      y += 12;

      if (result.neuromarketing?.activations?.length) {
        for (const act of result.neuromarketing.activations) {
          y = ensureSpace(42, y, 'Neuromarketing');

          // Activation card
          doc.setFillColor('#FBF8F3');
          doc.roundedRect(margin, y - 3, contentW, 10, 2, 2, 'F');
          doc.setDrawColor(orange);
          doc.setLineWidth(0.5);
          doc.line(margin, y - 3, margin, y + 7);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(dark);
          doc.text(`${act.zone} — ${act.product_or_category}`, margin + 5, y + 3.5);
          y += 13;

          const items = [
            { label: '🏷️  Label', value: act.personal_favorite_label, color: '#553C9A' },
            { label: '💬  Social proof', value: act.social_proof_card, color: '#276749' },
            { label: '🕐  Gebruiksmoment', value: act.usage_context, color: '#2B6CB0' },
            { label: '⚡  Emotionele hook', value: act.emotional_hook, color: '#C05621' },
            { label: '📍  Placement', value: `${act.placement_advice} — ${act.placement_reason}`, color: '#702459' },
            { label: '🖼️  Display-tip', value: act.display_tip, color: '#2C7A7B' },
            { label: '🧠  Waarom het werkt', value: act.psychological_reason, color: '#744210' },
          ].filter(i => i.value);

          for (const item of items) {
            y = ensureSpace(9, y, 'Neuromarketing');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(item.color);
            doc.text(`${item.label}:  `, margin + 5, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor('#444444');
            const valLines = doc.splitTextToSize(item.value, contentW - 40);
            doc.text(valLines, margin + 5 + doc.getTextWidth(`${item.label}:  `), y);
            y += valLines.length * 4.5;
          }
          y += 8;
        }
      }

      // Bundle suggesties
      if (result.neuromarketing?.bundle_suggestions?.length) {
        y = ensureSpace(20, y, 'Neuromarketing');
        y = sectionHeader('Bundel-suggesties', y);

        for (const bundle of result.neuromarketing.bundle_suggestions) {
          y = ensureSpace(18, y, 'Neuromarketing');
          doc.setFillColor('#EBF8EE');
          doc.roundedRect(margin, y - 2, contentW, 8, 1.5, 1.5, 'F');
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor('#276749');
          doc.text(`${bundle.name}`, margin + 4, y + 3);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor('#444444');
          doc.text(`${bundle.price_suggestion}`, pw - margin - 2, y + 3, { align: 'right' });
          y += 11;

          doc.setFontSize(8);
          doc.setTextColor('#555555');
          doc.text(`• Producten: ${bundle.products.join(' + ')}`, margin + 5, y);
          y += 5;
          doc.text(`• "${bundle.hook}"`, margin + 5, y);
          y += 8;
        }
      }

      // Storytelling
      if (result.neuromarketing?.storytelling_elements?.length) {
        y = ensureSpace(20, y, 'Neuromarketing');
        y = sectionHeader('Storytelling in de winkel', y);

        for (const story of result.neuromarketing.storytelling_elements) {
          y = ensureSpace(18, y, 'Neuromarketing');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor('#553C9A');
          doc.text(`📍 ${story.location} — ${story.format}`, margin + 2, y);
          y += 6;
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor('#555555');
          const storyLines = doc.splitTextToSize(`"${story.story}"`, contentW - 8);
          y = ensureSpace(storyLines.length * 4.5 + 4, y, 'Neuromarketing');
          doc.text(storyLines, margin + 4, y);
          y += storyLines.length * 4.5 + 7;
        }
      }
    }

    addFooter();
    doc.save(`${slugify(storeName)}-smartzones.pdf`);
  });
}

/* ================================================================ */
/*  Helpers                                                           */
/* ================================================================ */

function esc(val: string): string {
  if (!val) return '';
  if (val.includes(';') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
