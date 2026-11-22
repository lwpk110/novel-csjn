import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import {
  APPRENTICE_ROMANCE_ARCS,
  CHARACTER_NODES,
  CHASING_HUSBAND_SPEC,
  CIVILIZATION_TIMELINE,
  DELAYED_CLUE_CHAINS,
  GOLDEN_FINGER_COSTS,
  LIFESPAN_TIER_MATRIX,
  MAP_SECTORS,
  MOBILITY_SKILL_SPEC,
  NOVEL_META,
  PHONE_ARTIFACT_SPEC,
  PROTAGONIST_SOUL_SPEC,
  RELATIONSHIP_EDGES,
  SHORT_DRAMA_TROPES,
  SYSTEM_LAWS,
  WORLD_MATRIX,
} from '../data/novelData';
import { StoryArc } from '../types/novel';

interface ExportModalProps {
  arcs: StoryArc[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ arcs, onClose }) => {
  const [copied, setCopied] = useState(false);

  const markdownContent = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# ${NOVEL_META.title}`);
    lines.push('');
    lines.push(`> ${NOVEL_META.workingSubtitle}`);
    lines.push('');
    lines.push('## 一、核心主题与时间洪流演进');
    lines.push(NOVEL_META.corePremise);
    lines.push('');
    lines.push('### 文明跨纪元时间轴');
    CIVILIZATION_TIMELINE.forEach((stage) => {
      lines.push(`- **${stage.era}**（${stage.span}｜${stage.worlds}）：${stage.summary}`);
    });
    lines.push('');
    lines.push('### 红尘长生录系统法则');
    SYSTEM_LAWS.forEach((law) => {
      lines.push(`- **${law.index}. ${law.title}**：${law.rule}`);
    });
    lines.push('');
    lines.push('### 反龙傲天平衡 · 金手指消耗与代价体系');
    GOLDEN_FINGER_COSTS.forEach((cost) => {
      lines.push(`- **${cost.code} · ${cost.title}**：${cost.mechanism}（案例：${cost.example}）`);
    });
    lines.push('');
    lines.push('### 草蛇灰线 · 延迟伏笔契子链（留白式读者推理爽点）');
    DELAYED_CLUE_CHAINS.forEach((chain) => {
      lines.push(
        `- **${chain.name}**（${chain.plantedArc} → ${chain.echoArcs}）：初读表象：${chain.surfaceDetail}｜隔世揭晓：${chain.delayedReveal}`
      );
    });
    lines.push('');
    lines.push('## 二、独立卷章大纲、延迟契子与代价记录');
    arcs.forEach((arc) => {
      lines.push('');
      lines.push(`### ${arc.indexLabel} · ${arc.worldName}：《${arc.title}》`);
      lines.push(
        `- **身份定位**：${arc.identityType} ｜ **主角化名**：${arc.protagonistAlias} ｜ **时间跨度**：${arc.eraSpan}`
      );
      lines.push(`- **核心羁绊**：${arc.companionName}（${arc.companionRole}）`);
      lines.push(`- **单卷立意**：${arc.independentTheme}`);
      lines.push(`- **核心爽点（${arc.thrillHook.label}）**：${arc.thrillHook.detail}`);
      lines.push(`- **假死退场**：${arc.deathMethod}`);
      lines.push('- **分节细纲**：');
      arc.beats.forEach((b, idx) => {
        lines.push(`  ${idx + 1}. **${b.phase}｜${b.title}**：${b.summary}（核心画面：${b.keyScene}）`);
      });
      lines.push(
        `- **系统结算**：寿元 +${arc.reward.lifespanYears} 年 ｜ 词条「${arc.reward.coreTrait}」｜ 器物「${arc.reward.artifact}」`
      );
      lines.push(
        `- **延迟契子（不即时揭晓）**：${arc.clueWedge.clueDetail}（${arc.clueWedge.echoesInWorld} → ${arc.clueWedge.readerAhaMoment}）`
      );
      lines.push(
        `- **金手指代价（反龙傲天）**：${arc.costBalance.costPaid}（爽点：${arc.costBalance.restraintThrill}）`
      );
      lines.push(
        `- **灵魂设定（Soul）**：主角魂态：${arc.soulSetting.protagonistSoulState} ｜ 人物魂格：${arc.soulSetting.companionSoulSpec} ｜ 跨世共鸣：${arc.soulSetting.soulResonance}`
      );
      lines.push(
        `- **后期暗线引子**：${arc.foreshadowing.relicName}（${arc.foreshadowing.dormantYears}）—— ${arc.foreshadowing.futurePayoff}`
      );
    });
    lines.push('');
    lines.push('## 三、核心人物、寿元核定、灵魂设定与跨世关系');
    CHARACTER_NODES.forEach((c) => {
      lines.push(
        `- **${c.name}**（${c.worldLabel} · ${c.title}）：[寿元] ${c.lifespanSpec} ｜ ${c.beforeDeath} 假死后：${c.afterDeath} ｜ **Soul**：${c.soulProfile.archetype}（${c.soulProfile.imprint} → ${c.soulProfile.resonance}）`
      );
    });
    lines.push('');
    lines.push('### 不同背景角色寿元核定体系');
    LIFESPAN_TIER_MATRIX.forEach((tier) => {
      lines.push(
        `- **${tier.tierCode} · ${tier.category}**（${tier.lifespanRange}）：${tier.mechanism}｜代表人物：${tier.representativeCharacters}｜限制：${tier.constraintNote}`
      );
    });
    lines.push('');
    lines.push('### 跨世隐线脉络');
    RELATIONSHIP_EDGES.filter((e) => e.type === 'hidden').forEach((e) => {
      lines.push(`- **${e.label}**：${e.detail}`);
    });
    lines.push('');
    lines.push('### 极昼极夜地图板块法则');
    MAP_SECTORS.forEach((sector) => {
      lines.push(
        `- **${sector.name}**（${sector.worldsIncluded}）：${sector.illuminationRule}｜伪装影响：${sector.disguiseImpact}`
      );
    });
    lines.push('');
    lines.push('### 爆款短剧爽点适配（不龙傲天）');
    SHORT_DRAMA_TROPES.forEach((trope) => {
      lines.push(`- **${trope.code} · ${trope.title}**：${trope.mechanism}（落点：${trope.placement}）`);
    });
    lines.push('');
    lines.push(`### 高机动跑图身法：${MOBILITY_SKILL_SPEC.summary}`);
    lines.push(MOBILITY_SKILL_SPEC.designPurpose);
    MOBILITY_SKILL_SPEC.stages.forEach((st) => {
      lines.push(`- **${st.stage} · ${st.name}**（${st.originArc}）：${st.speedEffect}｜限制：${st.costAndLimit}`);
    });
    lines.push('');
    lines.push(`### ${PHONE_ARTIFACT_SPEC.title}`);
    lines.push(`- **核心铁律**：${PHONE_ARTIFACT_SPEC.coreRule}`);
    lines.push(`- **耗寿成本**：${PHONE_ARTIFACT_SPEC.burnCost}`);
    lines.push(`- **现代反转**：${PHONE_ARTIFACT_SPEC.modernTwist}`);
    PHONE_ARTIFACT_SPEC.logs.forEach((log) => {
      lines.push(`- **${log.era}**（${log.batteryUsed}｜${log.disguiseForm}）：${log.capturedMemory}`);
    });
    lines.push('');
    lines.push(`### ${PROTAGONIST_SOUL_SPEC.title}`);
    lines.push(`- **核心机制**：${PROTAGONIST_SOUL_SPEC.coreConcept}`);
    lines.push(`- **反龙傲天限制**：${PROTAGONIST_SOUL_SPEC.antiPowerLimit}`);
    PROTAGONIST_SOUL_SPEC.soulFingerprints.forEach((fp) => {
      lines.push(`- **${fp.name}**（${fp.origin}）：${fp.clueEffect}`);
    });
    PROTAGONIST_SOUL_SPEC.soulStages.forEach((st) => {
      lines.push(`- **${st.stage}**（${st.span}）：${st.mechanism}`);
    });
    lines.push('');
    lines.push(`### 追夫女主角专设：${CHASING_HUSBAND_SPEC.heroineName}`);
    lines.push(`- **身份演变**：${CHASING_HUSBAND_SPEC.identityShift}`);
    lines.push(`- **破防转折**：${CHASING_HUSBAND_SPEC.turningPoint}`);
    lines.push(`- **追夫手段**：${CHASING_HUSBAND_SPEC.chasingStyle}（信物：${CHASING_HUSBAND_SPEC.bindingRelic}）`);
    CHASING_HUSBAND_SPEC.scenes.forEach((s) => {
      lines.push(`- **${s.era} · ${s.title}**：${s.tensionBeat}`);
    });
    lines.push('');
    lines.push('### 女徒弟暧昧与冲师情感线');
    APPRENTICE_ROMANCE_ARCS.forEach((a) => {
      lines.push(
        `- **${a.characterName}**（${a.originArc}｜${a.surfaceBond}）：契机：${a.ambiguityTrigger} ｜ 名场面：${a.signatureMoment} ｜ 回收：${a.emotionalPayoff}`
      );
    });
    lines.push('');
    lines.push('## 四、十四维世界观设定简表');
    WORLD_MATRIX.forEach((w) => {
      lines.push(`- **${w.name}**（${w.sectorLabel}｜${w.eraTone}）：力量体系为${w.powerSystem}；核心意象：${w.visualMotifs}；伪装法则：${w.disguiseRule}`);
    });
    return lines.join('\n');
  }, [arcs]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '长生纪年_小说大纲与世界设定集.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="导出完整小说设定集"
    >
      <div className="bg-white border border-[#E4E4E7] rounded-xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between gap-4">
          <div>
            <h3 className="font-editorial text-lg font-semibold text-[#141413]">
              导出完整 Markdown 设定集
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              包含所有当前卷章大纲、行内修改记录、人物关系与世界规则
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#71717A] hover:text-[#141413] cursor-pointer"
            aria-label="关闭导出弹窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-[#FAFAFA]">
          <pre className="text-xs leading-relaxed text-[#27272A] whitespace-pre-wrap font-mono">
            {markdownContent}
          </pre>
        </div>

        <div className="px-6 py-4 border-t border-[#E4E4E7] bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#141413] border border-[#D4D4D8] hover:border-[#141413] rounded-md transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制到剪贴板' : '复制全文'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#141413] hover:bg-[#27272A] rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下载 .md 文件</span>
          </button>
        </div>
      </div>
    </div>
  );
};
