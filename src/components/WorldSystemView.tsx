import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  ADAPTATION_BLUEPRINT,
  APPRENTICE_ROMANCE_ARCS,
  CHASING_HUSBAND_SPEC,
  GOLDEN_FINGER_COSTS,
  LIFESPAN_TIER_MATRIX,
  MAP_SECTORS,
  MOBILITY_SKILL_SPEC,
  PHONE_ARTIFACT_SPEC,
  PROTAGONIST_SOUL_SPEC,
  SHORT_DRAMA_TROPES,
  SYSTEM_LAWS,
  WORLD_MATRIX,
} from '../data/novelData';
import { StoryArc } from '../types/novel';

interface WorldSystemViewProps {
  arcs: StoryArc[];
  onOpenMap?: () => void;
}

const ARC_COST_YEARS: Record<string, number> = {
  'arc-county': 0,
  'arc-dynasty': 18,
  'arc-blacksmith': 35,
  'arc-nightwatch': 45,
  'arc-atlantis': 95,
  'arc-sect': 60,
  'arc-skywhale': 140,
  'arc-mirror-desert': 200,
  'arc-twilight': 150,
  'arc-lantern-market': 160,
  'arc-nether': 210,
  'arc-heaven': 280,
  'arc-alt-modern': 120,
  'arc-alt-apocalypse': 380,
};

export const WorldSystemView: React.FC<WorldSystemViewProps> = ({ arcs, onOpenMap }) => {
  const playableArcs = arcs.filter((a) => a.reward.lifespanYears > 0);
  const [completedIds, setCompletedIds] = useState<string[]>(
    playableArcs.map((a) => a.id)
  );
  const [deductCost, setDeductCost] = useState(true);
  const [showAdaptation, setShowAdaptation] = useState(false);

  const toggleArcCompletion = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const completedArcs = playableArcs.filter((a) => completedIds.includes(a.id));
  const grossLifespan = completedArcs.reduce(
    (sum, a) => sum + a.reward.lifespanYears,
    0
  );
  const burnedLifespan = completedArcs.reduce(
    (sum, a) => sum + (ARC_COST_YEARS[a.id] ?? 30),
    0
  );
  const netLifespan = deductCost
    ? Math.max(0, grossLifespan - burnedLifespan)
    : grossLifespan;

  const currentRealm =
    netLifespan >= 6000
      ? '十四纪红尘主（可启新纪元荒坟回响）'
      : netLifespan >= 3500
      ? '阴阳平账境（横渡神鬼与末法洪流）'
      : netLifespan >= 1800
      ? '沧溟长生境（跨越凡俗、极昼极夜与仙门）'
      : netLifespan >= 500
      ? '青史养气境（文武匠道初融）'
      : netLifespan > 0
      ? '凡心初定境（初窥长生门径）'
      : '未入世（凡人初启）';

  return (
    <div className="space-y-16 pb-20">
      {/* Section 1: Core Longevity System Rules */}
      <section className="space-y-6 pt-2">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            红尘长生录 · 系统底层法则
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            本系统以「真实陪伴走完一世 + 自然假死退场」作为唯一结算门槛，杜绝无脑刷数值，让每一世都沉淀出独立成篇的文学质感。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SYSTEM_LAWS.map((law) => (
            <div
              key={law.index}
              className="bg-white border border-[#E4E4E7] rounded-xl p-6 space-y-3"
            >
              <div className="font-mono-num text-xs text-[#C81E1E] font-medium">
                法则 {law.index}
              </div>
              <h3 className="font-editorial text-lg font-semibold text-[#141413]">
                {law.title}
              </h3>
              <p className="text-sm leading-[1.75] text-[#3F3F46]">{law.rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Anti-Power-Fantasy Golden Finger Cost System */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            反龙傲天机制：金手指消耗与沉重代价
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            主角绝非无敌横推的“龙傲天”。每一世都受限于当世战力上限，强行越界动用前世道果或器物，必须支付真实、跨卷延续的沉重代价。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GOLDEN_FINGER_COSTS.map((cost) => (
            <div
              key={cost.code}
              className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="text-xs font-medium text-[#C81E1E]">{cost.code}</div>
                <h3 className="font-editorial text-lg font-semibold text-[#141413]">
                  {cost.title}
                </h3>
                <p className="text-sm leading-[1.75] text-[#3F3F46]">
                  {cost.mechanism}
                </p>
              </div>
              <div className="pt-3 border-t border-[#F4F4F5] text-xs leading-relaxed text-[#52525B]">
                正文落地：{cost.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Interactive Reward & Lifespan Burn Simulator */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
              长生结算与燃寿代价推演器
            </h2>
            <p className="text-sm text-[#52525B] max-w-2xl">
              勾选主角已完结的轮回卷章，可一键切换是否计入「越界动用金手指的燃寿损耗」，直观感受反龙傲天设定的收支平衡。
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDeductCost((v) => !v)}
            className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto ${
              deductCost
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
                : 'bg-white border-[#D4D4D8] text-[#52525B]'
            }`}
          >
            {deductCost ? '已计入燃寿税扣除' : '仅看毛结算寿元（未扣代价）'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Selectable Completed Worlds */}
          <div className="lg:col-span-5 space-y-2">
            {playableArcs.map((arc) => {
              const checked = completedIds.includes(arc.id);
              const burn = ARC_COST_YEARS[arc.id] ?? 30;
              return (
                <button
                  key={arc.id}
                  type="button"
                  onClick={() => toggleArcCompletion(arc.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer ${
                    checked
                      ? 'bg-white border-[#141413]'
                      : 'bg-[#F4F4F5]/60 border-[#E4E4E7] hover:bg-white'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                      checked
                        ? 'bg-[#141413] border-[#141413] text-white'
                        : 'bg-white border-[#A1A1AA]'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-[#141413] truncate">
                        {arc.indexLabel} · {arc.worldName}
                      </span>
                      <span className="font-mono-num text-xs shrink-0">
                        <span className="text-[#141413] font-medium">
                          +{arc.reward.lifespanYears}
                        </span>
                        {burn > 0 && (
                          <span className="text-[#C81E1E] ml-1.5">-{burn}</span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-[#52525B] mt-0.5 truncate">
                      {arc.reward.coreTrait} · {arc.reward.artifact}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Settlement Ledger */}
          <div className="lg:col-span-7 bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[#E4E4E7]">
              <div>
                <div className="text-xs text-[#71717A]">
                  {deductCost ? '净余可用寿元' : '毛结算累计寿元'}
                </div>
                <div className="font-mono-num text-3xl font-semibold text-[#141413] mt-1">
                  +{netLifespan.toLocaleString()} 年
                </div>
              </div>
              <div>
                <div className="text-xs text-[#71717A]">越界救人累计燃寿</div>
                <div className="font-mono-num text-3xl font-semibold text-[#C81E1E] mt-1">
                  -{burnedLifespan.toLocaleString()} 年
                </div>
              </div>
              <div>
                <div className="text-xs text-[#71717A]">当前长生道果阶段</div>
                <div className="text-sm font-semibold text-[#141413] mt-2.5">
                  {currentRealm}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-medium text-[#71717A]">
                已固化道果与随世支付的真实反噬记录（共 {completedArcs.length} 世）
              </div>
              {completedArcs.length === 0 ? (
                <p className="text-sm text-[#71717A] py-4">
                  尚未勾选任何已完结卷章，请从左侧选择以模拟主角的成长复利与代价消耗。
                </p>
              ) : (
                <div className="divide-y divide-[#F4F4F5] max-h-[420px] overflow-y-auto pr-1">
                  {completedArcs.map((arc) => (
                    <div
                      key={arc.id}
                      className="py-3 first:pt-0 last:pb-0 space-y-1"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <div>
                          <span className="text-sm font-medium text-[#141413]">
                            {arc.reward.coreTrait}
                          </span>
                          <span className="text-xs text-[#71717A] mx-2">·</span>
                          <span className="text-xs text-[#52525B]">
                            器物：{arc.reward.artifact}
                          </span>
                        </div>
                        <span className="text-xs text-[#71717A] shrink-0">
                          {arc.worldName}
                        </span>
                      </div>
                      <p className="text-xs text-[#71717A] leading-relaxed">
                        代价记录：{arc.costBalance.costPaid}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3.5: Differentiated Lifespan Tiers */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            不同背景角色寿元核定体系（破除“全员百年一刀切”）
          </h2>
          <p className="text-sm text-[#52525B] max-w-3xl">
            普通凡人严守百年寿命上限以衬托烟火珍贵；而武道奇遇、深海人鱼化龙、仙朝修仙与机械义体则按各自世界法则核定千载至万载寿元，逻辑自洽地支撑跨世守望与早期追夫。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LIFESPAN_TIER_MATRIX.map((tier) => (
            <div
              key={tier.tierCode}
              className="bg-white border border-[#E4E4E7] rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-mono-num font-semibold text-[#C81E1E]">
                    {tier.tierCode}
                  </span>
                  <span className="font-mono-num font-medium text-[#141413]">
                    {tier.lifespanRange}
                  </span>
                </div>
                <h3 className="font-editorial text-base font-semibold text-[#141413]">
                  {tier.category}
                </h3>
                <p className="text-xs leading-relaxed text-[#3F3F46]">{tier.mechanism}</p>
              </div>
              <div className="pt-3 border-t border-[#F4F4F5] space-y-1.5 text-xs leading-relaxed">
                <div className="text-[#141413] font-medium">
                  代表人物：{tier.representativeCharacters}
                </div>
                <div className="text-[#71717A]">约束与代价：{tier.constraintNote}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Polar Day / Polar Night / Twilight Geographic Plate System */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
              极昼极夜地图板块：光影、时间与伪装法则
            </h2>
            <p className="text-sm text-[#52525B] max-w-2xl">
              诸天十四世刻意控制空间尺度不无限铺开，按“光照与时间流动特征”划分为四大紧缩板块；板块规则直接决定主角的伪装难度、跑图代价与印记暴露方式。
            </p>
          </div>
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className="px-4 py-2 text-xs font-medium text-white bg-[#141413] hover:bg-[#27272A] rounded-md transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              打开 Three.js 3D 世界地图 →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MAP_SECTORS.map((sector) => (
            <div
              key={sector.key}
              className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="text-xs font-medium text-[#C81E1E]">
                  {sector.subtitle}
                </div>
                <h3 className="font-editorial text-lg font-semibold text-[#141413]">
                  {sector.name}
                </h3>
                <div className="text-xs font-medium text-[#3F3F46]">
                  归属世界：{sector.worldsIncluded}
                </div>
                <p className="text-sm leading-[1.7] text-[#3F3F46] pt-1">
                  {sector.illuminationRule}
                </p>
              </div>
              <div className="pt-3 border-t border-[#F4F4F5] space-y-1.5 text-xs leading-relaxed text-[#52525B]">
                <div>伪装与藏拙法则：{sector.disguiseImpact}</div>
                <div className="text-[#71717A]">代价联动：{sector.costTension}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: 6 Hit Short-Drama Tropes Integration */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            爆款短剧爽点适配：不龙傲天的六重高粘性钩子
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            吸收当前爆款短剧最强的情绪节奏与拉扯结构，全部改造为贴合“克制有代价”主基调的文学爽点。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHORT_DRAMA_TROPES.map((trope) => (
            <div
              key={trope.code}
              className="bg-white border border-[#E4E4E7] rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#C81E1E]">
                  {trope.code}
                </div>
                <h3 className="font-editorial text-base font-semibold text-[#141413]">
                  {trope.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#3F3F46]">
                  {trope.mechanism}
                </p>
              </div>
              <div className="pt-3 border-t border-[#F4F4F5] text-xs leading-relaxed text-[#71717A]">
                剧情落点：{trope.placement}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5.5: Pure-Mobility Skill System (Anti-Map-Bloat) */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            高机动跑图身法：{MOBILITY_SKILL_SPEC.summary}
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            {MOBILITY_SKILL_SPEC.designPurpose}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOBILITY_SKILL_SPEC.stages.map((st, idx) => (
            <div
              key={st.stage}
              className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-mono-num font-medium text-[#C81E1E]">
                    0{idx + 1} · {st.stage}
                  </span>
                  <span className="text-[#71717A]">{st.originArc}</span>
                </div>
                <h3 className="font-editorial text-lg font-semibold text-[#141413]">
                  {st.name}
                </h3>
                <p className="text-sm leading-[1.7] text-[#3F3F46]">
                  {st.speedEffect}
                </p>
              </div>
              <div className="pt-3 border-t border-[#F4F4F5] text-xs leading-relaxed text-[#52525B]">
                反龙傲天限制：{st.costAndLimit}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5.8: Cracked Phone Memory Relic (1% Battery Rule) */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            {PHONE_ARTIFACT_SPEC.title}
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            {PHONE_ARTIFACT_SPEC.coreRule}
          </p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#E4E4E7]">
            <div>
              <div className="text-xs font-medium text-[#C81E1E]">
                耗寿亮屏铁律（绝非商城外挂）
              </div>
              <p className="text-sm leading-relaxed text-[#27272A] mt-2">
                {PHONE_ARTIFACT_SPEC.burnCost}
              </p>
            </div>
            <div className="md:pl-6 md:border-l md:border-[#E4E4E7]">
              <div className="text-xs font-medium text-[#141413]">
                第十三卷 · 五元充电线跨世反转
              </div>
              <p className="text-sm leading-relaxed text-[#27272A] mt-2">
                {PHONE_ARTIFACT_SPEC.modernTwist}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PHONE_ARTIFACT_SPEC.logs.map((log) => (
              <div
                key={log.era}
                className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] space-y-2"
              >
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#141413]">{log.era}</span>
                  <span className="font-mono-num text-[#C81E1E]">{log.batteryUsed}</span>
                </div>
                <div className="text-xs text-[#71717A]">
                  伪装形态：{log.disguiseForm}
                </div>
                <p className="text-xs leading-relaxed text-[#3F3F46] pt-1">
                  {log.capturedMemory}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5.9: Core Soul System (Unextinguished Mortal Soul) */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            {PROTAGONIST_SOUL_SPEC.title}
          </h2>
          <p className="text-sm text-[#52525B] max-w-3xl">
            {PROTAGONIST_SOUL_SPEC.coreConcept}
          </p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-8">
          <div className="pb-6 border-b border-[#E4E4E7]">
            <div className="text-xs font-medium text-[#C81E1E]">
              反龙傲天灵魂铁律（魂印破绽大于战力加成）
            </div>
            <p className="text-sm leading-relaxed text-[#27272A] mt-2">
              {PROTAGONIST_SOUL_SPEC.antiPowerLimit}
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-medium text-[#71717A]">
              三大不可篡改灵魂指纹（换十四具皮囊仍被旧人精准认出）
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PROTAGONIST_SOUL_SPEC.soulFingerprints.map((fp) => (
                <div
                  key={fp.name}
                  className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] space-y-2"
                >
                  <div className="text-sm font-semibold text-[#141413]">{fp.name}</div>
                  <div className="text-xs text-[#C81E1E]">{fp.origin}</div>
                  <p className="text-xs leading-relaxed text-[#3F3F46]">{fp.clueEffect}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E4E4E7]">
            <div className="text-xs font-medium text-[#71717A]">
              四阶灵魂年轮演化（抗疯狂沉降机制）
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PROTAGONIST_SOUL_SPEC.soulStages.map((st, idx) => (
                <div
                  key={st.stage}
                  className="p-4 rounded-lg border border-[#E4E4E7] space-y-1.5"
                >
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-mono-num font-semibold text-[#141413]">
                      0{idx + 1} · {st.stage}
                    </span>
                    <span className="text-[#71717A]">{st.span}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#3F3F46]">{st.mechanism}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5.95: Chasing-Husband Heroine Spec (Cui Mingyue) */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            追夫女主角专设 · {CHASING_HUSBAND_SPEC.heroineName}
          </h2>
          <p className="text-sm text-[#52525B] max-w-3xl">
            {CHASING_HUSBAND_SPEC.originArc} · {CHASING_HUSBAND_SPEC.identityShift}
          </p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#E4E4E7]">
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-[#C81E1E]">
                  早启契机（第二卷末看破死遁 · 遇奇遇破百年限）
                </div>
                <p className="text-sm leading-relaxed text-[#27272A] mt-1.5">
                  {CHASING_HUSBAND_SPEC.turningPoint}
                </p>
              </div>
              <div>
                <div className="text-xs font-medium text-[#71717A]">跨世追踪凭证</div>
                <p className="text-sm font-medium text-[#141413] mt-1">
                  {CHASING_HUSBAND_SPEC.bindingRelic}
                </p>
              </div>
            </div>
            <div className="space-y-3 md:pl-6 md:border-l md:border-[#E4E4E7]">
              <div>
                <div className="text-xs font-medium text-[#C81E1E]">跨界追踪男主方式</div>
                <p className="text-sm leading-relaxed text-[#27272A] mt-1.5">
                  {CHASING_HUSBAND_SPEC.chasingStyle}
                </p>
              </div>
              <div>
                <div className="text-xs font-medium text-[#71717A]">男主躲避与缩地跑路反应</div>
                <p className="text-xs leading-relaxed text-[#3F3F46] mt-1">
                  {CHASING_HUSBAND_SPEC.protagonistReaction}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CHASING_HUSBAND_SPEC.scenes.map((scene) => (
              <div
                key={scene.title}
                className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] space-y-2"
              >
                <div className="text-xs font-medium text-[#C81E1E]">{scene.era}</div>
                <h3 className="font-editorial text-base font-semibold text-[#141413]">
                  {scene.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#3F3F46]">{scene.tensionBeat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5.98: Female Apprentice Ambiguity & Romantic Tension */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            女徒弟情感线强化：超越普通师徒的暧昧与冲师张力
          </h2>
          <p className="text-sm text-[#52525B] max-w-3xl">
            摒弃清汤寡水的单向报恩，在“老头伪装意外暴露、蜕鳞寒毒与盲区贴面试探”中逐步挑破男女暧昧界限，让假死后的守望与撬棺重逢更具情感爆发力。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {APPRENTICE_ROMANCE_ARCS.map((arc) => (
            <div
              key={arc.characterName}
              className="bg-white border border-[#E4E4E7] rounded-xl p-6 space-y-4"
            >
              <div className="pb-3 border-b border-[#E4E4E7]">
                <div className="text-xs font-medium text-[#C81E1E]">{arc.originArc}</div>
                <h3 className="font-editorial text-lg font-semibold text-[#141413] mt-1">
                  {arc.characterName}
                </h3>
                <div className="text-xs text-[#71717A] mt-0.5">{arc.surfaceBond}</div>
              </div>
              <div className="space-y-2.5 text-xs leading-relaxed">
                <div>
                  <span className="font-medium text-[#141413]">界限松动契机：</span>
                  <span className="text-[#3F3F46]">{arc.ambiguityTrigger}</span>
                </div>
                <div>
                  <span className="font-medium text-[#C81E1E]">暧昧拉扯名场面：</span>
                  <span className="text-[#27272A]">{arc.signatureMoment}</span>
                </div>
                <div className="pt-2 border-t border-[#F4F4F5] text-[#52525B]">
                  <span className="font-medium text-[#141413]">跨世情绪回收：</span>
                  {arc.emotionalPayoff}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: Multi-World Architectural Comparison Matrix */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            十四维跨纪元场景世界观矩阵
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            涵盖凡俗古纪、边城父子、雾都暗巷、东方仙门、极昼极夜异境、九幽冥界与天庭官僚、架空现代都市与永冬末世废土，确保每一卷切换都带来截然不同的题材张力与美学风格。
          </p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#E4E4E7] text-xs font-medium text-[#71717A] bg-[#FAFAFA]">
                <th className="py-3.5 px-5">场景世界</th>
                <th className="py-3.5 px-5">地理板块与基调</th>
                <th className="py-3.5 px-5">力量与社会秩序</th>
                <th className="py-3.5 px-5">核心视觉意象</th>
                <th className="py-3.5 px-5">假死与伪装法则</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7] text-sm">
              {WORLD_MATRIX.map((w) => (
                <tr key={w.worldKey} className="hover:bg-[#FAFAFA]/70 align-top">
                  <td className="py-4 px-5 font-editorial font-semibold text-[#141413] whitespace-nowrap">
                    {w.name}
                  </td>
                  <td className="py-4 px-5 text-[#52525B] whitespace-nowrap">
                    <div className="text-xs font-medium text-[#C81E1E]">
                      {w.sectorLabel}
                    </div>
                    <div className="mt-1">{w.eraTone}</div>
                  </td>
                  <td className="py-4 px-5 text-[#27272A] leading-relaxed">
                    {w.powerSystem}
                    <div className="text-xs text-[#71717A] mt-1">{w.socialOrder}</div>
                  </td>
                  <td className="py-4 px-5 text-[#3F3F46] leading-relaxed">
                    {w.visualMotifs}
                  </td>
                  <td className="py-4 px-5 text-[#3F3F46] leading-relaxed">
                    {w.disguiseRule}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Collapsible Short-Drama / Image-to-Video Adaptation Appendix */}
      <section className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdaptation((v) => !v)}
          className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-[#FAFAFA] transition-colors cursor-pointer"
        >
          <div>
            <div className="text-xs font-medium text-[#C81E1E]">
              影视化与短剧改编备忘
            </div>
            <h3 className="font-editorial text-xl font-semibold text-[#141413] mt-1">
              {ADAPTATION_BLUEPRINT.openingTitle}
            </h3>
          </div>
          {showAdaptation ? (
            <ChevronUp className="w-5 h-5 text-[#71717A] shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#71717A] shrink-0" />
          )}
        </button>

        {showAdaptation && (
          <div className="px-6 pb-8 pt-2 border-t border-[#E4E4E7] space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <div className="text-xs font-medium text-[#71717A]">
                  90 秒开场分镜节奏（定格台词）
                </div>
                <p className="font-editorial text-lg font-semibold text-[#141413]">
                  {ADAPTATION_BLUEPRINT.hookLine}
                </p>
                <p className="text-sm text-[#52525B] leading-relaxed">
                  {ADAPTATION_BLUEPRINT.pacingComparison}
                </p>
                <ol className="space-y-2.5 pt-2">
                  {ADAPTATION_BLUEPRINT.storyboardBeats.map((line, i) => (
                    <li
                      key={i}
                      className="text-sm text-[#27272A] leading-relaxed font-mono-num"
                    >
                      {line}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-4 lg:pl-8 lg:border-l lg:border-[#E4E4E7]">
                <div className="text-xs font-medium text-[#71717A]">
                  图生视频链路四大制作痛点与对策
                </div>
                <div className="divide-y divide-[#F4F4F5]">
                  {ADAPTATION_BLUEPRINT.fourPitfalls.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0">
                      <div className="text-sm font-medium text-[#141413]">
                        0{idx + 1}. {item.pitfall}
                      </div>
                      <p className="text-xs text-[#52525B] leading-relaxed mt-1">
                        {item.countermeasure}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

