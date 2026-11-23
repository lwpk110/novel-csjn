# 《长生纪年》番茄小说创作工作流（SOP）

> 本工作流收敛自 GitHub 优质开源小说创作生态（`webnovel-writer`、`oh-story-claudecode`、`fanqie-novel-skill`、`lieflat-less-ai-tone`、`fiction-humanizer-zh`、`chinese-novelist-skill`），并已注册为反重力 Agent 的 3 个专属技能。

## 一、三技能协同架构

| 阶段 | 调用技能 | 核心职责 | 关联文件/脚本 |
| :--- | :--- | :--- | :--- |
| **1. 写前备料** | `csjn-lore-sync` | 加载设定圣经、当前卷大纲、人物卡、实时状态与伏笔账本，锁定反龙傲天/身法/黑砖红线 | `writing/00-设定圣经-总纲.md`<br>`writing/state/current_state.md`<br>`writing/state/pending_hooks.md` |
| **2. 细纲与起稿** | `csjn-fanqie-pacing` | 控节奏（前 300/1000 字生死线、短段落、对话 ≤40%）、写反套路烟火爽点、落章末 6 式断章钩子 | `writing/volumes/vXX-分章细纲.md`<br>`writing/chapters/vXX-chXXX.md` |
| **3. 量化检测 + 精修** | `csjn-de-ai-editor` | 先跑 Python 量化脚本查 A/B 级 AI 痕迹，再过 7 道去 AI 味闸门（去翻案腔、去梗概感、智能替换） | `scripts/de-ai/detect.py` |
| **4. 写后提交** | `csjn-lore-sync` | 复核一致性、更新主角寿元/伤痕/时间线，登记新埋或已回收的草蛇灰线 | `writing/state/current_state.md`<br>`writing/state/pending_hooks.md` |

## 二、番茄小说发布实操规范

1. **单章字数**：控制在 **2000 – 2500 字**，契合日更 4000 字（每日 2 章）节奏与手机端阅读体验。
2. **存稿与签约节点**：
   - 开书前建议攒够 **7–10 章（约 2 万字）** 再正式发书，稳过第一次签约审核。
   - **首秀期三不原则**：首秀推流期间不改正文、不换封面、不改简介，避免触发重新审核导致流量归零。
3. **2026 平台合规红线**：
   - 严禁纯 AI 机械堆砌（每章必须过 `detect.py` + 7 Gate 精修 + 人工复读）。
   - 严禁涉政、涉黄、极端血腥与注水重复。
   - 按平台规定合规标注辅助工具状态。

## 三、常用命令

```bash
# 1. 若修改了 src/data/novelData.ts，重新同步 Markdown 设定圣经
bun run scripts/sync-writing-bible.ts

# 2. 对单章草稿执行量化 AI 味检测
python3 scripts/de-ai/detect.py writing/chapters/v01-ch001-*.md
```
