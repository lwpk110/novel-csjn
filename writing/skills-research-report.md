# GitHub 小说创作插件与技能包调研报告（《长生纪年》定制版）

## 一、核心调研仓库与选型拆解

| 仓库 | Stars | 核心定位 | 我们吸收的核心方法论 |
| :--- | :---: | :--- | :--- |
| `zenstory-ai/oh-story-claudecode` | 8835★ | 网文 Agent 全流程技能包 | 扫榜/拆文/大纲/长篇连载/去AI味三层架构（deslop-three-layer）与按需上下文预算控制 |
| `larashero3-dotcom/lieflat-less-ai-tone` | 8613★ | 520万字语料实测去AI味 | **禁翻案腔**（AI出现率是人类3.4倍）、**最小改动**、**信息守恒**、**不制造参差**（不乱拆短句） |
| `PenglongHuang/chinese-novelist-skill` | 5421★ | 完整中文小说生成工作流 | **悬念钩子十三式**、三层问答、创作记忆与自动校验 |
| `MrGeDiao/shuorenhua` | 2733★ | 中文优先去AI味改写 | 保事实、分场景（网文/口语与公文严格区分） |
| `304769384-png/fanqie-novel-skill` | 90★ | 番茄小说专用长篇系统 | **黄金三章/前300字/前1000字生死线**、2026纯AI封禁红线、**智能替换机制**（非机械删除）、对话占比上限40%、禁话疗BOSS |
| `xiaoyuCR7/general-novel-skill` | 16★ | 中文网文7道去AI闸门 | **7 Gate 审查清单**、删除优先判断、电报体警报、结尾升华禁止 |
| `AI-Practical-Lab/novel-writer` | 51★ | 长篇引擎与角色/伏笔追踪 | 写前读状态、写后强制验证与账本提交的事务模型 |

## 二、本项目落地的 3 个专属 Agent Skills

1. **`csjn-lore-sync`**（写前加载 + 写后校验与状态提交）
   - 自动对接 `writing/00-设定圣经-总纲.md`、`writing/01-十四世分卷大纲.md`、`writing/02-人物与关系图谱.md`。
   - 守护《长生纪年》四大铁律：**反龙傲天红线**、**红尘缩地步阶段锁**（前两卷尚未习得）、**四大光影板块物理约束**、**万古黑砖断网黑屏锁**。
   - 每章定稿后强制更新 `writing/state/current_state.md` 与 `writing/state/pending_hooks.md`。
2. **`csjn-fanqie-pacing`**（番茄节奏骨架 + 反套路烟火气）
   - 严格把关前 300 字画面感与异常、前 1000 字身份与冲突、第 1 章小闭环、前 3 章核心羁绊与钩子。
   - 短段落手机排版、用缩地身法压缩水字数、章末 6 式精准断章钩子。
3. **`csjn-de-ai-editor`**（7 道去 AI 味审稿闸门）
   - 融合 520 万字语料实测（禁“不是……而是……”等翻案腔）与番茄智能替换表（仿佛/不禁/深邃/瞳孔收缩等），杜绝机械删除导致的语病与电报体。

## 三、日常创作标准工作流（SOP）

1. **同步设定**：若修改了 `src/data/novelData.ts`，执行 `bun run scripts/sync-writing-bible.ts` 更新 Markdown 设定圣经。
2. **写前备料**：调用 `csjn-lore-sync` 读取设定与 `current_state.md` / `pending_hooks.md`。
3. **细纲与起稿**：调用 `csjn-fanqie-pacing` 构思本章节拍与章末钩子，落稿至 `writing/chapters/v01-ch001-xxx.md`。
4. **去味精修**：调用 `csjn-de-ai-editor` 过 7 道闸门净化文本。
5. **账本提交**：调用 `csjn-lore-sync` 校验一致性并更新 `current_state.md` 与 `pending_hooks.md`。
