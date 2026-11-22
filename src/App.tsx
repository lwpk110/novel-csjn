/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { INITIAL_ARCS } from './data/novelData';
import { StoryArc } from './types/novel';
import { OverviewSection } from './components/OverviewSection';
import { OutlineWorkspace } from './components/OutlineWorkspace';
import { RelationshipGraph } from './components/RelationshipGraph';
import { WorldSystemView } from './components/WorldSystemView';
import { ExportModal } from './components/ExportModal';

type TabKey = 'overview' | 'outline' | 'graph' | 'world';

const STORAGE_KEY = 'longevity_chronicles_arcs_v4';

const NAV_ITEMS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '主题与循环' },
  { key: 'outline', label: '独立卷章大纲' },
  { key: 'graph', label: '人物关系图谱' },
  { key: 'world', label: '世界与系统' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [arcs, setArcs] = useState<StoryArc[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((item) => item.clueWedge && item.costBalance)
        ) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial data
    }
    return INITIAL_ARCS;
  });

  const [selectedArcId, setSelectedArcId] = useState<string>(INITIAL_ARCS[0].id);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arcs));
    } catch {
      // Ignore storage quota issues
    }
  }, [arcs]);

  const handleUpdateArc = (updated: StoryArc) => {
    setArcs((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAddArc = (newArc: StoryArc) => {
    setArcs((prev) => [...prev, newArc]);
  };

  const handleResetData = () => {
    setArcs(INITIAL_ARCS);
    setSelectedArcId(INITIAL_ARCS[0].id);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#141413]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#F9FAFB]/95 backdrop-blur-xs border-b border-[#E4E4E7]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => switchTab('overview')}
            className="font-editorial text-lg font-semibold tracking-tight text-[#141413] hover:text-[#C81E1E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            长生纪年
          </button>

          {/* Zone 2: 4 Clean Single-Line Text Navigation Links */}
          <nav
            aria-label="主导航"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => switchTab(item.key)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#141413] border-[#C81E1E]'
                      : 'text-[#52525B] border-transparent hover:text-[#141413] hover:border-[#D4D4D8]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 text-xs font-medium text-white bg-[#141413] hover:bg-[#27272A] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C81E1E]"
            >
              导出设定集
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Navigation Bar (below header, non-sticky to respect mobile sticky budget) */}
      <nav
        aria-label="移动端导航"
        className="md:hidden border-b border-[#E4E4E7] bg-white px-5 py-2.5 flex items-center gap-5 overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => switchTab(item.key)}
              className={`text-xs font-medium whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                isActive
                  ? 'text-[#141413] border-[#C81E1E]'
                  : 'text-[#71717A] border-transparent'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Main Editorial Workspace Container */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-5 sm:px-8 pt-8 sm:pt-10">
        {activeTab === 'overview' && (
          <OverviewSection
            arcs={arcs}
            onNavigateTab={switchTab}
            onSelectArc={setSelectedArcId}
          />
        )}

        {activeTab === 'outline' && (
          <OutlineWorkspace
            arcs={arcs}
            selectedArcId={selectedArcId}
            onSelectArc={setSelectedArcId}
            onUpdateArc={handleUpdateArc}
            onAddArc={handleAddArc}
          />
        )}

        {activeTab === 'graph' && <RelationshipGraph />}

        {activeTab === 'world' && <WorldSystemView arcs={arcs} />}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E4E4E7] bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#71717A]">
          <div>
            长生纪年 · 红尘轮回叙事设定集（编辑内容已自动保存于本地浏览器）
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="hover:text-[#141413] transition-colors cursor-pointer whitespace-nowrap"
            >
              导出 Markdown
            </button>
            <button
              type="button"
              onClick={handleResetData}
              className="hover:text-[#C81E1E] transition-colors cursor-pointer whitespace-nowrap"
            >
              恢复初始设定
            </button>
          </div>
        </div>
      </footer>

      {showExportModal && (
        <ExportModal arcs={arcs} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}
