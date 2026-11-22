export type WorldKey =
  | 'county'
  | 'dynasty'
  | 'atlantis'
  | 'sect'
  | 'skywhale'
  | 'mirror_desert'
  | 'lantern_market'
  | 'alt_modern'
  | 'alt_apocalypse'
  | 'convergence';

export type EraCategory = 'ancient' | 'fantasy' | 'future' | 'convergence';

export interface ChapterBeat {
  id: string;
  phase: '起·入世立身' | '承·岁月羁绊' | '转·劫数与抉择' | '合·假死老去' | '引·余韵暗埋';
  title: string;
  summary: string;
  keyScene: string;
}

export interface SystemReward {
  lifespanYears: number;
  coreTrait: string;
  traitEffect: string;
  artifact: string;
  artifactDesc: string;
  settlementGrade: string;
}

export interface ForeshadowingHook {
  relicName: string;
  dormantYears: string;
  hiddenConnection: string;
  futurePayoff: string;
}

export interface DelayClueWedge {
  clueDetail: string;
  echoesInWorld: string;
  readerAhaMoment: string;
}

export interface GoldenFingerCost {
  abilityUsed: string;
  costPaid: string;
  restraintThrill: string;
}

export interface StoryArc {
  id: string;
  indexLabel: string;
  worldKey: WorldKey;
  worldName: string;
  title: string;
  subtitle: string;
  identityType: string;
  protagonistAlias: string;
  eraSpan: string;
  companionName: string;
  companionRole: string;
  imageUrl: string;
  independentTheme: string;
  logline: string;
  deathMethod: string;
  beats: ChapterBeat[];
  reward: SystemReward;
  foreshadowing: ForeshadowingHook;
  clueWedge: DelayClueWedge;
  costBalance: GoldenFingerCost;
}

export interface CharacterNode {
  id: string;
  name: string;
  title: string;
  worldKey: WorldKey | 'core';
  worldLabel: string;
  role: string;
  x: number;
  y: number;
  isProtagonist?: boolean;
  eraStatus: string;
  beforeDeath: string;
  afterDeath: string;
  keepsake: string;
  visualAnchor: string;
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'direct' | 'hidden';
  worldKey: WorldKey | 'cross';
  detail: string;
}

export interface LoopStage {
  step: string;
  title: string;
  subtitle: string;
  narrativePurpose: string;
  emotionalHook: string;
  writingTip: string;
  adaptationNote: string;
}

export interface WorldSettingSpec {
  worldKey: WorldKey;
  name: string;
  eraTone: string;
  powerSystem: string;
  socialOrder: string;
  timeFlow: string;
  visualMotifs: string;
  disguiseRule: string;
}
