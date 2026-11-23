import fs from 'node:fs';
import path from 'node:path';
import {
  NOVEL_META,
  CIVILIZATION_TIMELINE,
  MAP_SECTORS,
  MOBILITY_SKILL_SPEC,
  PHONE_ARTIFACT_SPEC,
  PROTAGONIST_SOUL_SPEC,
  SYSTEM_LAWS,
  GOLDEN_FINGER_COSTS,
  LIFESPAN_TIER_MATRIX,
  INITIAL_ARCS,
  CHARACTER_NODES,
  RELATIONSHIP_EDGES,
  DELAYED_CLUE_CHAINS,
} from '../src/data/novelData';

const ROOT = process.cwd();
const WRITING_DIR = path.join(ROOT, 'writing');
const STATE_DIR = path.join(WRITING_DIR, 'state');
const CHAPTERS_DIR = path.join(WRITING_DIR, 'chapters');

fs.mkdirSync(STATE_DIR, { recursive: true });
fs.mkdirSync(CHAPTERS_DIR, { recursive: true });

// 1. 00-设定圣经-总纲.md
const bibleLines: string[] = [
  `# 《${NOVEL_META.title}》设定圣经 · 总纲`,
  '',
  `> ${NOVEL_META.workingSubtitle}`,
  `> 本文档由 \`scripts/sync-writing-bible.ts\` 从 \`src/data/novelData.ts\` 自动同步生成，创作正文时请以此为准。`,
  '',
  '## 一、核心立意与故事前提',
  NOVEL_META.corePremise,
  '',
  '## 二、主角灵魂画像与反龙傲天边界',
  `- **称号/定位**：${PROTAGONIST_SOUL_SPEC.title}`,
  `- **核心概念**：${PROTAGONIST_SOUL_SPEC.coreConcept}`,
  `- **战力与能力上限（红线）**：${PROTAGONIST_SOUL_SPEC.antiPowerLimit}`,
  `- **性格底色**：${PROTAGONIST_SOUL_SPEC.personality}`,
  `- **气质标签**：${PROTAGONIST_SOUL_SPEC.temperamentTraits.join(' / ')}`,
  `- **职业谱系**：${PROTAGONIST_SOUL_SPEC.occupationLineage}`,
  `- **口头禅**：${PROTAGONIST_SOUL_SPEC.catchphrase}`,
  `- **信条**：${PROTAGONIST_SOUL_SPEC.creed}`,
  `- **外貌辨识点**：${PROTAGONIST_SOUL_SPEC.distinctiveAppearance}`,
  '',
  '### 跨世灵魂指纹（防掉马/伏笔关键）',
  ...PROTAGONIST_SOUL_SPEC.soulFingerprints.map(
    (f) => `- **${f.name}**（源自：${f.origin}）：${f.clueEffect}`
  ),
  '',
  '## 三、四大文明纪元',
  ...CIVILIZATION_TIMELINE.map(
    (c) => `- **${c.era}**（${c.span}）｜涵盖世界：${c.worlds}\n  - ${c.summary}`
  ),
  '',
  '## 四、四大光影板块（地图与物理规则约束）',
  ...MAP_SECTORS.map(
    (s) =>
      `### ${s.name}（${s.subtitle}）\n- **光照与尺度规则**：${s.illuminationRule}\n- **包含世界**：${s.worldsIncluded}\n- **伪装/掉马影响**：${s.disguiseImpact}\n- **代价张力**：${s.costTension}`
  ),
  '',
  `## 五、核心机动技能：${MOBILITY_SKILL_SPEC.summary}`,
  `> ${MOBILITY_SKILL_SPEC.designPurpose}`,
  '',
  ...MOBILITY_SKILL_SPEC.stages.map(
    (st) =>
      `- **${st.stage} · ${st.name}**（源自：${st.originArc}）\n  - 机动效果：${st.speedEffect}\n  - 代价与限制：${st.costAndLimit}`
  ),
  '',
  '## 六、万古黑砖（碎屏旧手机）设定',
  '```json',
  JSON.stringify(PHONE_ARTIFACT_SPEC, null, 2),
  '```',
  '',
  '## 七、长生系统铁律与金手指代价',
  ...SYSTEM_LAWS.map((l: any) =>
    typeof l === 'string' ? `- ${l}` : `- **${l.title ?? l.law ?? '铁律'}**：${l.detail ?? l.desc ?? JSON.stringify(l)}`
  ),
  '',
  '### 金手指代价清单',
  ...GOLDEN_FINGER_COSTS.map((g: any) =>
    typeof g === 'string' ? `- ${g}` : `- **${g.name ?? g.ability ?? '代价'}**：${g.cost ?? g.detail ?? JSON.stringify(g)}`
  ),
  '',
  '## 八、寿元阶梯矩阵',
  ...LIFESPAN_TIER_MATRIX.map(
    (t) =>
      `- **${t.tierCode} ${t.category}**（${t.lifespanRange}）：${t.mechanism}｜代表角色：${t.representativeCharacters}｜约束：${t.constraintNote}`
  ),
  '',
];

fs.writeFileSync(path.join(WRITING_DIR, '00-设定圣经-总纲.md'), bibleLines.join('\n'), 'utf-8');

// 2. 01-十四世分卷大纲.md
const arcsLines: string[] = [
  `# 《${NOVEL_META.title}》十四世分卷大纲`,
  '',
  '> 每卷保持独立单元闭环，同时暗埋跨世草蛇灰线。',
  '',
];

for (const arc of INITIAL_ARCS) {
  arcsLines.push(`## ${arc.indexLabel} · ${arc.title}（${arc.worldName}）`);
  arcsLines.push(`- **副标题**：${arc.subtitle}`);
  arcsLines.push(`- **光影板块**：${arc.sectorLabel}（\`${arc.mapSector}\`）`);
  arcsLines.push(`- **主角化名与身份**：${arc.protagonistAlias}（${arc.identityType}）｜时间跨度：${arc.eraSpan}`);
  arcsLines.push(`- **核心同行者**：${arc.companionName}（${arc.companionRole}）`);
  arcsLines.push(`- **独立主题**：${arc.independentTheme}`);
  arcsLines.push(`- **一句话梗概**：${arc.logline}`);
  arcsLines.push(`- **爽点钩子**：[${arc.thrillHook.label}] ${arc.thrillHook.detail}`);
  arcsLines.push(`- **退场/假死方式**：${arc.deathMethod}`);
  arcsLines.push(`- **金手指代价**：使用「${arc.costBalance.abilityUsed}」→ 代价：${arc.costBalance.costPaid}（克制爽感：${arc.costBalance.restraintThrill}）`);
  arcsLines.push(`- **灵魂共振**：主角状态「${arc.soulSetting.protagonistSoulState}」｜同行者「${arc.soulSetting.companionSoulSpec}」｜共振点：${arc.soulSetting.soulResonance}`);
  arcsLines.push(`- **伏笔与延迟线索**：`);
  arcsLines.push(`  - 遗留信物：**${arc.foreshadowing.relicName}**（沉睡 ${arc.foreshadowing.dormantYears}）→ ${arc.foreshadowing.hiddenConnection} → 未来回收：${arc.foreshadowing.futurePayoff}`);
  arcsLines.push(`  - 延迟楔子：${arc.clueWedge.clueDetail}（回响于：${arc.clueWedge.echoesInWorld}｜读者恍然瞬间：${arc.clueWedge.readerAhaMoment}）`);
  arcsLines.push(`- **系统结算**：+${arc.reward.lifespanYears}年寿元｜特质「${arc.reward.coreTrait}」：${arc.reward.traitEffect}｜信物「${arc.reward.artifact}」：${arc.reward.artifactDesc}（评级：${arc.reward.settlementGrade}）`);
  arcsLines.push('- **五段式节拍（起承转合引）**：');
  for (const beat of arc.beats) {
    arcsLines.push(`  1. **[${beat.phase}] ${beat.title}**：${beat.summary}（关键场景：${beat.keyScene}）`);
  }
  arcsLines.push('');
}

fs.writeFileSync(path.join(WRITING_DIR, '01-十四世分卷大纲.md'), arcsLines.join('\n'), 'utf-8');

// 3. 02-人物与关系图谱.md
const charLines: string[] = [
  `# 《${NOVEL_META.title}》人物与关系图谱`,
  '',
  '## 一、核心人物卡',
  '',
];

for (const c of CHARACTER_NODES) {
  charLines.push(`### ${c.name}（${c.title}）`);
  charLines.push(`- **所属世界**：${c.worldLabel}（\`${c.worldKey}\`）｜**角色定位**：${c.role}`);
  charLines.push(`- **寿元规格**：${c.lifespanSpec}｜**当前时代状态**：${c.eraStatus}`);
  charLines.push(`- **主角假死前**：${c.beforeDeath}`);
  charLines.push(`- **主角假死后**：${c.afterDeath}`);
  if ((c as any).soulProfile) {
    const sp = (c as any).soulProfile;
    charLines.push(`- **灵魂档案**：原型「${sp.archetype}」｜性格「${sp.personality}」｜口头禅「${sp.catchphrase}」｜信条「${sp.creed}」`);
  }
  charLines.push('');
}

charLines.push('## 二、人物关系边');
charLines.push('');
for (const e of RELATIONSHIP_EDGES) {
  charLines.push(`- \`${e.source}\` —[**${e.label}**]→ \`${e.target}\`${e.detail ? `：${e.detail}` : ''}`);
}

fs.writeFileSync(path.join(WRITING_DIR, '02-人物与关系图谱.md'), charLines.join('\n'), 'utf-8');

// 4. state/current_state.md (seed only if missing)
const currentStatePath = path.join(STATE_DIR, 'current_state.md');
if (!fs.existsSync(currentStatePath)) {
  const firstArc = INITIAL_ARCS[0];
  const stateContent = `# 当前创作状态（每章写完必更新）

- **当前卷次**：${firstArc?.indexLabel ?? '第一卷'} · ${firstArc?.title ?? '青溪县城'}
- **当前章节**：第 0 章（尚未开笔，准备起稿第 1 章）
- **当前世界与板块**：${firstArc?.worldName ?? '青溪县城'}（${firstArc?.sectorLabel ?? '常昼常夜板块'}）
- **主角当前化名与年龄**：${firstArc?.protagonistAlias ?? '待定'}
- **时间坐标**：第一纪 · 灵盛前夜
- **物理与代价状态**：
  - 寿元余量：初始凡人寿元
  - 身体伤痕/燃寿代价：无
  - 万古黑砖（碎屏手机）状态：彻底断网黑屏，作镇纸/暗藏怀中
  - 红尘缩地步阶段：尚未习得（将在第三、四卷习得初阶）
- **上一章结尾钩子**：无（开篇第 1 章需在 300 字内抛出画面感与异常/冲突）
`;
  fs.writeFileSync(currentStatePath, stateContent, 'utf-8');
}

// 5. state/pending_hooks.md (seed only if missing)
const pendingHooksPath = path.join(STATE_DIR, 'pending_hooks.md');
if (!fs.existsSync(pendingHooksPath)) {
  const hookLines: string[] = [
    '# 草蛇灰线与未回收伏笔账本（每章写完必更新）',
    '',
    '## 跨世核心延迟线索链',
    ...DELAYED_CLUE_CHAINS.map((d: any) =>
      typeof d === 'string' ? `- [ ] ${d}` : `- [ ] **${d.name ?? d.title ?? '线索链'}**：${d.detail ?? d.desc ?? JSON.stringify(d)}`
    ),
    '',
    '## 十四世分卷待埋/待收伏笔',
    ...INITIAL_ARCS.map(
      (a) =>
        `- [ ] [${a.indexLabel}·${a.worldName}] **${a.foreshadowing.relicName}**（沉睡 ${a.foreshadowing.dormantYears}）：${a.foreshadowing.hiddenConnection} → 回收节点：${a.foreshadowing.futurePayoff}`
    ),
    '',
  ];
  fs.writeFileSync(pendingHooksPath, hookLines.join('\n'), 'utf-8');
}

// 6. chapters/README.md
const chaptersReadmePath = path.join(CHAPTERS_DIR, 'README.md');
if (!fs.existsSync(chaptersReadmePath)) {
  fs.writeFileSync(
    chaptersReadmePath,
    `# 《${NOVEL_META.title}》正文草稿区\n\n建议命名规范：\n- \`v01-ch001-章节名.md\`\n- 每章建议 2000-2500 字（适配番茄移动端阅读与日更节奏）。\n- 写前先跑 \`csjn-lore-sync\` 读取状态；写中按 \`csjn-fanqie-pacing\` 控钩子；写后必过 \`csjn-de-ai-editor\` 7 道闸门。\n`,
    'utf-8'
  );
}

console.log('✅ Synced writing bible successfully to writing/');
