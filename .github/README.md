# Note Plan

A cross-platform desktop application built with Tauri for note-taking and todo management.

[中文文档 | Chinese Documentation](README.zh.md)

## Features

### Note Management
- Markdown format support
- Tag system
- Real-time preview
- Create, edit, and delete notes

### Todo Management
- Daily task support
- Task completion tracking
- Automatic daily task reset
- Create, delete, and mark todos as complete

## Tech Stack

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Marked.js (Markdown rendering)

- **Backend**
  - Rust
  - Tauri
  - Serde (Serialization)
  - Chrono (Time handling)

## Installation

### System Requirements
- Windows 10/11, macOS 10.15+, or Linux
- At least 100MB free disk space

### Build from Source

1. Install dependencies:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js (recommended v16 or higher)
# Download and install from https://nodejs.org
```

2. Clone the repository:
```bash
git clone https://github.com/Peter-Parkr/note-plan.git
cd note-plan
```

3. Install frontend dependencies:
```bash
npm install
```

4. Build the application:
```bash
npm run tauri build
```

The executable will be located in the `src-tauri/target/release` directory after building.

## Usage

### Note Features

1. **Creating Notes**
   - Enter title and content on the main page
   - Supports Markdown format
   - Add tags (comma-separated)

2. **Editing Notes**
   - Click on a note to enter edit mode
   - Real-time Markdown preview
   - Modify title, content, and tags

3. **Tag Management**
   - All tags shown in left sidebar
   - Click tags to filter related notes
   - Support tag expansion/collapse

### Todo Features

1. **Creating Todos**
   - Enter task content
   - Option to set as daily task
   - Click add button to create

2. **Managing Todos**
   - Check checkbox to mark as complete
   - Daily tasks reset automatically each day
   - Delete completed or unnecessary tasks

## Contributing

Issues and pull requests are welcome!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, please contact:

- Submit an issue
- Email: 2080079861@qq.com

---

Thank you for using Note Plan! 