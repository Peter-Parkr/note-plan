# Note Plan

<div align="center">
  <h2>选择语言 | Select Language</h2>
  
  <a href=".github/README.md" style="margin-right: 20px;">
    <img src="https://img.shields.io/badge/English-0078D4?style=for-the-badge&logo=github&logoColor=white" alt="English">
  </a>
  
  <a href=".github/README.zh.md">
    <img src="https://img.shields.io/badge/中文-0078D4?style=for-the-badge&logo=github&logoColor=white" alt="中文">
  </a>
</div>

---

A cross-platform desktop application built with Tauri for note-taking and todo management.

一个基于Tauri开发的跨平台桌面应用，用于笔记管理和待办事项追踪。

## <span class="zh">功能特点</span><span class="en" style="display: none;">Features</span>

### <span class="zh">笔记管理</span><span class="en" style="display: none;">Note Management</span>
- <span class="zh">Markdown格式支持</span><span class="en" style="display: none;">Markdown format support</span>
- <span class="zh">标签系统</span><span class="en" style="display: none;">Tag system</span>
- <span class="zh">实时预览</span><span class="en" style="display: none;">Real-time preview</span>
- <span class="zh">创建、编辑、删除笔记</span><span class="en" style="display: none;">Create, edit, and delete notes</span>

### <span class="zh">待办事项</span><span class="en" style="display: none;">Todo Management</span>
- <span class="zh">支持每日任务</span><span class="en" style="display: none;">Daily task support</span>
- <span class="zh">任务完成状态追踪</span><span class="en" style="display: none;">Task completion tracking</span>
- <span class="zh">自动重置每日任务</span><span class="en" style="display: none;">Automatic daily task reset</span>
- <span class="zh">创建、删除、标记完成待办事项</span><span class="en" style="display: none;">Create, delete, and mark todos as complete</span>

## <span class="zh">技术栈</span><span class="en" style="display: none;">Tech Stack</span>

- **<span class="zh">前端</span><span class="en" style="display: none;">Frontend</span>**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Marked.js (<span class="zh">Markdown渲染</span><span class="en" style="display: none;">Markdown rendering</span>)

- **<span class="zh">后端</span><span class="en" style="display: none;">Backend</span>**
  - Rust
  - Tauri
  - Serde (<span class="zh">序列化</span><span class="en" style="display: none;">Serialization</span>)
  - Chrono (<span class="zh">时间处理</span><span class="en" style="display: none;">Time handling</span>)

## <span class="zh">安装说明</span><span class="en" style="display: none;">Installation</span>

### <span class="zh">系统要求</span><span class="en" style="display: none;">System Requirements</span>
- <span class="zh">Windows 10/11, macOS 10.15+, 或 Linux</span><span class="en" style="display: none;">Windows 10/11, macOS 10.15+, or Linux</span>
- <span class="zh">至少 100MB 可用磁盘空间</span><span class="en" style="display: none;">At least 100MB free disk space</span>

### <span class="zh">从源码构建</span><span class="en" style="display: none;">Build from Source</span>

1. <span class="zh">安装依赖</span><span class="en" style="display: none;">Install dependencies</span>:
```bash
# <span class="zh">安装 Rust</span><span class="en" style="display: none;">Install Rust</span>
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# <span class="zh">安装 Node.js (推荐 v16 或更高版本)</span><span class="en" style="display: none;">Install Node.js (recommended v16 or higher)</span>
# <span class="zh">从 https://nodejs.org 下载并安装</span><span class="en" style="display: none;">Download and install from https://nodejs.org</span>
```

2. <span class="zh">克隆仓库</span><span class="en" style="display: none;">Clone the repository</span>:
```bash
git clone https://github.com/yourusername/note-plan.git
cd note-plan
```