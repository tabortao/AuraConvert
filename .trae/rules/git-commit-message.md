---
alwaysApply: true
scene: git_message  # 指定规则生效场景为「Git 提交信息生成」
---
# 核心目标：生成简洁、规范、语义化的英文 Git 提交信息

## 格式要求（遵循 Conventional Commits 规范）
提交信息需严格遵循 `<type>(<scope>): <subject>` 结构：
- **type**：必填，选择以下类型之一（小写）：
  feat（新功能）、fix（修复 bug）、docs（文档更新）、style（代码风格调整）、refactor（重构）、test（测试相关）、chore（构建/工具类杂项）、perf（性能优化）、ci（CI/CD 配置）、build（构建系统依赖）
- **scope**：可选，用括号包裹（如 `(auth)` `(api)`），标识修改的作用域（模块/组件/功能点）。若无法明确范围可省略。
- **subject**：必填，**一句话总结**修改内容，首字母大写，无句号结尾，长度建议 ≤50 字符。


## 细节约束
1. 语言强制：全程使用英语，禁止中文/其他语言。
2. 时态与语气：用**祈使句**（如 "Add" / "Fix" / "Update"，而非 "Added" / "Fixed"）。
3. 正文（body）：若逻辑复杂，可在 subject 后换行补充（空一行后写），每行 ≤72 字符，解释 *why* 或 *how*。
4. 避免模糊表述：禁止 "update code" "fix something" 这类无意义的描述，需具体到功能/问题（如 "Fix login timeout issue in auth module"）。


## 示例参考
- 简单新增：`feat(auth): Add user registration validation`
- 修复 Bug：`fix(api): Resolve null pointer exception in payment callback`
- 文档更新：`docs(readme): Update installation steps for Docker deployment`
- 重构优化：`refactor(utils): Simplify date formatting logic with native APIs`