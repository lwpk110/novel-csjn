import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  ADAPTATION_BLUEPRINT,
  GOLDEN_FINGER_COSTS,
  SYSTEM_LAWS,
  WORLD_MATRIX,
} from '../data/novelData';
import { StoryArc } from '../types/novel';

interface WorldSystemViewProps {
  arcs: StoryArc[];
}

const ARC_COST_YEARS: Record<string, number> = {
  'arc-county': 0,
  'arc-dynasty': 18,
  'arc-atlantis': 95,
  'arc-sect': 60,
  'arc-skywhale': 140,
  'arc-mirror-desert': 200,
  'arc-lantern-market': 160,
  'arc-alt-modern': 120,
  'arc-alt-apocalypse': 380,
};

export const WorldSystemView: React.FC<WorldSystemViewProps> = ({ arcs }) => {
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
    netLifespan >= 4500
      ? '九纪红尘境（可启新纪元荒坟回响）'
      : netLifespan >= 2500
      ? '踏破光阴境（横渡幻想与末法洪流）'
      : netLifespan >= 1200
      ? '沧溟长生境（跨越凡俗与仙门枷锁）'
      : netLifespan >= 300
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

      {/* Section 4: Multi-World Architectural Comparison Matrix */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            九维跨纪元场景世界观矩阵
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            涵盖凡俗古纪、东方仙门、四大幻想异境、架空现代都市与永冬末世废土，确保每一卷切换都带来截然不同的题材张力与美学风格。
          </p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-[#E4E4E7] text-xs font-medium text-[#71717A] bg-[#FAFAFA]">
                <th className="py-3.5 px-5">场景世界</th>
                <th className="py-3.5 px-5">时代基调</th>
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
                    {w.eraTone}
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

