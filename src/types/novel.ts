export type WorldKey =
  | 'county'
  | 'dynasty'
  | 'blacksmith'
  | 'nightwatch'
  | 'atlantis'
  | 'sect'
  | 'skywhale'
  | 'mirror_desert'
  | 'twilight'
  | 'lantern_market'
  | 'nether'
  | 'heaven'
  | 'alt_modern'
  | 'alt_apocalypse'
  | 'convergence';

export type EraCategory =
  | 'ancient'
  | 'fantasy'
  | 'celestial_nether'
  | 'future'
  | 'convergence';

export type MapSectorKey = 'normal' | 'polar_day' | 'polar_night' | 'twilight_band';

export interface MapSectorSpec {
  key: MapSectorKey;
  name: string;
  subtitle: string;
  illuminationRule: string;
  worldsIncluded: string;
  disguiseImpact: string;
  costTension: string;
}

export interface MobilitySkillStage {
  stage: string;
  name: string;
  originArc: string;
  speedEffect: string;
  costAndLimit: string;
}

export interface PhoneEraLog {
  era: string;
  batteryUsed: string;
  disguiseForm: string;
  capturedMemory: string;
}

export interface ChasingHusbandScene {
  era: string;
  title: string;
  tensionBeat: string;
}

export interface ChasingHusbandSpec {
  heroineName: string;
  originArc: string;
  identityShift: string;
  turningPoint: string;
  chasingStyle: string;
  bindingRelic: string;
  protagonistReaction: string;
  scenes: ChasingHusbandScene[];
}

export interface ApprenticeRomanceProfile {
  characterName: string;
  originArc: string;
  surfaceBond: string;
  ambiguityTrigger: string;
  signatureMoment: string;
  emotionalPayoff: string;
}

export interface ProtagonistSoulSpec {
  title: string;
  coreConcept: string;
  antiPowerLimit: string;
  soulFingerprints: { name: string; origin: string; clueEffect: string }[];
  soulStages: { stage: string; span: string; mechanism: string }[];
}

export interface ArcSoulSetting {
  protagonistSoulState: string;
  companionSoulSpec: string;
  soulResonance: string;
}

export interface CharacterSoulProfile {
  archetype: string;
  imprint: string;
  resonance: string;
}

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

export interface ThrillHook {
  label: string;
  detail: string;
}

export interface StoryArc {
  id: string;
  indexLabel: string;
  worldKey: WorldKey;
  worldName: string;
  mapSector: MapSectorKey;
  sectorLabel: string;
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
  thrillHook: ThrillHook;
  beats: ChapterBeat[];
  reward: SystemReward;
  foreshadowing: ForeshadowingHook;
  clueWedge: DelayClueWedge;
  costBalance: GoldenFingerCost;
  soulSetting: ArcSoulSetting;
}

export interface LifespanTierSpec {
  tierCode: string;
  category: string;
  lifespanRange: string;
  mechanism: string;
  representativeCharacters: string;
  constraintNote: string;
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
  lifespanSpec: string;
  eraStatus: string;
  beforeDeath: string;
  afterDeath: string;
  keepsake: string;
  visualAnchor: string;
  soulProfile: CharacterSoulProfile;
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
  mapSector: MapSectorKey;
  sectorLabel: string;
  eraTone: string;
  powerSystem: string;
  socialOrder: string;
  timeFlow: string;
  visualMotifs: string;
  disguiseRule: string;
}
