import { MapSectorKey, WorldKey } from '../types/novel';

export type LandmarkModelType =
  | 'pavilion'
  | 'palace'
  | 'forge'
  | 'alley'
  | 'atlantis'
  | 'sect'
  | 'airship'
  | 'pyramid'
  | 'sundial'
  | 'lantern'
  | 'nether'
  | 'heaven'
  | 'modern'
  | 'ark'
  | 'coffin';

export type StratumType = 'surface' | 'sky' | 'underworld';

export interface WorldLandmark3D {
  arcId: string;
  worldKey: WorldKey;
  indexLabel: string;
  name: string;
  title: string;
  mapSector: MapSectorKey;
  sectorLabel: string;
  stratum: StratumType;
  stratumLabel: string;
  modelType: LandmarkModelType;
  position: [number, number, number];
  accentHex: string;
  scale?: number;
  mobilityNote: string;
  illuminationNote: string;
  landmarkSummary: string;
}

export interface CameraPreset {
  id: string;
  label: string;
  sectorFilter: MapSectorKey | 'all';
  cameraPos: [number, number, number];
  target: [number, number, number];
}

export const MAP_CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: '全境沙盘',
    sectorFilter: 'all',
    cameraPos: [0, 26, 36],
    target: [0, 1.2, 0],
  },
  {
    id: 'normal',
    label: '常昼板块',
    sectorFilter: 'normal',
    cameraPos: [-22, 16, 20],
    target: [-9.5, 1.0, 2.0],
  },
  {
    id: 'polar_day',
    label: '极昼与天界',
    sectorFilter: 'polar_day',
    cameraPos: [16, 22, 22],
    target: [6.5, 5.2, -7.5],
  },
  {
    id: 'polar_night',
    label: '极夜与九幽',
    sectorFilter: 'polar_night',
    cameraPos: [18, 13, 25],
    target: [6.0, -2.0, 7.5],
  },
  {
    id: 'twilight',
    label: '晨昏荒坟',
    sectorFilter: 'twilight_band',
    cameraPos: [0, 11.5, 16],
    target: [0, 2.2, 0.5],
  },
];

export const WORLD_LANDMARKS_3D: WorldLandmark3D[] = [
  {
    arcId: 'arc-county',
    worldKey: 'county',
    indexLabel: '第一卷',
    name: '青溪县城',
    title: '凡尘青溪，哑妻相守五十四载',
    mapSector: 'normal',
    sectorLabel: '常昼常夜板块',
    stratum: 'surface',
    stratumLabel: '凡尘表层',
    modelType: 'pavilion',
    position: [-14.2, 0, 5.2],
    accentHex: '#8B5E3C',
    scale: 1.05,
    mobilityNote: '一村三巷步行尺，尚未开启缩地身法',
    illuminationNote: '四季分明、油灯照夜，开启手机首张底片',
    landmarkSummary: '青溪河畔老木匠铺，屋檐挂红灯笼，埋下《青溪百工记》与平安墨斗。',
  },
  {
    arcId: 'arc-dynasty',
    worldKey: 'dynasty',
    indexLabel: '第二卷',
    name: '大景皇朝',
    title: '太傅孤臣，三朝背影镇山河',
    mapSector: 'normal',
    sectorLabel: '常昼常夜板块',
    stratum: 'surface',
    stratumLabel: '凡尘表层',
    modelType: 'palace',
    position: [-10.8, 0, -3.5],
    accentHex: '#B91C1C',
    scale: 1.15,
    mobilityNote: '宫城御道缩距出行，借微恙缓步藏拙',
    illuminationNote: '大雪映朱墙，御书房窗纱透出末撇微颤手迹',
    landmarkSummary: '重檐金瓦太景殿，御书房竹帘外隔世授业，萧惊鸿得奇遇后自此启程跨十三世追夫！',
  },
  {
    arcId: 'arc-blacksmith',
    worldKey: 'blacksmith',
    indexLabel: '第三卷',
    name: '北疆边城',
    title: '瘸腿老铁匠与沉默养子',
    mapSector: 'normal',
    sectorLabel: '常昼常夜板块',
    stratum: 'surface',
    stratumLabel: '凡尘表层',
    modelType: 'forge',
    position: [-15.8, 0, -7.8],
    accentHex: '#D97706',
    scale: 1.0,
    mobilityNote: '初创「顺风追星步」雏形，日行三百里逃生',
    illuminationNote: '炉火明灭交错风雪，铁砧藏娶媳妇铜钱盒',
    landmarkSummary: '寒铁烽燧与终日冒火星的锻造炉膛，百炼玄铁重剑与养父子血誓起点。',
  },
  {
    arcId: 'arc-nightwatch',
    worldKey: 'nightwatch',
    indexLabel: '第四卷',
    name: '雾都暗巷',
    title: '长夜巡更，与宿敌互相成全',
    mapSector: 'polar_night',
    sectorLabel: '极夜寒渊板块',
    stratum: 'surface',
    stratumLabel: '暗雾表层',
    modelType: 'alley',
    position: [2.8, 0, 11.8],
    accentHex: '#475569',
    scale: 1.0,
    mobilityNote: '顺风步小成，十息甩开镇夜司三条暗巷',
    illuminationNote: '浓雾常年笼罩青石板，雨夜高速奔袭留下滚烫炭印',
    landmarkSummary: '铜路灯微光摇曳的雨巷与破庙，莫无踪和裴玄猫鼠戏耍四十载，并险被太景暗探堵个正着。',
  },
  {
    arcId: 'arc-atlantis',
    worldKey: 'atlantis',
    indexLabel: '第五卷',
    name: '亚特兰蒂斯',
    title: '沉落海底的千年守灯人',
    mapSector: 'polar_night',
    sectorLabel: '极夜寒渊板块',
    stratum: 'surface',
    stratumLabel: '深渊海床',
    modelType: 'atlantis',
    position: [13.2, 0, 9.6],
    accentHex: '#0284C7',
    scale: 1.1,
    mobilityNote: '水压极夜限制瞬移，奔袭后须靠钟塔炭火回温',
    illuminationNote: '永夜海底全凭青铜长明灯与汐月心鳞微光照明',
    landmarkSummary: '半沉海渊的古铜钟塔与晶石祭坛，烙下人鱼一生一次的「心鳞同命吻印」。',
  },
  {
    arcId: 'arc-sect',
    worldKey: 'sect',
    indexLabel: '第六卷',
    name: '万花宗',
    title: '废丹杂役房里的枯桃树',
    mapSector: 'normal',
    sectorLabel: '常昼常夜板块',
    stratum: 'surface',
    stratumLabel: '灵脉山崖',
    modelType: 'sect',
    position: [-6.8, 0, 7.6],
    accentHex: '#0F766E',
    scale: 1.05,
    mobilityNote: '「踏影缩地步」初融鲁班残尺，山门内悄无声息越崖',
    illuminationNote: '月圆药浴蒸汽氤氲，意外暴露青年真容掀起双徒冲师风波',
    landmarkSummary: '青崖半山枯桃古树与杂役药庐，涂山雪九尾缠腰、柳清音偷吻银霜之地。',
  },
  {
    arcId: 'arc-skywhale',
    worldKey: 'skywhale',
    indexLabel: '第七卷',
    name: '云鲸浮空城',
    title: '失明机械师与折翼星徒',
    mapSector: 'polar_day',
    sectorLabel: '极昼炽域板块',
    stratum: 'sky',
    stratumLabel: '极昼高空云层',
    modelType: 'airship',
    position: [9.8, 5.2, -10.8],
    accentHex: '#0369A1',
    scale: 1.1,
    mobilityNote: '高空盲眼靠风压与齿轮节拍飞檐走壁',
    illuminationNote: '恒久烈日与流云反射白光，盲区造就鸢尾半寸贴面描眉',
    landmarkSummary: '浮游在云海之上的黄铜齿轮星港，停摆的星轨怀表与风翼首飞告白之处。',
  },
  {
    arcId: 'arc-mirror-desert',
    worldKey: 'mirror_desert',
    indexLabel: '第八卷',
    name: '镜面沙海',
    title: '沙中旅人，与妄图换影的镜灵',
    mapSector: 'polar_day',
    sectorLabel: '极昼炽域板块',
    stratum: 'surface',
    stratumLabel: '极昼晶砂海',
    modelType: 'pyramid',
    position: [14.8, 0, -3.2],
    accentHex: '#CA8A04',
    scale: 1.08,
    mobilityNote: '「踏影缩地步」极大压缩千里沙海，一息跨丘',
    illuminationNote: '无夜炽光垂直照射晶盐地面，强行跑图会拖出延迟金色残影',
    landmarkSummary: '镜面盐碱方尖碑，沙九八世死人寒霜刀光雕出镜灵琉璃骨身之所。',
  },
  {
    arcId: 'arc-twilight',
    worldKey: 'twilight',
    indexLabel: '第九卷',
    name: '晨昏界',
    title: '半明旅店的聋哑掌灯人',
    mapSector: 'twilight_band',
    sectorLabel: '晨昏交界板块',
    stratum: 'surface',
    stratumLabel: '三十里狭缝走廊',
    modelType: 'sundial',
    position: [0.0, 0, 5.8],
    accentHex: '#EA580C',
    scale: 1.08,
    mobilityNote: '踩着晨昏临界线疾走，避开极昼强光与极夜抽寒',
    illuminationNote: '左侧金阳炙烤、右侧黑夜冰封，半明旅店恰好立于光暗交锋线',
    landmarkSummary: '金黑双拼日晷拱门，曦朔左金右银异瞳在光学折射下重获安宁的走廊。',
  },
  {
    arcId: 'arc-lantern-market',
    worldKey: 'lantern_market',
    indexLabel: '第十卷',
    name: '枯骨灯市',
    title: '黑河畔的六十年茶钱',
    mapSector: 'polar_night',
    sectorLabel: '极夜寒渊板块',
    stratum: 'surface',
    stratumLabel: '幽冥边缘栈道',
    modelType: 'lantern',
    position: [9.4, 0, 13.8],
    accentHex: '#DC2626',
    scale: 1.0,
    mobilityNote: '习得「鬼影贴地行」，顺着红纸灯笼死角无缝换位',
    illuminationNote: '黑水无日照，百鬼灯市明暗完全取决于《忘川茶客簿》灯芯燃度',
    landmarkSummary: '黑河石阶码头与悬满小楷红灯笼的茶寮，保住阿烛六十年不灭记忆。',
  },
  {
    arcId: 'arc-nether',
    worldKey: 'nether',
    indexLabel: '第十一卷',
    name: '九幽核销司',
    title: '地府老书吏与追夫女判官',
    mapSector: 'polar_night',
    sectorLabel: '极夜寒渊板块',
    stratum: 'underworld',
    stratumLabel: '地脉下层 · 九幽幽司',
    modelType: 'nether',
    position: [6.8, -4.6, 5.5],
    accentHex: '#7C3AED',
    scale: 1.15,
    mobilityNote: '「鬼影贴地行」贴着三丈高案卷影壁瞬滑躲避抓捕',
    illuminationNote: '幽蓝业火与朱砂印台微光照亮生死簿，烙出左腕阴阳婚契红线',
    landmarkSummary: '九幽最深处的业火核销大殿，崔明月被迫盖下“已销户”后撞见萧惊鸿跨界翻档追夫！',
  },
  {
    arcId: 'arc-heaven',
    worldKey: 'heaven',
    indexLabel: '第十二卷',
    name: '陨星旧档库',
    title: '冷宫老仆，篡改吃人天条',
    mapSector: 'polar_day',
    sectorLabel: '极昼炽域板块',
    stratum: 'sky',
    stratumLabel: '天界上层 · 九重云穹',
    modelType: 'heaven',
    position: [4.5, 7.6, -7.8],
    accentHex: '#0EA5E9',
    scale: 1.18,
    mobilityNote: '天界强光压制魂息，遭明月隔三步追闻桂花香后贴影溜逃',
    illuminationNote: '恒久炽白神光毫无阴影可藏，星简水渍与抛物线草图暴露凡人笔锋',
    landmarkSummary: '悬浮星轨圆环之中的玉简 archive 库，瑶光在此接住改写天条的落点。',
  },
  {
    arcId: 'arc-alt-modern',
    worldKey: 'alt_modern',
    indexLabel: '第十三卷',
    name: '霓虹旧港',
    title: '雨夜旧书店，五元亮起万古手机',
    mapSector: 'normal',
    sectorLabel: '常昼常夜板块',
    stratum: 'surface',
    stratumLabel: '现世都市海港',
    modelType: 'modern',
    position: [-8.4, 0, 12.6],
    accentHex: '#4F46E5',
    scale: 1.06,
    mobilityNote: '无灵「格物风行步」被崔明月堵门逼出 80 迈，吃下电子眼罚单',
    illuminationNote: '霓虹雨夜下五块钱充电线首次点亮黑砖绿色图标，唤醒万年前旧照',
    landmarkSummary: '旧港海堤边「归尘堂」二手书店与测速高架路口，异常局档案由此封存。',
  },
  {
    arcId: 'arc-alt-apocalypse',
    worldKey: 'alt_apocalypse',
    indexLabel: '第十四卷',
    name: '灰烬方舟',
    title: '冰封之夜，徒手点亮太阳塔',
    mapSector: 'polar_night',
    sectorLabel: '极夜寒渊板块',
    stratum: 'surface',
    stratumLabel: '永冬极夜冰原',
    modelType: 'ark',
    position: [15.5, 0, 3.6],
    accentHex: '#334155',
    scale: 1.12,
    mobilityNote: '「格物风行步」顶着零下百度暴风雪百里抢修太阳塔',
    illuminationNote: '人工太阳塔未重启前全境永夜冰封，仅余许霜左胸 37.2℃ 温热心跳',
    landmarkSummary: '钢铁巨穹顶太阳反应塔，陆沉借半颗残魂点亮新纪元黎明、沉眠千年之所。',
  },
  {
    arcId: 'arc-convergence',
    worldKey: 'convergence',
    indexLabel: '回响卷',
    name: '落花崖荒坟',
    title: '雷雨破晓，十四世故人齐聚开棺',
    mapSector: 'twilight_band',
    sectorLabel: '晨昏交界板块',
    stratum: 'surface',
    stratumLabel: '全境中央天枢崖',
    modelType: 'coffin',
    position: [0.0, 0, -1.2],
    accentHex: '#C81E1E',
    scale: 1.25,
    mobilityNote: '跑遍十四世的终极归宿，所有宿敌、父子、徒弟与判官齐至再无处可躲',
    illuminationNote: '破晓裂隙引动天界星光、九幽红线、现代手机原图与鲁班石棺同时共振',
    landmarkSummary: '全境几何中心青石古棺与枯桃山崖——萧惊鸿拍下青玉镇纸领衔堵门、崔明月与诸徒弟齐聚！',
  },
];

export const CHASING_ROUTE_ARC_IDS: string[] = [
  'arc-dynasty',
  'arc-nightwatch',
  'arc-sect',
  'arc-mirror-desert',
  'arc-nether',
  'arc-heaven',
  'arc-alt-modern',
  'arc-convergence',
];

