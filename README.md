# SPM Question Intelligence

SPM 历年题目、资料质量、趋势分析与复习优先级平台。

## Live site

`https://darkgeneration77-spec.github.io/spm-question-intelligence/`

## Current capabilities

- 多科目、Form、年份、Paper、章节、题型与来源筛选
- Sejarah Form 4 + Form 5 完整章节目录
- CSV 批量导入与导出
- Question ID、州属、Section、题号、Kata Tugas 与技能标签
- 重复题群组与质量修正权重
- 章节覆盖审计与人工审核清单
- 教师工作台：新增、编辑、删除、审核和高价值标记
- 透明预测优先级与数据置信度
- GitHub Pages 静态部署

## Architecture status

### Existing live mode

The live GitHub Pages site still uses browser LocalStorage for teacher-created records. This keeps the prototype immediately usable without a server.

### Supabase-ready backend

The repository now includes a production-oriented PostgreSQL schema:

- `supabase/schema.sql`
- `supabase/seed.sql`
- `docs/SUPABASE_SETUP.md`
- `.env.example`

The schema contains:

- profiles and Admin / Teacher / Viewer roles
- subjects and chapters
- sources and copyright metadata
- standardized questions
- review status and teacher notes
- duplicate clusters
- prediction runs and explainable results
- indexes, triggers and Row Level Security policies

## Database setup

1. Create a free Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Run `supabase/seed.sql`.
4. Follow `docs/SUPABASE_SETUP.md`.
5. Never commit a Supabase service-role key.

Creating the SQL files does not automatically create the cloud project. Until the project URL and public anon key are configured, the website continues using LocalStorage.

## Prediction policy

Prediction scores represent **revision priority**, not guaranteed exam probability. The model considers:

- recent official-paper signals
- curriculum importance
- coverage gaps
- independent Trial consensus
- question-format suitability
- recurring skills
- source reliability
- verification and field completeness
- duplicate-source penalties

## Data discipline

- Current KSSM and older syllabuses must remain separate.
- Reposted copies of the same question must share one duplicate group.
- Full third-party papers should not be republished without permission.
- Predictions should only be published after source and chapter verification.

## Next implementation step

Connect the existing Teacher Workspace to Supabase Authentication and the `sources` / `questions` tables, then migrate exported LocalStorage records into the permanent database.
