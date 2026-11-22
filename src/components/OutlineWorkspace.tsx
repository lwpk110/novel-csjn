import React, { useState } from 'react';
import { Check, Edit3, Plus, X } from 'lucide-react';
import { ChapterBeat, StoryArc, WorldKey } from '../types/novel';
import { CHARACTER_NODES, HERO_ARTWORK } from '../data/novelData';

interface OutlineWorkspaceProps {
  arcs: StoryArc[];
  selectedArcId: string;
  onSelectArc: (id: string) => void;
  onUpdateArc: (updated: StoryArc) => void;
  onAddArc: (newArc: StoryArc) => void;
}

type EraFilterKey = 'all' | 'ancient' | 'fantasy' | 'celestial_nether' | 'future' | 'convergence';

const ERA_FILTERS: { key: EraFilterKey; label: string; worlds?: WorldKey[] }[] = [
  { key: 'all', label: '全部卷章' },
  {
    key: 'ancient',
    label: '第一纪 · 凡尘父子与暗巷',
    worlds: ['county', 'dynasty', 'blacksmith', 'nightwatch', 'sect'],
  },
  {
    key: 'fantasy',
    label: '第二纪 · 极昼极夜奇境',
    worlds: ['atlantis', 'skywhale', 'mirror_desert', 'twilight', 'lantern_market'],
  },
  {
    key: 'celestial_nether',
    label: '第三纪 · 冥界与天界',
    worlds: ['nether', 'heaven'],
  },
  {
    key: 'future',
    label: '第四纪 · 现代与末世',
    worlds: ['alt_modern', 'alt_apocalypse'],
  },
  { key: 'convergence', label: '荒坟回响', worlds: ['convergence'] },
];

export const OutlineWorkspace: React.FC<OutlineWorkspaceProps> = ({
  arcs,
  selectedArcId,
  onSelectArc,
  onUpdateArc,
  onAddArc,
}) => {
  const [eraFilter, setEraFilter] = useState<EraFilterKey>('all');
  const [editingBeatId, setEditingBeatId] = useState<string | null>(null);
  const [beatDraft, setBeatDraft] = useState<{
    title: string;
    summary: string;
    keyScene: string;
  }>({ title: '', summary: '', keyScene: '' });

  const [editingForeshadow, setEditingForeshadow] = useState(false);
  const [foreshadowDraft, setForeshadowDraft] = useState({
    relicName: '',
    hiddenConnection: '',
    futurePayoff: '',
  });

  const [showAddArcModal, setShowAddArcModal] = useState(false);
  const [newArcForm, setNewArcForm] = useState({
    worldName: '',
    title: '',
    identityType: '异域游历 · 师徒同行',
    protagonistAlias: '',
    companionName: '',
    independentTheme: '',
    deathMethod: '',
    lifespanYears: 200,
    coreTrait: '',
    artifact: '',
    relicName: '',
    futurePayoff: '',
    costPaid: '',
  });

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const activeFilterObj = ERA_FILTERS.find((f) => f.key === eraFilter);
  const filteredArcs =
    eraFilter === 'all' || !activeFilterObj?.worlds
      ? arcs
      : arcs.filter((arc) => activeFilterObj.worlds!.includes(arc.worldKey));

  const activeArc =
    filteredArcs.find((a) => a.id === selectedArcId) ||
    filteredArcs[0] ||
    arcs[0];

  const startEditBeat = (beat: ChapterBeat) => {
    setEditingBeatId(beat.id);
    setBeatDraft({
      title: beat.title,
      summary: beat.summary,
      keyScene: beat.keyScene,
    });
  };

  const saveEditBeat = () => {
    if (!activeArc || !editingBeatId) return;
    const updatedBeats = activeArc.beats.map((b) =>
      b.id === editingBeatId
        ? {
            ...b,
            title: beatDraft.title.trim() || b.title,
            summary: beatDraft.summary.trim() || b.summary,
            keyScene: beatDraft.keyScene.trim() || b.keyScene,
          }
        : b
    );
    onUpdateArc({ ...activeArc, beats: updatedBeats });
    setEditingBeatId(null);
  };

  const handleAddBeat = () => {
    if (!activeArc) return;
    const nextBeat: ChapterBeat = {
      id: `beat-${Date.now()}`,
      phase: '承·岁月羁绊',
      title: '新增独立情节节点',
      summary: '在此补充本世的独立日常、转折或情感羁绊细节。',
      keyScene: '补充最具画面感的核心镜头或台词。',
    };
    onUpdateArc({
      ...activeArc,
      beats: [...activeArc.beats, nextBeat],
    });
    startEditBeat(nextBeat);
  };

  const startEditForeshadow = () => {
    if (!activeArc) return;
    setForeshadowDraft({
      relicName: activeArc.foreshadowing.relicName,
      hiddenConnection: activeArc.foreshadowing.hiddenConnection,
      futurePayoff: activeArc.foreshadowing.futurePayoff,
    });
    setEditingForeshadow(true);
  };

  const saveForeshadow = () => {
    if (!activeArc) return;
    onUpdateArc({
      ...activeArc,
      foreshadowing: {
        ...activeArc.foreshadowing,
        relicName: foreshadowDraft.relicName.trim() || activeArc.foreshadowing.relicName,
        hiddenConnection:
          foreshadowDraft.hiddenConnection.trim() ||
          activeArc.foreshadowing.hiddenConnection,
        futurePayoff:
          foreshadowDraft.futurePayoff.trim() || activeArc.foreshadowing.futurePayoff,
      },
    });
    setEditingForeshadow(false);
  };

  const handleCreateArc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArcForm.worldName.trim() || !newArcForm.title.trim()) return;
    const nextIndex = arcs.length + 1;
    const created: StoryArc = {
      id: `arc-custom-${Date.now()}`,
      indexLabel: `第 ${nextIndex} 卷`,
      worldKey: 'county',
      worldName: newArcForm.worldName.trim(),
      mapSector: 'normal',
      sectorLabel: '常昼常夜板块',
      title: newArcForm.title.trim(),
      subtitle: `${newArcForm.identityType.trim()} · 独立轮回卷章`,
      identityType: newArcForm.identityType.trim() || '异世轮回',
      protagonistAlias: newArcForm.protagonistAlias.trim() || '无名氏',
      eraSpan: '一世春秋（约 60 载）',
      companionName: newArcForm.companionName.trim() || '有缘故人',
      companionRole: '本世核心羁绊对象',
      imageUrl: HERO_ARTWORK,
      independentTheme:
        newArcForm.independentTheme.trim() ||
        '独立完整的异世人生篇章，不依赖前文即可成戏。',
      logline:
        newArcForm.independentTheme.trim() ||
        '主角以全新身份坠入此界，陪伴核心对象走完一世后假死脱身。',
      deathMethod:
        newArcForm.deathMethod.trim() || '功成身退之际借机假死老去，悄然换界。',
      thrillHook: {
        label: '克制破局 + 跨世余韵',
        detail:
          newArcForm.independentTheme.trim() ||
          '依靠当世身份与多年沉淀的手艺破局，假死后留下令故人追悔或寻踪的跨世伏笔。',
      },
      beats: [
        {
          id: `nb-1-${Date.now()}`,
          phase: '起·入世立身',
          title: '换界初临，立身新世',
          summary: `主角化名${newArcForm.protagonistAlias || '无名旅人'}进入${newArcForm.worldName}，建立本世日常身份。`,
          keyScene: '初见本世核心羁绊人物的标志性画面。',
        },
        {
          id: `nb-2-${Date.now()}`,
          phase: '承·岁月羁绊',
          title: '数十载相伴，沉淀光阴',
          summary: `与${newArcForm.companionName || '有缘故人'}共同经历本世风霜，建立真挚情感。`,
          keyScene: '最能体现本世烟火气或奇观质感的日常细节。',
        },
        {
          id: `nb-3-${Date.now()}`,
          phase: '合·假死老去',
          title: '缘尽身退，系统结算',
          summary: newArcForm.deathMethod.trim() || '假死脱身，留下微末旧物作为后世引子。',
          keyScene: '告别瞬间与系统结算提示。',
        },
      ],
      reward: {
        lifespanYears: Number(newArcForm.lifespanYears) || 200,
        coreTrait: newArcForm.coreTrait.trim() || '岁月沉淀（新词条）',
        traitEffect: '由本世漫长人生淬炼出的永久被动感悟与技艺。',
        artifact: newArcForm.artifact.trim() || '旧世遗珍',
        artifactDesc: '承载本世记忆与规则碎片的随身旧物。',
        settlementGrade: '甲上 · 独立成篇',
      },
      foreshadowing: {
        relicName: newArcForm.relicName.trim() || '无名旧物',
        dormantYears: '蛰伏数百年',
        hiddenConnection: '表面与主线无关，却在千年后成为串联主角过往身份的关键物证。',
        futurePayoff:
          newArcForm.futurePayoff.trim() ||
          '在未来某个新世界或终局荒坟夜里产生跨世回响。',
      },
      clueWedge: {
        clueDetail: `本世留下的微末生活习惯或器物细节（${newArcForm.relicName.trim() || '无名旧物'}），当卷绝不点破。`,
        echoesInWorld: '隔世咬合：待后续新世界或终局回响卷自然呼应',
        readerAhaMoment: '当读者在数卷后的陌生时代再次遇见同一微末细节，自行推演出主角踪迹。',
      },
      costBalance: {
        abilityUsed: '受限于当世法则，仅在危急关头克制动用过往技艺破局。',
        costPaid:
          newArcForm.costPaid.trim() ||
          '越界催动金手指消耗数十年寿元，并留下短暂感官反噬与因果破绽。',
        restraintThrill: '反龙傲天克制爽点：依靠跨世沉淀的阅历与手艺，而非数值碾压。',
      },
      soulSetting: {
        protagonistSoulState:
          '未烬凡心魂开启“岁月沉降阀”，保持清醒温和的凡人心境，仅在越界动用往世印记时渗出微弱魂纹破绽。',
        companionSoulSpec: `${newArcForm.companionName.trim() || '有缘故人'}：因本世数十年朝夕相伴，神魂深处烙下无可替代的岁月初印与守望执念。`,
        soulResonance:
          '当卷假死后沉淀出全新一道灵魂年轮，旧物与微末动作习惯会在遥远纪元再度共鸣认人。',
      },
    };
    onAddArc(created);
    onSelectArc(created.id);
    setEraFilter('all');
    setShowAddArcModal(false);
    setNewArcForm({
      worldName: '',
      title: '',
      identityType: '异域游历 · 师徒同行',
      protagonistAlias: '',
      companionName: '',
      independentTheme: '',
      deathMethod: '',
      lifespanYears: 200,
      coreTrait: '',
      artifact: '',
      relicName: '',
      futurePayoff: '',
      costPaid: '',
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Workspace Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-1 p-1 bg-[#F4F4F5] rounded-lg overflow-x-auto">
          {ERA_FILTERS.map((item) => {
            const active = eraFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setEraFilter(item.key);
                  const firstMatch =
                    item.key === 'all' || !item.worlds
                      ? arcs[0]
                      : arcs.find((a) => item.worlds!.includes(a.worldKey));
                  if (firstMatch) onSelectArc(firstMatch.id);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-[#52525B] hover:text-[#141413]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowAddArcModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#141413] bg-white border border-[#D4D4D8] hover:border-[#141413] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增一世独立卷章</span>
        </button>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Arc Index */}
        <aside className="lg:col-span-4 space-y-2 lg:sticky lg:top-24">
          <div className="text-xs font-medium text-[#71717A] pb-2">
            卷章目录（共 {filteredArcs.length} 卷）
          </div>
          {filteredArcs.map((arc) => {
            const isSelected = activeArc?.id === arc.id;
            return (
              <button
                key={arc.id}
                type="button"
                onClick={() => {
                  onSelectArc(arc.id);
                  setEditingBeatId(null);
                  setEditingForeshadow(false);
                }}
                className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#141413]'
                    : 'bg-transparent border-[#E4E4E7] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={isSelected ? 'text-[#C81E1E] font-medium' : 'text-[#71717A]'}>
                    {arc.indexLabel} · {arc.worldName}
                  </span>
                  <span className="font-mono-num text-[#71717A]">
                    {arc.reward.lifespanYears > 0 ? `+${arc.reward.lifespanYears}年` : '收束卷'}
                  </span>
                </div>
                <div className="font-editorial text-base font-semibold text-[#141413] mt-1.5">
                  {arc.title}
                </div>
                <div className="text-xs text-[#52525B] mt-1 truncate">
                  {arc.identityType} · {arc.companionName}
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right Detailed Editorial Dossier */}
        {activeArc && (
          <article className="lg:col-span-8 bg-white border border-[#E4E4E7] rounded-xl overflow-hidden">
            {/* Artwork Banner */}
            <div className="relative h-56 sm:h-72 bg-[#18181B]">
              {!imgErrors[activeArc.id] ? (
                <img
                  src={activeArc.imageUrl}
                  alt={`${activeArc.worldName}场景插画`}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [activeArc.id]: true }))
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#1C1917] text-[#E4E4E7] p-6">
                  <span className="font-editorial text-2xl">{activeArc.worldName}</span>
                  <span className="text-xs text-[#A1A1AA] mt-1">{activeArc.title}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
                <div className="text-xs text-white/80">
                  {activeArc.indexLabel} · {activeArc.worldName} · {activeArc.sectorLabel} · {activeArc.identityType}
                </div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-1.5">
                  {activeArc.title}
                </h2>
                <p className="text-sm text-white/85 mt-1">{activeArc.subtitle}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-10">
              {/* Unboxed Metadata Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-[#E4E4E7]">
                <div>
                  <div className="text-xs text-[#71717A]">主角当世身份</div>
                  <div className="text-sm font-medium text-[#141413] mt-1">
                    {activeArc.protagonistAlias}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#71717A]">核心羁绊人物</div>
                  <div className="text-sm font-medium text-[#141413] mt-1">
                    {activeArc.companionName}
                  </div>
                  <div className="text-xs text-[#71717A] mt-0.5">
                    {activeArc.companionRole}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#71717A]">在世光阴跨度</div>
                  <div className="text-sm font-medium text-[#141413] mt-1 font-mono-num">
                    {activeArc.eraSpan}
                  </div>
                </div>
              </div>

              {/* Independent Theme & Departure Design */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#141413]">
                  01. 单卷独立看点与退场设计
                </h3>
                <p className="text-[15px] leading-[1.8] text-[#27272A]">
                  {activeArc.logline}
                </p>
                <div className="pt-4 border-t border-[#E4E4E7]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-[#C81E1E]">
                      当卷核心爽点
                    </span>
                    <span className="text-xs font-medium text-[#141413]">
                      {activeArc.thrillHook.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#27272A] mt-2">
                    {activeArc.thrillHook.detail}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                  <div className="pt-4 border-t border-[#E4E4E7]">
                    <div className="text-xs font-medium text-[#71717A]">
                      独立主题立意（不靠主线亦出彩）
                    </div>
                    <p className="text-sm leading-relaxed text-[#3F3F46] mt-2">
                      {activeArc.independentTheme}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E4E4E7]">
                    <div className="text-xs font-medium text-[#C81E1E]">
                      假死 / 老死退场方式
                    </div>
                    <p className="text-sm leading-relaxed text-[#3F3F46] mt-2">
                      {activeArc.deathMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structured Chapter Beats (Editable) */}
              <div className="space-y-5 pt-4 border-t border-[#E4E4E7]">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-[#141413]">
                    02. 分节剧情大纲（可点击行内编辑）
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddBeat}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#52525B] hover:text-[#141413] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加情节点</span>
                  </button>
                </div>

                <div className="divide-y divide-[#E4E4E7]">
                  {activeArc.beats.map((beat, idx) => {
                    const isEditing = editingBeatId === beat.id;
                    return (
                      <div key={beat.id} className="py-5 first:pt-2 last:pb-0">
                        {isEditing ? (
                          <div className="space-y-3 bg-[#FAFAFA] p-4 rounded-lg border border-[#D4D4D8]">
                            <div className="flex items-center justify-between text-xs text-[#71717A]">
                              <span>
                                0{idx + 1} · {beat.phase}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingBeatId(null)}
                                  className="px-2.5 py-1 text-xs text-[#52525B] hover:text-[#141413] cursor-pointer"
                                >
                                  取消
                                </button>
                                <button
                                  type="button"
                                  onClick={saveEditBeat}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#141413] rounded hover:bg-[#27272A] cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>保存</span>
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={beatDraft.title}
                              onChange={(e) =>
                                setBeatDraft({ ...beatDraft, title: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm font-medium bg-white border border-[#D4D4D8] rounded focus:outline-none focus:border-[#141413]"
                              placeholder="情节点标题"
                            />
                            <textarea
                              rows={3}
                              value={beatDraft.summary}
                              onChange={(e) =>
                                setBeatDraft({ ...beatDraft, summary: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm bg-white border border-[#D4D4D8] rounded focus:outline-none focus:border-[#141413]"
                              placeholder="剧情概要"
                            />
                            <input
                              type="text"
                              value={beatDraft.keyScene}
                              onChange={(e) =>
                                setBeatDraft({ ...beatDraft, keyScene: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm bg-white border border-[#D4D4D8] rounded focus:outline-none focus:border-[#141413]"
                              placeholder="名场面 / 核心画面"
                            />
                          </div>
                        ) : (
                          <div className="group">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-xs text-[#71717A] font-mono-num">
                                  0{idx + 1} · {beat.phase}
                                </div>
                                <h4 className="font-editorial text-base font-semibold text-[#141413] mt-1">
                                  {beat.title}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => startEditBeat(beat)}
                                className="opacity-70 group-hover:opacity-100 inline-flex items-center gap-1 text-xs text-[#71717A] hover:text-[#141413] transition-opacity cursor-pointer shrink-0 pt-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>编辑</span>
                              </button>
                            </div>
                            <p className="text-sm leading-relaxed text-[#3F3F46] mt-2">
                              {beat.summary}
                            </p>
                            <p className="text-xs leading-relaxed text-[#71717A] mt-2.5">
                              核心画面：{beat.keyScene}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System Settlement Reward & Hidden Cross-Era Hook */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E4E4E7]">
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[#141413]">
                      03. 本世系统结算奖励
                    </h3>
                    <span className="text-xs text-[#C81E1E] font-medium">
                      {activeArc.reward.settlementGrade}
                    </span>
                  </div>
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-baseline justify-between pb-2 border-b border-[#F4F4F5]">
                      <dt className="text-[#71717A]">结算寿元</dt>
                      <dd className="font-mono-num font-semibold text-[#141413]">
                        {activeArc.reward.lifespanYears > 0
                          ? `+${activeArc.reward.lifespanYears} 年`
                          : '突破寿元上限'}
                      </dd>
                    </div>
                    <div className="pb-2 border-b border-[#F4F4F5]">
                      <dt className="text-xs text-[#71717A]">固化词条 / 体质</dt>
                      <dd className="font-medium text-[#141413] mt-0.5">
                        {activeArc.reward.coreTrait}
                      </dd>
                      <dd className="text-xs text-[#52525B] mt-1 leading-relaxed">
                        {activeArc.reward.traitEffect}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#71717A]">带出旧世器物</dt>
                      <dd className="font-medium text-[#141413] mt-0.5">
                        {activeArc.reward.artifact}
                      </dd>
                      <dd className="text-xs text-[#52525B] mt-1 leading-relaxed">
                        {activeArc.reward.artifactDesc}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-4 md:pl-8 md:border-l md:border-[#E4E4E7]">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[#141413]">
                      04. 后期暗线与隐性关联
                    </h3>
                    {!editingForeshadow && (
                      <button
                        type="button"
                        onClick={startEditForeshadow}
                        className="inline-flex items-center gap-1 text-xs text-[#71717A] hover:text-[#141413] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>调整伏笔</span>
                      </button>
                    )}
                  </div>

                  {editingForeshadow ? (
                    <div className="space-y-3 bg-[#FAFAFA] p-4 rounded-lg border border-[#D4D4D8]">
                      <input
                        type="text"
                        value={foreshadowDraft.relicName}
                        onChange={(e) =>
                          setForeshadowDraft({
                            ...foreshadowDraft,
                            relicName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm bg-white border border-[#D4D4D8] rounded"
                        placeholder="留世引子/旧物"
                      />
                      <textarea
                        rows={2}
                        value={foreshadowDraft.hiddenConnection}
                        onChange={(e) =>
                          setForeshadowDraft({
                            ...foreshadowDraft,
                            hiddenConnection: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm bg-white border border-[#D4D4D8] rounded"
                        placeholder="隐性关联机制"
                      />
                      <textarea
                        rows={2}
                        value={foreshadowDraft.futurePayoff}
                        onChange={(e) =>
                          setForeshadowDraft({
                            ...foreshadowDraft,
                            futurePayoff: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm bg-white border border-[#D4D4D8] rounded"
                        placeholder="后期回收高潮"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingForeshadow(false)}
                          className="px-2.5 py-1 text-xs text-[#52525B] cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={saveForeshadow}
                          className="px-3 py-1 text-xs font-medium text-white bg-[#141413] rounded cursor-pointer"
                        >
                          保存伏笔
                        </button>
                      </div>
                    </div>
                  ) : (
                    <dl className="space-y-3 text-sm">
                      <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-[#F4F4F5]">
                        <dt className="text-[#71717A] shrink-0">留世引子</dt>
                        <dd className="font-medium text-[#141413] text-right">
                          {activeArc.foreshadowing.relicName}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-[#F4F4F5]">
                        <dt className="text-[#71717A] shrink-0">蛰伏周期</dt>
                        <dd className="font-mono-num text-xs text-[#52525B]">
                          {activeArc.foreshadowing.dormantYears}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#71717A]">跨世隐连方式</dt>
                        <dd className="text-xs text-[#3F3F46] mt-1 leading-relaxed">
                          {activeArc.foreshadowing.hiddenConnection}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#C81E1E]">后期回响引爆</dt>
                        <dd className="text-xs text-[#27272A] mt-1 leading-relaxed">
                          {activeArc.foreshadowing.futurePayoff}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
              {/* Delayed Reader-Puzzle Clue Wedge & Anti-Power-Fantasy Cost Balance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E4E4E7]">
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[#141413]">
                      05. 延迟伏笔契子（留给读者思考）
                    </h3>
                  </div>
                  <div className="text-xs font-medium text-[#C81E1E]">
                    {activeArc.clueWedge.echoesInWorld}
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div>
                      <div className="text-xs text-[#71717A]">当卷无声埋点</div>
                      <p className="text-xs leading-relaxed text-[#27272A] mt-1">
                        {activeArc.clueWedge.clueDetail}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-[#71717A]">数卷后的读者推理爽点</div>
                      <p className="text-xs leading-relaxed text-[#3F3F46] mt-1">
                        {activeArc.clueWedge.readerAhaMoment}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:pl-8 md:border-l md:border-[#E4E4E7]">
                  <h3 className="text-lg font-semibold text-[#141413]">
                    06. 反龙傲天平衡 · 金手指代价
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div>
                      <div className="text-xs text-[#71717A]">本世动用能力</div>
                      <p className="text-xs leading-relaxed text-[#27272A] mt-1">
                        {activeArc.costBalance.abilityUsed}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-[#C81E1E]">支付的真实代价</div>
                      <p className="text-xs leading-relaxed text-[#27272A] mt-1">
                        {activeArc.costBalance.costPaid}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-[#71717A]">克制破局爽点</div>
                      <p className="text-xs leading-relaxed text-[#3F3F46] mt-1">
                        {activeArc.costBalance.restraintThrill}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 07. Soul Setting per Arc */}
              <div className="space-y-4 pt-6 border-t border-[#E4E4E7]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-[#141413]">
                    07. 灵魂设定（Soul · 主角魂态、人物魂格与跨世共鸣）
                  </h3>
                  <span className="text-xs text-[#C81E1E] font-medium">
                    灵魂年轮 · 非外挂有代价
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-[#71717A]">
                      主角当世魂态
                    </div>
                    <p className="text-xs leading-relaxed text-[#27272A]">
                      {activeArc.soulSetting.protagonistSoulState}
                    </p>
                  </div>
                  <div className="space-y-1.5 md:pl-6 md:border-l md:border-[#E4E4E7]">
                    <div className="text-xs font-medium text-[#71717A]">
                      核心人物灵魂底色
                    </div>
                    <p className="text-xs leading-relaxed text-[#27272A]">
                      {activeArc.soulSetting.companionSoulSpec}
                    </p>
                  </div>
                  <div className="space-y-1.5 md:pl-6 md:border-l md:border-[#E4E4E7]">
                    <div className="text-xs font-medium text-[#C81E1E]">
                      跨世灵魂共鸣 / 认人锚点
                    </div>
                    <p className="text-xs leading-relaxed text-[#3F3F46]">
                      {activeArc.soulSetting.soulResonance}
                    </p>
                  </div>
                </div>

                {/* Detailed Multi-Dimensional Character Soul Dossiers for this Arc */}
                {(() => {
                  const arcCharacters = CHARACTER_NODES.filter(
                    (n) =>
                      n.worldKey === activeArc.worldKey ||
                      (activeArc.worldKey === 'convergence' && n.id === 'protagonist')
                  );
                  if (arcCharacters.length === 0) return null;
                  return (
                    <div className="pt-5 border-t border-[#F4F4F5] space-y-4">
                      <div className="text-xs font-medium text-[#71717A]">
                        本卷核心人物立体 Soul 档案（气质特质 · 性格 · 职业 · 口癖 · 信念 · 独特外貌）
                      </div>
                      <div className="space-y-4">
                        {arcCharacters.map((charNode) => (
                          <div
                            key={charNode.id}
                            className="p-4 sm:p-5 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] space-y-3"
                          >
                            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2.5 border-b border-[#E4E4E7]">
                              <div>
                                <span className="font-editorial text-base font-semibold text-[#141413]">
                                  {charNode.name}
                                </span>
                                <span className="text-xs text-[#71717A] ml-2">
                                  {charNode.title}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-[#C81E1E]">
                                {charNode.soulProfile.archetype}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {charNode.soulProfile.temperamentTraits.map((trait) => {
                                const isPrimary = /病娇|可爱|冰冷|热情|傲娇/.test(trait);
                                return (
                                  <span
                                    key={trait}
                                    className={`px-2 py-0.5 text-[11px] font-medium rounded-sm border ${
                                      isPrimary
                                        ? 'bg-[#FEF2F2]/80 border-[#FECACA] text-[#B91C1C]'
                                        : 'bg-white border-[#E4E4E7] text-[#3F3F46]'
                                    }`}
                                  >
                                    {trait}
                                  </span>
                                );
                              })}
                            </div>

                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs leading-relaxed">
                              <div>
                                <dt className="text-[#71717A] font-medium">核心性格</dt>
                                <dd className="text-[#141413] mt-0.5">
                                  {charNode.soulProfile.personality}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[#71717A] font-medium">职业与身份</dt>
                                <dd className="text-[#27272A] mt-0.5">
                                  {charNode.soulProfile.occupation}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[#C81E1E] font-medium">标志口癖 / 习惯</dt>
                                <dd className="font-editorial text-[#141413] mt-0.5">
                                  {charNode.soulProfile.catchphrase}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[#71717A] font-medium">执念与信念</dt>
                                <dd className="text-[#27272A] mt-0.5">
                                  {charNode.soulProfile.creed}
                                </dd>
                              </div>
                              <div className="md:col-span-2 pt-2 border-t border-[#E4E4E7]">
                                <dt className="text-[#71717A] font-medium">独特外貌与细节</dt>
                                <dd className="text-[#27272A] mt-0.5">
                                  {charNode.soulProfile.distinctiveAppearance}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </article>
        )}
      </div>

      {/* Add Standalone World Arc Modal */}
      {showAddArcModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="新增独立轮回卷章"
        >
          <div className="bg-white border border-[#E4E4E7] rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
              <div>
                <h3 className="font-editorial text-xl font-semibold text-[#141413]">
                  新增一世独立卷章
                </h3>
                <p className="text-xs text-[#71717A] mt-1">
                  例如：大漠边关老驿卒、民国书局先生、星海灯塔守望者等
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddArcModal(false)}
                className="p-1.5 text-[#71717A] hover:text-[#141413] cursor-pointer"
                aria-label="关闭弹窗"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArc} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">
                    世界/场景名称 *
                  </label>
                  <input
                    required
                    type="text"
                    value={newArcForm.worldName}
                    onChange={(e) =>
                      setNewArcForm({ ...newArcForm, worldName: e.target.value })
                    }
                    placeholder="如：西域玉门驿站"
                    className="w-full px-3 py-2 text-sm border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">
                    卷章标题 *
                  </label>
                  <input
                    required
                    type="text"
                    value={newArcForm.title}
                    onChange={(e) =>
                      setNewArcForm({ ...newArcForm, title: e.target.value })
                    }
                    placeholder="如：大漠孤烟，老卒护驼铃"
                    className="w-full px-3 py-2 text-sm border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">
                    主角当世化名与身份
                  </label>
                  <input
                    type="text"
                    value={newArcForm.protagonistAlias}
                    onChange={(e) =>
                      setNewArcForm({
                        ...newArcForm,
                        protagonistAlias: e.target.value,
                      })
                    }
                    placeholder="如：老周（退伍驿丞）"
                    className="w-full px-3 py-2 text-sm border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">
                    本世核心陪伴对象
                  </label>
                  <input
                    type="text"
                    value={newArcForm.companionName}
                    onChange={(e) =>
                      setNewArcForm({
                        ...newArcForm,
                        companionName: e.target.value,
                      })
                    }
                    placeholder="如：流浪胡琴少女"
                    className="w-full px-3 py-2 text-sm border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1">
                  单卷独立故事核心
                </label>
                <textarea
                  rows={2}
                  value={newArcForm.independentTheme}
                  onChange={(e) =>
                    setNewArcForm({
                      ...newArcForm,
                      independentTheme: e.target.value,
                    })
                  }
                  placeholder="简述这一世不依赖主线也能独立动人的故事主题"
                  className="w-full px-3 py-2 text-sm border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1">
                  假死 / 老死退场方式
                </label>
                <input
                  type="text"
                  value={newArcForm.deathMethod}
                  onChange={(e) =>
                    setNewArcForm({ ...newArcForm, deathMethod: e.target.value })
                  }
                  placeholder="如：黄沙漫天之夜，以老病殉职假死葬于烽燧之下"
                  className="w-full px-3 py-2 text-sm border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">
                    结算寿元（年）
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={newArcForm.lifespanYears}
                    onChange={(e) =>
                      setNewArcForm({
                        ...newArcForm,
                        lifespanYears: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-mono-num border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">
                    固化词条奖励
                  </label>
                  <input
                    type="text"
                    value={newArcForm.coreTrait}
                    onChange={(e) =>
                      setNewArcForm({ ...newArcForm, coreTrait: e.target.value })
                    }
                    placeholder="如：大漠识途"
                    className="w-full px-3 py-2 text-sm border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">
                    后期暗线引子（旧物）
                  </label>
                  <input
                    type="text"
                    value={newArcForm.relicName}
                    onChange={(e) =>
                      setNewArcForm({ ...newArcForm, relicName: e.target.value })
                    }
                    placeholder="如：半枚铜驼铃"
                    className="w-full px-3 py-2 text-sm border border-[#D4D4D8] rounded-md focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E4E7]">
                <button
                  type="button"
                  onClick={() => setShowAddArcModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#141413] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#141413] hover:bg-[#27272A] rounded-md cursor-pointer"
                >
                  加入设定集
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
