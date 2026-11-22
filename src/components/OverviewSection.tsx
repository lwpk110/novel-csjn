import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import {
  CIVILIZATION_TIMELINE,
  DELAYED_CLUE_CHAINS,
  HERO_ARTWORK,
  LOOP_STAGES,
  NOVEL_META,
  RELATIONSHIP_EDGES,
} from '../data/novelData';
import { StoryArc } from '../types/novel';

interface OverviewSectionProps {
  arcs: StoryArc[];
  onNavigateTab: (tab: 'overview' | 'outline' | 'graph' | 'world') => void;
  onSelectArc: (arcId: string) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  arcs,
  onNavigateTab,
  onSelectArc,
}) => {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [revealedChains, setRevealedChains] = useState<Record<string, boolean>>({
    'chain-1': true,
  });
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const totalLifespan = arcs.reduce((sum, a) => sum + a.reward.lifespanYears, 0);
  const standaloneCount = arcs.filter((a) => a.worldKey !== 'convergence').length;
  const hiddenThreadCount = RELATIONSHIP_EDGES.filter((e) => e.type === 'hidden').length;
  const activeStage = LOOP_STAGES[activeStageIdx];

  const toggleChainReveal = (id: string) => {
    setRevealedChains((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Split-Screen Editorial Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pt-4">
        <div className="lg:col-span-6 flex flex-col justify-between py-2">
          <div className="space-y-6">
            <p className="text-xs font-medium text-[#71717A] tracking-wide">
              跨纪元长生设定集 · 反龙傲天有代价 · 延迟伏笔契子
            </p>
            <h1
              className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-[#141413] leading-[1.22]"
              style={{ textWrap: 'balance' }}
            >
              红尘百世独立成篇，
              <br />
              草蛇灰线暗连万古。
            </h1>
            <p className="text-[15px] leading-[1.8] text-[#3F3F46] max-w-[60ch]">
              {NOVEL_META.corePremise}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-8">
            <button
              type="button"
              onClick={() => onNavigateTab('outline')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#141413] hover:bg-[#27272A] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C81E1E]"
            >
              <span>查阅 {standaloneCount + 1} 卷独立大纲</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('graph')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#141413] hover:text-[#C81E1E] underline underline-offset-4 decoration-[#D4D4D8] hover:decoration-[#C81E1E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>探索人物与暗线图谱</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative w-full h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden border border-[#E4E4E7] bg-[#18181B]">
            {!heroImgFailed ? (
              <img
                src={HERO_ARTWORK}
                alt="古碑青灯与落花山海意象图"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#1C1917] to-[#27272A] text-[#E4E4E7]">
                <p className="font-editorial text-xl">长生纪年 · 红尘百世</p>
                <p className="text-xs text-[#A1A1AA] mt-2">荒坟青灯 · 桃李万古</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-6 py-5">
              <p className="text-xs text-white/80">
                横跨九大纪元：从凡尘青溪、深海云鲸到霓虹旧港与永冬方舟
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width 4-Column Key Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-y border-[#E4E4E7] divide-y lg:divide-y-0 lg:divide-x divide-[#E4E4E7]">
        <div className="py-6 pr-6">
          <div className="font-mono-num text-2xl sm:text-3xl font-semibold text-[#141413]">
            {standaloneCount} + 1
          </div>
          <div className="text-xs text-[#71717A] mt-1.5">
            古纪 / 幻想 / 现代 / 末世独立卷章
          </div>
        </div>
        <div className="py-6 lg:px-6 pl-6 lg:pl-6">
          <div className="font-mono-num text-2xl sm:text-3xl font-semibold text-[#141413]">
            4 大代价
          </div>
          <div className="text-xs text-[#71717A] mt-1.5">
            燃寿税 · 感官典当 · 因果信标 · 反龙傲天
          </div>
        </div>
        <div className="py-6 pr-6 lg:px-6">
          <div className="font-mono-num text-2xl sm:text-3xl font-semibold text-[#C81E1E]">
            +{totalLifespan.toLocaleString()} 年
          </div>
          <div className="text-xs text-[#71717A] mt-1.5">
            九世累计结算寿元（未扣越界损耗）
          </div>
        </div>
        <div className="py-6 pl-6">
          <div className="font-mono-num text-2xl sm:text-3xl font-semibold text-[#141413]">
            {hiddenThreadCount} 条
          </div>
          <div className="text-xs text-[#71717A] mt-1.5">
            跨纪元隐线与无旁白读者推理契子
          </div>
        </div>
      </section>

      {/* Civilization Time Torrent Progression */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            时间洪流：文明跨纪元演进轴
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            主角的漫长生命本身就是一部文明编年史——从灵盛古纪步入幻想奇境，再顺着灵气退潮见证架空现代与永冬废土，最终迎来新一轮灵气复苏。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CIVILIZATION_TIMELINE.map((stage, idx) => (
            <div
              key={stage.era}
              className="bg-white border border-[#E4E4E7] rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono-num text-xs font-medium text-[#C81E1E]">
                    0{idx + 1}
                  </span>
                  <span className="text-xs text-[#71717A]">{stage.span}</span>
                </div>
                <h3 className="font-editorial text-base font-semibold text-[#141413]">
                  {stage.era}
                </h3>
                <div className="text-xs font-medium text-[#3F3F46]">
                  {stage.worlds}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#52525B] pt-3 border-t border-[#F4F4F5]">
                {stage.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive 4-Stage Core Narrative Engine */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
            核心叙事循环：四段式长生引擎
          </h2>
          <p className="text-sm text-[#52525B] max-w-2xl">
            每一世都完整走完“入世—陪伴—假死—结算”的闭环，确保单卷独立出彩、绝不龙傲天，同时为数卷之后埋下因果楔子。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LOOP_STAGES.map((stage, idx) => {
            const isActive = idx === activeStageIdx;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStageIdx(idx)}
                className={`text-left p-5 rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C81E1E] ${
                  isActive
                    ? 'bg-white border-[#141413]'
                    : 'bg-[#F4F4F5]/60 border-[#E4E4E7] hover:bg-white hover:border-[#A1A1AA]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`font-mono-num text-xs font-medium ${
                      isActive ? 'text-[#C81E1E]' : 'text-[#71717A]'
                    }`}
                  >
                    {stage.step}
                  </span>
                  <span className="text-xs text-[#71717A] truncate">
                    {stage.subtitle}
                  </span>
                </div>
                <div className="font-editorial text-lg font-semibold text-[#141413] mt-3">
                  {stage.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail Panel */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-6 border-b border-[#E4E4E7]">
            <div>
              <span className="font-mono-num text-xs text-[#C81E1E] font-medium">
                第 {activeStage.step} 环 · {activeStage.subtitle}
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#141413] mt-1">
                {activeStage.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#71717A]">
              <span>循环定位</span>
              <span aria-hidden="true">/</span>
              <span>单卷可独立完结，尾声隐埋跨世契子</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-medium text-[#71717A] mb-2">
                  叙事功能与结构任务
                </h4>
                <p className="text-[15px] leading-relaxed text-[#27272A]">
                  {activeStage.narrativePurpose}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[#71717A] mb-2">
                  核心情绪钩子
                </h4>
                <p className="text-[15px] leading-relaxed text-[#27272A]">
                  {activeStage.emotionalHook}
                </p>
              </div>
            </div>

            <div className="space-y-5 md:pl-8 md:border-l md:border-[#E4E4E7]">
              <div>
                <h4 className="text-xs font-medium text-[#71717A] mb-2">
                  长篇连载写作手法
                </h4>
                <p className="text-[15px] leading-relaxed text-[#27272A]">
                  {activeStage.writingTip}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[#C81E1E] mb-2">
                  漫剧 / 图生视频改编提示
                </h4>
                <p className="text-[15px] leading-relaxed text-[#27272A]">
                  {activeStage.adaptationNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delayed Clue Chains: Non-Immediate Reader Puzzle Thrills */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
              草蛇灰线：延迟伏笔契子（留白式智识爽点）
            </h2>
            <p className="text-sm text-[#52525B] max-w-2xl">
              不靠系统旁白硬科普，而在某一世随手埋下看似普通的细节，隔三五卷后在截然不同的时代重新出现，让读者自己拼出真相、收获“原来早就埋好了”的顶级爽感。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DELAYED_CLUE_CHAINS.map((chain) => {
            const isRevealed = Boolean(revealedChains[chain.id]);
            return (
              <div
                key={chain.id}
                className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-medium text-[#C81E1E]">
                      {chain.plantedArc}
                    </span>
                    <span className="text-[#71717A]">{chain.echoArcs}</span>
                  </div>
                  <h3 className="font-editorial text-lg font-semibold text-[#141413]">
                    {chain.name}
                  </h3>
                  <div>
                    <div className="text-xs text-[#71717A] mb-1">
                      初读表象（当卷绝不点破）
                    </div>
                    <p className="text-sm leading-relaxed text-[#3F3F46]">
                      {chain.surfaceDetail}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4E4E7] space-y-3">
                  <button
                    type="button"
                    onClick={() => toggleChainReveal(chain.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#141413] hover:text-[#C81E1E] transition-colors cursor-pointer"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>收起隔世咬合真相</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>点击揭晓数卷后的推理爽点</span>
                      </>
                    )}
                  </button>
                  {isRevealed && (
                    <p className="text-xs leading-relaxed text-[#27272A] bg-[#FAFAFA] p-3.5 rounded-lg border border-[#E4E4E7]">
                      {chain.delayedReveal}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Standalone Arcs & Hidden Cross-Era Threads Directory */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-[28px] font-semibold text-[#141413]">
              九世诸界与暗线伏笔总览
            </h2>
            <p className="text-sm text-[#52525B] max-w-2xl">
              从青溪县城到永冬方舟，任抽一卷皆可独立阅读；点击任意一卷即可进入细纲编辑器查阅本世延迟契子与金手指代价。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('world')}
            className="text-sm font-medium text-[#141413] hover:text-[#C81E1E] underline underline-offset-4 decoration-[#D4D4D8] hover:decoration-[#C81E1E] transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            查看反龙傲天代价体系与世界矩阵
          </button>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl divide-y divide-[#E4E4E7] overflow-hidden">
          {arcs.map((arc) => (
            <button
              key={arc.id}
              type="button"
              onClick={() => {
                onSelectArc(arc.id);
                onNavigateTab('outline');
              }}
              className="w-full text-left p-5 sm:p-6 hover:bg-[#FAFAFA] transition-colors flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 cursor-pointer group"
            >
              <div className="lg:w-44 shrink-0">
                <div className="text-xs font-medium text-[#C81E1E]">
                  {arc.indexLabel} · {arc.worldName}
                </div>
                <div className="text-xs text-[#71717A] mt-1">
                  {arc.identityType}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-editorial text-lg font-semibold text-[#141413] group-hover:text-[#C81E1E] transition-colors">
                  {arc.title}
                </div>
                <p className="text-sm text-[#52525B] mt-1 line-clamp-2">
                  {arc.independentTheme}
                </p>
              </div>

              <div className="lg:w-64 shrink-0 lg:border-l lg:border-[#E4E4E7] lg:pl-6">
                <div className="text-xs text-[#71717A]">延迟契子与隐线</div>
                <div className="text-sm font-medium text-[#141413] mt-0.5 truncate">
                  {arc.foreshadowing.relicName}
                </div>
                <div className="text-xs text-[#71717A] mt-1 font-mono-num">
                  {arc.reward.lifespanYears > 0
                    ? `结算寿元 +${arc.reward.lifespanYears} 年`
                    : '九纪伏笔总收束'}
                </div>
              </div>

              <div className="hidden lg:flex items-center text-[#71717A] group-hover:text-[#141413] transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

