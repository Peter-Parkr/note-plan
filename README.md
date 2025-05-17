# Note Plan

一个基于Tauri开发的跨平台桌面应用，用于笔记管理和待办事项追踪。

A cross-platform desktop application built with Tauri for note-taking and todo management.

## 功能特点 | Features

### 笔记管理 | Note Management
- Markdown格式支持 | Markdown format support
- 标签系统 | Tag system
- 实时预览 | Real-time preview
- 创建、编辑、删除笔记 | Create, edit, and delete notes

### 待办事项 | Todo Management
- 支持每日任务 | Daily task support
- 任务完成状态追踪 | Task completion tracking
- 自动重置每日任务 | Automatic daily task reset
- 创建、删除、标记完成待办事项 | Create, delete, and mark todos as complete

## 技术栈 | Tech Stack

- **前端 | Frontend**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Marked.js (Markdown渲染 | Markdown rendering)

- **后端 | Backend**
  - Rust
  - Tauri
  - Serde (序列化 | Serialization)
  - Chrono (时间处理 | Time handling)

## 安装说明 | Installation

### 系统要求 | System Requirements
- Windows 10/11, macOS 10.15+, 或 Linux | Windows 10/11, macOS 10.15+, or Linux
- 至少 100MB 可用磁盘空间 | At least 100MB free disk space

### 从源码构建 | Build from Source

1. 安装依赖 | Install dependencies:
```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 Node.js (推荐 v16 或更高版本 | recommended v16 or higher)
# 从 https://nodejs.org 下载并安装
```

2. 克隆仓库 | Clone the repository:
```bash
git clone https://github.com/yourusername/note-plan.git
cd note-plan
```

3. 安装前端依赖 | Install frontend dependencies:
```bash
npm install
```

4. 构建应用 | Build the application:
```bash
npm run tauri build
```

构建完成后，可执行文件将位于 `src-tauri/target/release` 目录下。
The executable will be located in the `src-tauri/target/release` directory after building.

## 使用说明 | Usage

### 笔记功能 | Note Features

1. **创建笔记 | Creating Notes**
   - 在主页输入标题和内容 | Enter title and content on the main page
   - 支持Markdown格式 | Supports Markdown format
   - 可添加标签（用逗号分隔）| Add tags (comma-separated)

2. **编辑笔记 | Editing Notes**
   - 点击笔记进入编辑模式 | Click on a note to enter edit mode
   - 实时预览Markdown效果 | Real-time Markdown preview
   - 可修改标题、内容和标签 | Modify title, content, and tags

3. **标签管理 | Tag Management**
   - 左侧边栏显示所有标签 | All tags shown in left sidebar
   - 点击标签筛选相关笔记 | Click tags to filter related notes
   - 支持标签展开/折叠 | Support tag expansion/collapse

### 待办事项 | Todo Features

1. **创建待办 | Creating Todos**
   - 输入任务内容 | Enter task content
   - 可选择是否为每日任务 | Option to set as daily task
   - 点击添加按钮创建 | Click add button to create

2. **管理待办 | Managing Todos**
   - 勾选复选框标记完成 | Check checkbox to mark as complete
   - 每日任务会在新的一天自动重置 | Daily tasks reset automatically each day
   - 可删除已完成或不需要的任务 | Delete completed or unnecessary tasks

## 贡献指南 | Contributing

欢迎提交问题和改进建议！| Issues and pull requests are welcome!

1. Fork 本仓库 | Fork this repository
2. 创建特性分支 | Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 提交更改 | Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 | Push to the branch (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request | Open a Pull Request

## 许可证 | License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 联系方式 | Contact

如有问题或建议，请通过以下方式联系：
For questions or suggestions, please contact:

- 提交 Issue | Submit an issue
- 发送邮件至 | Email: your.email@example.com

---

感谢使用 Note Plan！| Thank you for using Note Plan!
