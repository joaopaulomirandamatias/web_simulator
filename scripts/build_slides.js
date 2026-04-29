// Gera a apresentação AHCF-CPS em .pptx
// Paleta alinhada ao web simulator (industrial navy + accent blue).
// Motif visual: barra lateral esquerda azul, número do slide em badge no canto superior direito.

const path = require('path');
const PptxGenJS = require('pptxgenjs');

const OUT = path.join(
  'C:',
  'Users',
  'DETRAN',
  'Documents',
  'JOAO PAULO',
  'Mestrado',
  'Disciplinas',
  'PEA5733 - Automação e Sociedade (2026)',
  'Apresentação dos artigos',
  'AHCF_CPS_Apresentacao.pptx',
);

const SCRIPTS_DIR = __dirname;
const FORMULA_PNG = path.join(SCRIPTS_DIR, 'formula.png');
const FORMULA_ARGMAX_PNG = path.join(SCRIPTS_DIR, 'formula_argmax.png');

const COLORS = {
  primary: '0F172A',    // navy dark
  accent: '2563EB',     // blue accent
  accentSoft: '3B82F6', // lighter blue
  success: '16A34A',
  warning: 'F59E0B',
  danger: 'DC2626',
  bg: 'FFFFFF',
  bgMuted: 'F8FAFC',
  text: '0F172A',
  textMuted: '64748B',
  border: 'E2E8F0',
};

const FONT = 'Arial';

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 inches (16:9)
pres.author = 'João Paulo Matias';
pres.company = 'USP — Escola Politécnica';
pres.title = 'AHCF-CPS — PEA5733 2026';

const W = 13.333;
const H = 7.5;

function addChrome(slide, { index, total }) {
  // barra lateral esquerda (motif)
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.25,
    h: H,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  // barra fina superior
  slide.addShape(pres.ShapeType.rect, {
    x: 0.25,
    y: 0,
    w: W - 0.25,
    h: 0.08,
    fill: { color: COLORS.primary },
    line: { type: 'none' },
  });
  // rodapé: nome + paginação
  slide.addText('AHCF-CPS · PEA5733 2026', {
    x: 0.5,
    y: H - 0.35,
    w: 5,
    h: 0.3,
    fontFace: FONT,
    fontSize: 10,
    color: COLORS.textMuted,
    bold: false,
    align: 'left',
  });
  slide.addText(`${index} / ${total}`, {
    x: W - 1.2,
    y: H - 0.35,
    w: 0.7,
    h: 0.3,
    fontFace: FONT,
    fontSize: 10,
    color: COLORS.textMuted,
    align: 'right',
  });
}

function addTitle(slide, title) {
  slide.addText(title, {
    x: 0.6,
    y: 0.4,
    w: W - 1.2,
    h: 0.9,
    fontFace: FONT,
    fontSize: 30,
    bold: true,
    color: COLORS.primary,
    align: 'left',
    valign: 'top',
  });
  // accent underline curtinho no canto inferior-esquerdo do título
  slide.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 1.3,
    w: 0.9,
    h: 0.05,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
}

function addBullets(slide, items, { x = 0.8, y = 1.6, w = 11.9, h = 5.0, fontSize = 18 } = {}) {
  slide.addText(
    items.map((item) => {
      if (typeof item === 'string') {
        return { text: item, options: { bullet: { code: '25A0' }, color: COLORS.text, fontSize } };
      }
      return {
        text: item.text,
        options: {
          bullet: { code: '25A0' },
          color: item.muted ? COLORS.textMuted : COLORS.text,
          fontSize,
          bold: !!item.bold,
        },
      };
    }),
    {
      x,
      y,
      w,
      h,
      fontFace: FONT,
      paraSpaceAfter: 8,
      valign: 'top',
    },
  );
}

function addCitationHint(slide, text) {
  slide.addText(text, {
    x: 0.6,
    y: H - 0.75,
    w: W - 1.2,
    h: 0.35,
    fontFace: FONT,
    fontSize: 11,
    italic: true,
    color: COLORS.textMuted,
    align: 'left',
  });
}

const TOTAL = 18;

// -----------------------------------------------------------------------------
// 1. Capa
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.primary };
  // Barra lateral ainda mais grossa + accent
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.4,
    h: H,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText('AHCF-CPS', {
    x: 1.2,
    y: 1.4,
    w: 11,
    h: 0.6,
    fontFace: FONT,
    fontSize: 18,
    bold: true,
    color: COLORS.accentSoft,
    charSpacing: 4,
  });
  s.addText('Adaptive Human-Centered Framework for Cobot Programming Selection', {
    x: 1.2,
    y: 2.1,
    w: 11,
    h: 1.8,
    fontFace: FONT,
    fontSize: 40,
    bold: true,
    color: 'FFFFFF',
    valign: 'top',
  });
  s.addText(
    'Um framework multicritério para seleção de métodos de programação de robôs colaborativos em Human-Robot Collaboration industrial.',
    {
      x: 1.2,
      y: 4.0,
      w: 10.5,
      h: 1.0,
      fontFace: FONT,
      fontSize: 18,
      italic: true,
      color: 'CBD5E1',
      valign: 'top',
    },
  );
  // divisor
  s.addShape(pres.ShapeType.rect, {
    x: 1.2,
    y: 5.3,
    w: 3,
    h: 0.04,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText(
    [
      { text: 'João Paulo Matias', options: { bold: true, color: 'FFFFFF', fontSize: 18 } },
      { text: '  ·  joaopaulomirandamatias@gmail.com', options: { color: 'CBD5E1', fontSize: 14 } },
    ],
    { x: 1.2, y: 5.5, w: 11, h: 0.4, fontFace: FONT },
  );
  s.addText('Universidade de São Paulo — Escola Politécnica', {
    x: 1.2,
    y: 6.0,
    w: 11,
    h: 0.35,
    fontFace: FONT,
    fontSize: 14,
    color: 'CBD5E1',
  });
  s.addText('PEA5733 — Automação e Sociedade (2026)', {
    x: 1.2,
    y: 6.4,
    w: 11,
    h: 0.35,
    fontFace: FONT,
    fontSize: 14,
    color: '94A3B8',
  });
}

// -----------------------------------------------------------------------------
// 2. Problema
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 2, total: TOTAL });
  addTitle(s, 'O problema');
  // callout grande
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 1.7,
    w: W - 1.2,
    h: 1.2,
    fill: { color: COLORS.bgMuted },
    line: { color: COLORS.accent, width: 0, type: 'none' },
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 1.7,
    w: 0.08,
    h: 1.2,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText(
    'A escolha do método de programação de cobots ainda é empírica e fragmentada.',
    {
      x: 0.9,
      y: 1.8,
      w: W - 1.8,
      h: 1.0,
      fontFace: FONT,
      fontSize: 22,
      italic: true,
      color: COLORS.primary,
      valign: 'middle',
    },
  );
  addBullets(s, [
    'Decisão baseada em disponibilidade de fabricante ou preferência do integrador',
    'Fatores humanos — confiança, ergonomia, carga cognitiva — negligenciados',
    'Literatura foca em uma dimensão por vez: segurança, ergonomia, IA ou UX',
    'PMEs carecem de critério formal para implantação colaborativa',
  ], { y: 3.2, h: 3.5 });
}

// -----------------------------------------------------------------------------
// 3. Questões de pesquisa
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 3, total: TOTAL });
  addTitle(s, 'Questões de pesquisa');
  const cardY = 1.9;
  const cardH = 1.5;
  const cardGap = 0.25;
  const cards = [
    {
      tag: 'RQ1',
      text: 'Quais métodos de programação de cobots existem na literatura recente e como organizá-los em taxonomia?',
    },
    {
      tag: 'RQ2',
      text: 'Quais fatores contextuais e construtos humano-robô influenciam a escolha do método em ambientes reais?',
    },
    {
      tag: 'RQ3',
      text: 'É possível estruturar um framework formal e operacionalizável que integre essas variáveis?',
    },
  ];
  cards.forEach((c, i) => {
    const y = cardY + i * (cardH + cardGap);
    s.addShape(pres.ShapeType.rect, {
      x: 0.6,
      y,
      w: W - 1.2,
      h: cardH,
      fill: { color: COLORS.bgMuted },
      line: { color: COLORS.border, width: 0.75 },
    });
    s.addShape(pres.ShapeType.rect, {
      x: 0.6,
      y,
      w: 1.2,
      h: cardH,
      fill: { color: COLORS.primary },
      line: { type: 'none' },
    });
    s.addText(c.tag, {
      x: 0.6,
      y,
      w: 1.2,
      h: cardH,
      fontFace: FONT,
      fontSize: 28,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
    s.addText(c.text, {
      x: 2.0,
      y: y + 0.1,
      w: W - 2.6,
      h: cardH - 0.2,
      fontFace: FONT,
      fontSize: 17,
      color: COLORS.text,
      valign: 'middle',
    });
  });
}

// -----------------------------------------------------------------------------
// 4. Método — PRISMA
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 4, total: TOTAL });
  addTitle(s, 'Método — Revisão Sistemática da Literatura (PRISMA)');
  // 4 etapas em cards horizontais com seta
  const stages = [
    { num: '238', label: 'Identificação', sub: 'Scopus, Web of Science,\nIEEE, ScienceDirect, Springer' },
    { num: '187', label: 'Únicos', sub: 'Após remoção de\nduplicidades' },
    { num: '63', label: 'Triagem', sub: 'Título, resumo e\naderência temática' },
    { num: '28', label: 'Incluídos', sub: 'Leitura integral +\ncritérios PRISMA' },
  ];
  const cardW = 2.8;
  const startX = 0.6;
  const gap = 0.15;
  const cardY = 2.2;
  stages.forEach((st, i) => {
    const x = startX + i * (cardW + gap);
    s.addShape(pres.ShapeType.rect, {
      x,
      y: cardY,
      w: cardW,
      h: 3.2,
      fill: { color: i === stages.length - 1 ? COLORS.accent : COLORS.bgMuted },
      line: { color: COLORS.border, width: 0.75 },
    });
    const textColor = i === stages.length - 1 ? 'FFFFFF' : COLORS.primary;
    const subColor = i === stages.length - 1 ? 'DBEAFE' : COLORS.textMuted;
    s.addText(st.num, {
      x,
      y: cardY + 0.3,
      w: cardW,
      h: 1.4,
      fontFace: FONT,
      fontSize: 60,
      bold: true,
      color: textColor,
      align: 'center',
      valign: 'middle',
    });
    s.addText(st.label, {
      x,
      y: cardY + 1.8,
      w: cardW,
      h: 0.4,
      fontFace: FONT,
      fontSize: 16,
      bold: true,
      color: textColor,
      align: 'center',
    });
    s.addText(st.sub, {
      x,
      y: cardY + 2.3,
      w: cardW,
      h: 0.8,
      fontFace: FONT,
      fontSize: 11,
      color: subColor,
      align: 'center',
    });
    if (i < stages.length - 1) {
      // seta
      s.addText('▶', {
        x: x + cardW + 0.01,
        y: cardY + 1.3,
        w: 0.18,
        h: 0.6,
        fontFace: FONT,
        fontSize: 24,
        color: COLORS.accent,
        align: 'center',
        valign: 'middle',
      });
    }
  });
  addCitationHint(s, 'Período 2019–2026; busca complementar por snowballing.');
}

// -----------------------------------------------------------------------------
// 5. Taxonomia dos métodos (6 classes)
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 5, total: TOTAL });
  addTitle(s, 'Taxonomia dos métodos de programação (RQ1)');
  const classes = [
    {
      num: '1',
      title: 'Convencional / offline',
      ref: 'El Zaatari et al. (2019)',
    },
    {
      num: '2',
      title: 'Parametrizada',
      ref: 'Giberti et al. (2022); Wolffgramm et al. (2024)',
    },
    {
      num: '3',
      title: 'Programming by Demonstration',
      ref: 'Arrais et al. (2021); Al-Yacoub et al. (2021)',
    },
    {
      num: '4',
      title: 'Ensino cinestésico multimodal',
      ref: 'Meattini et al. (2025)',
    },
    {
      num: '5',
      title: 'Interfaces imersivas (XR / AR / gestos)',
      ref: 'Chan et al. (2022); Angleraud et al. (2021); Nguyen et al. (2026)',
    },
    {
      num: '6',
      title: 'Shared control / planejamento adaptativo',
      ref: 'Bagheri et al. (2022); Noormohammadi-Asl et al. (2025)',
    },
  ];
  const rowH = 0.75;
  const rowY = 1.8;
  classes.forEach((c, i) => {
    const y = rowY + i * (rowH + 0.1);
    s.addShape(pres.ShapeType.rect, {
      x: 0.6,
      y,
      w: W - 1.2,
      h: rowH,
      fill: { color: i % 2 === 0 ? COLORS.bgMuted : 'FFFFFF' },
      line: { color: COLORS.border, width: 0.5 },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: 0.75,
      y: y + 0.12,
      w: 0.5,
      h: 0.5,
      fill: { color: COLORS.accent },
      line: { type: 'none' },
    });
    s.addText(c.num, {
      x: 0.75,
      y: y + 0.12,
      w: 0.5,
      h: 0.5,
      fontFace: FONT,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
    s.addText(c.title, {
      x: 1.4,
      y: y + 0.08,
      w: 6.8,
      h: rowH - 0.16,
      fontFace: FONT,
      fontSize: 16,
      bold: true,
      color: COLORS.primary,
      valign: 'middle',
    });
    s.addText(c.ref, {
      x: 8.2,
      y: y + 0.08,
      w: W - 8.8,
      h: rowH - 0.16,
      fontFace: FONT,
      fontSize: 11,
      italic: true,
      color: COLORS.textMuted,
      valign: 'middle',
    });
  });
}

// -----------------------------------------------------------------------------
// 6. Fatores determinantes — 5 dimensões
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 6, total: TOTAL });
  addTitle(s, 'Fatores determinantes da escolha (RQ2)');
  s.addText('A literatura converge para cinco dimensões decisórias recorrentes.', {
    x: 0.6,
    y: 1.55,
    w: W - 1.2,
    h: 0.4,
    fontFace: FONT,
    fontSize: 14,
    italic: true,
    color: COLORS.textMuted,
  });
  const dims = [
    { label: 'Safety', desc: 'Risco operacional, ISO 10218 / TS 15066', color: COLORS.danger },
    { label: 'Ergonomic', desc: 'Carga física, postura, fadiga, biomecânica', color: COLORS.warning },
    { label: 'Human\nPreference', desc: 'Confiança, experiência, estilo (liderar × seguir)', color: COLORS.accent },
    { label: 'Performance', desc: 'Produtividade, qualidade, tempo de ciclo', color: COLORS.success },
    { label: 'Task\nComplexity', desc: 'Variabilidade, precisão, necessidade decisória', color: COLORS.primary },
  ];
  const cardW = 2.3;
  const cardGap = 0.25;
  const startX = (W - (cardW * 5 + cardGap * 4)) / 2;
  const cardY = 2.4;
  dims.forEach((d, i) => {
    const x = startX + i * (cardW + cardGap);
    s.addShape(pres.ShapeType.rect, {
      x,
      y: cardY,
      w: cardW,
      h: 3.4,
      fill: { color: 'FFFFFF' },
      line: { color: COLORS.border, width: 0.75 },
    });
    s.addShape(pres.ShapeType.rect, {
      x,
      y: cardY,
      w: cardW,
      h: 0.15,
      fill: { color: d.color },
      line: { type: 'none' },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + (cardW - 0.9) / 2,
      y: cardY + 0.5,
      w: 0.9,
      h: 0.9,
      fill: { color: d.color },
      line: { type: 'none' },
    });
    s.addText(String(i + 1), {
      x: x + (cardW - 0.9) / 2,
      y: cardY + 0.5,
      w: 0.9,
      h: 0.9,
      fontFace: FONT,
      fontSize: 32,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
    s.addText(d.label, {
      x,
      y: cardY + 1.55,
      w: cardW,
      h: 0.9,
      fontFace: FONT,
      fontSize: 17,
      bold: true,
      color: COLORS.primary,
      align: 'center',
      valign: 'top',
    });
    s.addText(d.desc, {
      x: x + 0.15,
      y: cardY + 2.5,
      w: cardW - 0.3,
      h: 0.85,
      fontFace: FONT,
      fontSize: 11,
      color: COLORS.textMuted,
      align: 'center',
      valign: 'top',
    });
  });
  addCitationHint(
    s,
    'Síntese de Bagheri (2022), Wolffgramm (2024), Proia (2025), Noormohammadi-Asl (2025) entre outros.',
  );
}

// -----------------------------------------------------------------------------
// 7. Segurança como variável estrutural
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 7, total: TOTAL });
  addTitle(s, 'Segurança como variável estrutural, não acessória');
  addBullets(s, [
    'Saenz et al. (2023) — segurança segue sendo barreira à expansão de cobots',
    'Faccio, Granata e Minto (2024) — alocação depende de velocidade, distância e risco',
    'Proia et al. (2025) — planejamento multiobjetivo equilibra tempo, ergonomia e ISO',
  ], { y: 1.7, h: 2.4 });
  // callout
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 4.4,
    w: W - 1.2,
    h: 2.1,
    fill: { color: COLORS.primary },
    line: { type: 'none' },
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 4.4,
    w: 0.12,
    h: 2.1,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText(
    '"O melhor desempenho industrial não corresponde ao menor tempo possível, mas ao melhor compromisso entre eficiência, segurança e ergonomia."',
    {
      x: 1.0,
      y: 4.6,
      w: W - 1.8,
      h: 1.7,
      fontFace: FONT,
      fontSize: 20,
      italic: true,
      color: 'FFFFFF',
      valign: 'middle',
    },
  );
}

// -----------------------------------------------------------------------------
// 8. Ergonomia como critério de projeto
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 8, total: TOTAL });
  addTitle(s, 'Ergonomia como critério de projeto (não consequência)');
  addBullets(s, [
    'Tassi, De Momi e Ajoudani (2022) — controle hierárquico com compliance adaptativo',
    'Calzavara et al. (2024) — alocação dinâmica transfere tarefas sob estresse do operador',
    'Wu, Wang e Hu (2025) — redução de velocidade/aceleração na coluna em tarefas agrícolas',
  ], { y: 1.7, h: 2.4 });
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 4.4,
    w: W - 1.2,
    h: 2.1,
    fill: { color: COLORS.warning },
    line: { type: 'none' },
  });
  s.addText(
    '"O ganho ergonômico não é simples eliminação de esforço, mas reorganização biomecânica da tarefa."',
    {
      x: 1.0,
      y: 4.6,
      w: W - 1.8,
      h: 1.7,
      fontFace: FONT,
      fontSize: 20,
      italic: true,
      color: '451A03',
      valign: 'middle',
    },
  );
}

// -----------------------------------------------------------------------------
// 9. Construtos humano-robô
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 9, total: TOTAL });
  addTitle(s, 'Construtos humano-robô determinam o desempenho');
  const constructs = [
    {
      title: 'Transparência',
      ref: 'Bagheri et al. (2022)',
      detail:
        'Interfaces que explicam a decisão do cobot aumentam confiança e capacidade de ensino por não especialistas.',
      color: COLORS.accent,
    },
    {
      title: 'Preferência liderar × seguir',
      ref: 'Noormohammadi-Asl et al. (2025)',
      detail:
        'Operadores diferem em estilo de colaboração; sistemas que adaptam alocação mantêm desempenho e elevam satisfação.',
      color: COLORS.success,
    },
    {
      title: 'Autonomia calibrada',
      ref: 'Wolffgramm et al. (2024)',
      detail:
        'Autonomia máxima gera sobrecarga; ambientes rígidos reduzem motivação. O ótimo é a calibração ao contexto.',
      color: COLORS.warning,
    },
  ];
  const cardW = (W - 1.2 - 2 * 0.3) / 3;
  constructs.forEach((c, i) => {
    const x = 0.6 + i * (cardW + 0.3);
    s.addShape(pres.ShapeType.rect, {
      x,
      y: 1.8,
      w: cardW,
      h: 4.8,
      fill: { color: 'FFFFFF' },
      line: { color: COLORS.border, width: 0.75 },
    });
    s.addShape(pres.ShapeType.rect, {
      x,
      y: 1.8,
      w: cardW,
      h: 0.15,
      fill: { color: c.color },
      line: { type: 'none' },
    });
    s.addText(c.title, {
      x: x + 0.25,
      y: 2.1,
      w: cardW - 0.5,
      h: 0.8,
      fontFace: FONT,
      fontSize: 20,
      bold: true,
      color: COLORS.primary,
      valign: 'top',
    });
    s.addText(c.ref, {
      x: x + 0.25,
      y: 2.95,
      w: cardW - 0.5,
      h: 0.4,
      fontFace: FONT,
      fontSize: 12,
      italic: true,
      color: c.color,
    });
    s.addText(c.detail, {
      x: x + 0.25,
      y: 3.5,
      w: cardW - 0.5,
      h: 3.0,
      fontFace: FONT,
      fontSize: 14,
      color: COLORS.text,
      valign: 'top',
    });
  });
}

// -----------------------------------------------------------------------------
// 10. Complexidade e habilidade como moderadores
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 10, total: TOTAL });
  addTitle(s, 'Complexidade e habilidade moderam a escolha');
  // Two-column: simples | complexa
  const colW = (W - 1.2 - 0.3) / 2;
  const colY = 1.8;
  const colH = 4.9;
  // Coluna 1
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: colY,
    w: colW,
    h: colH,
    fill: { color: COLORS.bgMuted },
    line: { color: COLORS.border, width: 0.5 },
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: colY,
    w: colW,
    h: 0.6,
    fill: { color: COLORS.success },
    line: { type: 'none' },
  });
  s.addText('Tarefas simples / estáveis', {
    x: 0.6,
    y: colY,
    w: colW,
    h: 0.6,
    fontFace: FONT,
    fontSize: 18,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  });
  s.addText(
    [
      { text: 'Métodos estruturados tendem a bastar', options: { bullet: { code: '25A0' }, fontSize: 16 } },
      { text: 'Programação convencional/offline', options: { bullet: { code: '25A0' }, fontSize: 16 } },
      { text: 'Parametrização operacional', options: { bullet: { code: '25A0' }, fontSize: 16 } },
      { text: 'Menor necessidade de adaptação em tempo real', options: { bullet: { code: '25A0' }, fontSize: 16 } },
    ],
    {
      x: 1.0,
      y: colY + 0.9,
      w: colW - 0.8,
      h: colH - 1.2,
      fontFace: FONT,
      color: COLORS.text,
      paraSpaceAfter: 10,
    },
  );
  // Coluna 2
  const col2X = 0.6 + colW + 0.3;
  s.addShape(pres.ShapeType.rect, {
    x: col2X,
    y: colY,
    w: colW,
    h: colH,
    fill: { color: COLORS.bgMuted },
    line: { color: COLORS.border, width: 0.5 },
  });
  s.addShape(pres.ShapeType.rect, {
    x: col2X,
    y: colY,
    w: colW,
    h: 0.6,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText('Tarefas complexas / variáveis', {
    x: col2X,
    y: colY,
    w: colW,
    h: 0.6,
    fontFace: FONT,
    fontSize: 18,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  });
  s.addText(
    [
      { text: 'Abordagens adaptativas ganham destaque', options: { bullet: { code: '25A0' }, fontSize: 16 } },
      { text: 'Programming by Demonstration', options: { bullet: { code: '25A0' }, fontSize: 16 } },
      { text: 'Interfaces explicáveis / transparentes', options: { bullet: { code: '25A0' }, fontSize: 16 } },
      { text: 'Shared control e planejamento reativo', options: { bullet: { code: '25A0' }, fontSize: 16 } },
    ],
    {
      x: col2X + 0.4,
      y: colY + 0.9,
      w: colW - 0.8,
      h: colH - 1.2,
      fontFace: FONT,
      color: COLORS.text,
      paraSpaceAfter: 10,
    },
  );
  addCitationHint(
    s,
    'Wolffgramm et al. (2024) — maturidade do usuário condiciona a eficácia de métodos sofisticados.',
  );
}

// -----------------------------------------------------------------------------
// 11. Lacuna consolidada
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 11, total: TOTAL });
  addTitle(s, 'A lacuna consolidada pela revisão (RQ3)');
  s.addText(
    'Nenhum modelo da literatura responde simultaneamente:',
    {
      x: 0.6,
      y: 1.6,
      w: W - 1.2,
      h: 0.5,
      fontFace: FONT,
      fontSize: 18,
      color: COLORS.textMuted,
      italic: true,
    },
  );
  const questions = [
    'Qual método de programação usar?',
    'Em qual tipo de tarefa?',
    'Para qual perfil de operador?',
    'Sob quais restrições de segurança?',
    'Com quais metas de desempenho?',
    'Considerando quais impactos ergonômicos?',
  ];
  const cols = 3;
  const rows = 2;
  const cardW = (W - 1.2 - 0.3 * (cols - 1)) / cols;
  const cardH = 1.7;
  const startY = 2.5;
  questions.forEach((q, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.6 + col * (cardW + 0.3);
    const y = startY + row * (cardH + 0.3);
    s.addShape(pres.ShapeType.rect, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: { color: COLORS.bgMuted },
      line: { color: COLORS.accent, width: 1 },
    });
    s.addText('?', {
      x,
      y,
      w: 0.8,
      h: cardH,
      fontFace: FONT,
      fontSize: 48,
      bold: true,
      color: COLORS.accent,
      align: 'center',
      valign: 'middle',
    });
    s.addText(q, {
      x: x + 0.8,
      y: y + 0.2,
      w: cardW - 0.9,
      h: cardH - 0.4,
      fontFace: FONT,
      fontSize: 16,
      color: COLORS.text,
      valign: 'middle',
    });
  });
}

// -----------------------------------------------------------------------------
// 12. AHCF-CPS — 5 dimensões (título do framework)
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.primary };
  // barra lateral accent
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.25,
    h: H,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText(TOTAL_TO_TAG(12, TOTAL), {
    x: W - 1.2,
    y: H - 0.35,
    w: 0.7,
    h: 0.3,
    fontFace: FONT,
    fontSize: 10,
    color: '94A3B8',
    align: 'right',
  });
  s.addText('Proposta', {
    x: 0.6,
    y: 0.6,
    w: 4,
    h: 0.5,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: COLORS.accentSoft,
    charSpacing: 3,
  });
  s.addText('AHCF-CPS', {
    x: 0.6,
    y: 1.2,
    w: 6,
    h: 1.2,
    fontFace: FONT,
    fontSize: 54,
    bold: true,
    color: 'FFFFFF',
  });
  s.addText('Adaptive Human-Centered Framework for Cobot Programming Selection', {
    x: 0.6,
    y: 2.5,
    w: 7.5,
    h: 1.2,
    fontFace: FONT,
    fontSize: 18,
    italic: true,
    color: 'CBD5E1',
  });
  // 5 badges coloridos — lista vertical à direita
  const dims = [
    { name: 'Safety Score', desc: 'risco e conformidade', color: COLORS.danger },
    { name: 'Ergonomic Score', desc: 'esforço, postura, fadiga', color: COLORS.warning },
    { name: 'Human Preference', desc: 'confiança e estilo', color: COLORS.accent },
    { name: 'Performance Score', desc: 'produtividade e tempo de ciclo', color: COLORS.success },
    { name: 'Task Complexity', desc: 'variabilidade e precisão', color: '8B5CF6' },
  ];
  const rX = 8.2;
  const rY = 1.2;
  const rH = 0.95;
  dims.forEach((d, i) => {
    const y = rY + i * (rH + 0.1);
    s.addShape(pres.ShapeType.rect, {
      x: rX,
      y,
      w: 4.5,
      h: rH,
      fill: { color: '1E293B' },
      line: { type: 'none' },
    });
    s.addShape(pres.ShapeType.rect, {
      x: rX,
      y,
      w: 0.1,
      h: rH,
      fill: { color: d.color },
      line: { type: 'none' },
    });
    s.addText(d.name, {
      x: rX + 0.25,
      y: y + 0.1,
      w: 4.2,
      h: 0.45,
      fontFace: FONT,
      fontSize: 16,
      bold: true,
      color: 'FFFFFF',
    });
    s.addText(d.desc, {
      x: rX + 0.25,
      y: y + 0.5,
      w: 4.2,
      h: 0.4,
      fontFace: FONT,
      fontSize: 11,
      color: '94A3B8',
    });
  });
}

function TOTAL_TO_TAG(i, t) {
  return `${i} / ${t}`;
}

// -----------------------------------------------------------------------------
// 13. Formulação matemática (SLIDE CRÍTICO)
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 13, total: TOTAL });
  addTitle(s, 'Formulação matemática — §7.9 revisada');
  // fórmula principal centralizada
  s.addImage({
    path: FORMULA_PNG,
    x: 0.8,
    y: 1.7,
    w: W - 1.6,
    h: 1.6,
  });
  s.addImage({
    path: FORMULA_ARGMAX_PNG,
    x: (W - 4) / 2,
    y: 3.4,
    w: 4,
    h: 0.8,
  });
  // legendas com domínios
  const domains = [
    { term: 'X_i, H_k', desc: 'fatores contextuais e humano-robô ∈ [0, 1]' },
    { term: 'a_{j,·}', desc: 'afinidade método × variável ∈ [0, 1]' },
    { term: 'α_i, β_k, γ', desc: 'pesos ajustáveis ∈ ℝ_{≥0}' },
    { term: 'c_j, χ̃', desc: 'custo e restrição orçamentária ∈ [0, 1]' },
  ];
  const colW = (W - 1.2 - 0.3) / 2;
  domains.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * (colW + 0.3);
    const y = 4.4 + row * 0.75;
    s.addShape(pres.ShapeType.rect, {
      x,
      y,
      w: colW,
      h: 0.65,
      fill: { color: COLORS.bgMuted },
      line: { color: COLORS.border, width: 0.5 },
    });
    s.addText(d.term, {
      x: x + 0.15,
      y: y + 0.1,
      w: 1.6,
      h: 0.5,
      fontFace: 'Cambria Math',
      fontSize: 16,
      bold: true,
      italic: true,
      color: COLORS.accent,
      valign: 'middle',
    });
    s.addText(d.desc, {
      x: x + 1.8,
      y: y + 0.1,
      w: colW - 2.0,
      h: 0.5,
      fontFace: FONT,
      fontSize: 13,
      color: COLORS.text,
      valign: 'middle',
    });
  });
  addCitationHint(
    s,
    'Revisão fundamentada (R1–R5): afinidade a_{j,·}, domínios [0,1], partição § 5.7, sinal do custo, tabela de afinidades § 6.2.',
  );
}

// -----------------------------------------------------------------------------
// 14. Compatibilidade do framework
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 14, total: TOTAL });
  addTitle(s, 'Compatibilidade com técnicas multicritério');
  const techs = [
    {
      name: 'AHP',
      sub: 'Analytic Hierarchy Process',
      how: 'α_i e β_k obtidos da média geométrica de uma matriz pareada entre as dimensões.',
    },
    {
      name: 'TOPSIS',
      sub: 'Technique for Order Preference\nby Similarity to Ideal Solution',
      how: 'Matriz [a_{j,·} X, a_{j,·} H] ponderada gera closeness coefficient por método.',
    },
    {
      name: 'Fuzzy Logic',
      sub: 'Variáveis linguísticas',
      how: 'X e H tratados como conjuntos fuzzy para contextos com incerteza linguística.',
    },
    {
      name: 'Machine Learning',
      sub: 'Aprendizado adaptativo',
      how: 'Vetor determinístico de entrada; pesos podem ser aprendidos de dados históricos.',
    },
  ];
  const cardW = (W - 1.2 - 0.3 * (techs.length - 1)) / techs.length;
  techs.forEach((t, i) => {
    const x = 0.6 + i * (cardW + 0.3);
    const y = 1.9;
    s.addShape(pres.ShapeType.rect, {
      x,
      y,
      w: cardW,
      h: 4.6,
      fill: { color: 'FFFFFF' },
      line: { color: COLORS.border, width: 0.75 },
    });
    s.addShape(pres.ShapeType.rect, {
      x,
      y,
      w: cardW,
      h: 1.3,
      fill: { color: COLORS.primary },
      line: { type: 'none' },
    });
    s.addText(t.name, {
      x,
      y: y + 0.15,
      w: cardW,
      h: 0.55,
      fontFace: FONT,
      fontSize: 22,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    });
    s.addText(t.sub, {
      x,
      y: y + 0.75,
      w: cardW,
      h: 0.55,
      fontFace: FONT,
      fontSize: 11,
      italic: true,
      color: '94A3B8',
      align: 'center',
    });
    s.addText(t.how, {
      x: x + 0.25,
      y: y + 1.5,
      w: cardW - 0.5,
      h: 3.0,
      fontFace: FONT,
      fontSize: 13,
      color: COLORS.text,
      valign: 'top',
    });
  });
}

// -----------------------------------------------------------------------------
// 15. Contribuições (teóricas + práticas)
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 15, total: TOTAL });
  addTitle(s, 'Contribuições');
  const colW = (W - 1.2 - 0.3) / 2;
  // Teóricas
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 1.8,
    w: colW,
    h: 4.8,
    fill: { color: COLORS.bgMuted },
    line: { color: COLORS.border, width: 0.5 },
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 1.8,
    w: colW,
    h: 0.6,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText('Teóricas', {
    x: 0.6,
    y: 1.8,
    w: colW,
    h: 0.6,
    fontFace: FONT,
    fontSize: 18,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  });
  s.addText(
    [
      { text: 'Problema multicritério formal, não mais empírico', options: { bullet: { code: '25A0' }, fontSize: 15 } },
      { text: 'Integração explícita de fatores humanos e técnicos', options: { bullet: { code: '25A0' }, fontSize: 15 } },
      { text: 'Alinhamento aos princípios da Indústria 5.0', options: { bullet: { code: '25A0' }, fontSize: 15 } },
      { text: 'Reconhecimento de diferenças individuais', options: { bullet: { code: '25A0' }, fontSize: 15 } },
      { text: 'Base formal para sistemas especialistas', options: { bullet: { code: '25A0' }, fontSize: 15 } },
    ],
    {
      x: 1.0,
      y: 2.6,
      w: colW - 0.8,
      h: 3.8,
      fontFace: FONT,
      color: COLORS.text,
      paraSpaceAfter: 8,
    },
  );
  // Práticas
  const col2X = 0.6 + colW + 0.3;
  s.addShape(pres.ShapeType.rect, {
    x: col2X,
    y: 1.8,
    w: colW,
    h: 4.8,
    fill: { color: COLORS.bgMuted },
    line: { color: COLORS.border, width: 0.5 },
  });
  s.addShape(pres.ShapeType.rect, {
    x: col2X,
    y: 1.8,
    w: colW,
    h: 0.6,
    fill: { color: COLORS.success },
    line: { type: 'none' },
  });
  s.addText('Práticas', {
    x: col2X,
    y: 1.8,
    w: colW,
    h: 0.6,
    fontFace: FONT,
    fontSize: 18,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  });
  s.addText(
    [
      { text: 'Seleção de cobots em projetos industriais', options: { bullet: { code: '25A0' }, fontSize: 15 } },
      { text: 'Escolha do método antes da compra', options: { bullet: { code: '25A0' }, fontSize: 15 } },
      { text: 'Diagnóstico de falhas de adoção', options: { bullet: { code: '25A0' }, fontSize: 15 } },
      { text: 'Redesenho de células colaborativas', options: { bullet: { code: '25A0' }, fontSize: 15 } },
      { text: 'Implantação gradual em PMEs', options: { bullet: { code: '25A0' }, fontSize: 15 } },
    ],
    {
      x: col2X + 0.4,
      y: 2.6,
      w: colW - 0.8,
      h: 3.8,
      fontFace: FONT,
      color: COLORS.text,
      paraSpaceAfter: 8,
    },
  );
}

// -----------------------------------------------------------------------------
// 16. Limitações + Estudos futuros
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { index: 16, total: TOTAL });
  addTitle(s, 'Limitações e estudos futuros');
  const colW = (W - 1.2 - 0.3) / 2;
  // Limitações
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 1.8,
    w: colW,
    h: 4.8,
    fill: { color: 'FFFFFF' },
    line: { color: COLORS.warning, width: 1.5 },
  });
  s.addText('Limitações', {
    x: 0.8,
    y: 2.0,
    w: colW - 0.4,
    h: 0.5,
    fontFace: FONT,
    fontSize: 18,
    bold: true,
    color: COLORS.warning,
  });
  s.addText(
    [
      { text: 'Recorte temporal 2019–2026', options: { bullet: { code: '25A0' }, fontSize: 14 } },
      { text: 'Heterogeneidade metodológica entre estudos', options: { bullet: { code: '25A0' }, fontSize: 14 } },
      { text: 'Parte dos experimentos ocorre em laboratório', options: { bullet: { code: '25A0' }, fontSize: 14 } },
      { text: 'Framework ainda conceitual', options: { bullet: { code: '25A0' }, fontSize: 14 } },
      { text: 'Pesos multicritério requerem calibração setorial', options: { bullet: { code: '25A0' }, fontSize: 14 } },
    ],
    {
      x: 1.0,
      y: 2.7,
      w: colW - 0.8,
      h: 3.6,
      fontFace: FONT,
      color: COLORS.text,
      paraSpaceAfter: 6,
    },
  );
  // Futuros
  const col2X = 0.6 + colW + 0.3;
  s.addShape(pres.ShapeType.rect, {
    x: col2X,
    y: 1.8,
    w: colW,
    h: 4.8,
    fill: { color: 'FFFFFF' },
    line: { color: COLORS.accent, width: 1.5 },
  });
  s.addText('Estudos futuros', {
    x: col2X + 0.2,
    y: 2.0,
    w: colW - 0.4,
    h: 0.5,
    fontFace: FONT,
    fontSize: 18,
    bold: true,
    color: COLORS.accent,
  });
  s.addText(
    [
      { text: 'Validação empírica em setores-chave', options: { bullet: { code: '25A0' }, fontSize: 14 } },
      { text: 'AHP / TOPSIS / Fuzzy / Bayesian / RL adaptativo', options: { bullet: { code: '25A0' }, fontSize: 14 } },
      { text: 'Integração com Digital Twins', options: { bullet: { code: '25A0' }, fontSize: 14 } },
      { text: 'Personalização contínua (fadiga, aprendizado)', options: { bullet: { code: '25A0' }, fontSize: 14 } },
      { text: 'Indicadores ESG e sustentabilidade', options: { bullet: { code: '25A0' }, fontSize: 14 } },
    ],
    {
      x: col2X + 0.4,
      y: 2.7,
      w: colW - 0.8,
      h: 3.6,
      fontFace: FONT,
      color: COLORS.text,
      paraSpaceAfter: 6,
    },
  );
}

// -----------------------------------------------------------------------------
// 17. Consideração final
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.primary };
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.25,
    h: H,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText('Consideração final', {
    x: 0.6,
    y: 0.5,
    w: W - 1.2,
    h: 0.6,
    fontFace: FONT,
    fontSize: 16,
    bold: true,
    color: COLORS.accentSoft,
    charSpacing: 3,
  });
  s.addText(
    'Selecionar como programar um cobot é tão importante quanto decidir se utilizá-lo.',
    {
      x: 0.6,
      y: 1.8,
      w: W - 1.2,
      h: 1.8,
      fontFace: FONT,
      fontSize: 36,
      bold: true,
      color: 'FFFFFF',
      valign: 'middle',
    },
  );
  // divider
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 4.0,
    w: 2.5,
    h: 0.05,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText(
    'A automação colaborativa do futuro será eficiente, adaptativa, inclusiva e centrada nas pessoas. O AHCF-CPS é um primeiro passo nessa direção.',
    {
      x: 0.6,
      y: 4.3,
      w: W - 1.2,
      h: 2.2,
      fontFace: FONT,
      fontSize: 20,
      italic: true,
      color: 'CBD5E1',
      valign: 'top',
    },
  );
  s.addText('17 / 18', {
    x: W - 1.2,
    y: H - 0.35,
    w: 0.7,
    h: 0.3,
    fontFace: FONT,
    fontSize: 10,
    color: '94A3B8',
    align: 'right',
  });
}

// -----------------------------------------------------------------------------
// 18. Obrigado + contato
// -----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLORS.primary };
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.25,
    h: H,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText('Obrigado', {
    x: 0.6,
    y: 2.5,
    w: W - 1.2,
    h: 1.5,
    fontFace: FONT,
    fontSize: 80,
    bold: true,
    color: 'FFFFFF',
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 4.1,
    w: 3,
    h: 0.06,
    fill: { color: COLORS.accent },
    line: { type: 'none' },
  });
  s.addText(
    [
      { text: 'João Paulo Matias', options: { bold: true, color: 'FFFFFF', fontSize: 22 } },
      { text: '\nUniversidade de São Paulo — Escola Politécnica', options: { color: 'CBD5E1', fontSize: 16 } },
      { text: '\njoaopaulomirandamatias@gmail.com', options: { color: COLORS.accentSoft, fontSize: 16 } },
      { text: '\nPEA5733 — Automação e Sociedade (2026)', options: { color: '94A3B8', fontSize: 14, italic: true } },
    ],
    { x: 0.6, y: 4.4, w: W - 1.2, h: 2.4, fontFace: FONT },
  );
  s.addText('18 / 18', {
    x: W - 1.2,
    y: H - 0.35,
    w: 0.7,
    h: 0.3,
    fontFace: FONT,
    fontSize: 10,
    color: '94A3B8',
    align: 'right',
  });
}

pres.writeFile({ fileName: OUT }).then((file) => {
  console.log('Gerado:', file);
});
