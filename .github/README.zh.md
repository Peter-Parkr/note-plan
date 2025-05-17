# Note Plan

一个基于Tauri开发的跨平台桌面应用，用于笔记管理和待办事项追踪。

[English Documentation](README.md)

## 功能特点

### 笔记管理
- Markdown格式支持
- 标签系统
- 实时预览
- 创建、编辑、删除笔记

### 待办事项
- 支持每日任务
- 任务完成状态追踪
- 自动重置每日任务
- 创建、删除、标记完成待办事项

## 技术栈

- **前端**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Marked.js (Markdown渲染)

- **后端**
  - Rust
  - Tauri
  - Serde (序列化)
  - Chrono (时间处理)

## 安装说明

### 系统要求
- Windows 10/11, macOS 10.15+, 或 Linux
- 至少 100MB 可用磁盘空间

### 从源码构建

1. 安装依赖:
```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 Node.js (推荐 v16 或更高版本)
# 从 https://nodejs.org 下载并安装
```

2. 克隆仓库:
```bash
git clone https://github.com/Peter-Parkr/note-plan.git
cd note-plan
```

3. 安装前端依赖:
```bash
npm install
```

4. 构建应用:
```bash
npm run tauri build
```

构建完成后，可执行文件将位于 `src-tauri/target/release` 目录下。

## 使用说明

### 笔记功能

1. **创建笔记**
   - 在主页输入标题和内容
   - 支持Markdown格式
   - 可添加标签（用逗号分隔）

2. **编辑笔记**
   - 点击笔记进入编辑模式
   - 实时预览Markdown效果
   - 可修改标题、内容和标签

3. **标签管理**
   - 左侧边栏显示所有标签
   - 点击标签筛选相关笔记
   - 支持标签展开/折叠

### 待办事项

1. **创建待办**
   - 输入任务内容
   - 可选择是否为每日任务
   - 点击添加按钮创建

2. **管理待办**
   - 勾选复选框标记完成
   - 每日任务会在新的一天自动重置
   - 可删除已完成或不需要的任务

## 贡献指南

欢迎提交问题和改进建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至: 2080079861@qq.com

---

感谢使用 Note Plan！ 