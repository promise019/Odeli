# Contributing to Odeli

First off, thank you for considering contributing to Odeli!

Odeli is an open-source IDE built with Rust, TypeScript, HTML, and Tailwind CSS. The goal is to create a fast, lightweight, and intuitive development environment that is free for everyone.

Whether you're fixing bugs, improving documentation, designing the UI, or implementing new features, your contribution is appreciated.

---

# Before You Start

Please:

- Search existing Issues before opening a new one.
- Open an Issue before working on large features.
- Keep pull requests focused on a single feature or fix.
- Follow the project's coding style.
- Write clear commit messages.

---

# Development Setup

## Requirements

- Rust (stable)
- Cargo
- Node.js
- npm
- Git

Clone the repository:

```bash
git clone https://github.com/promise019/Odeli.git
cd Odeli
```

---

## Rust

Build the project:

```bash
cargo build
```

Run:

```bash
cargo run -p app
```

---

## Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Tailwind watcher:

```bash
npm run tailwind
```

Start the local development server:

```bash
npm run dev
```

---

# Branch Naming

Please create feature branches instead of committing directly to `main`.

Examples:

```
feature/editor
feature/file-explorer
feature/terminal
feature/git
feature/ai
feature/settings

fix/window-crash
fix/sidebar-layout

docs/readme
docs/api
```

---

# Commit Messages

Use conventional commits whenever possible.

Examples:

```
feat: add activity bar

feat: implement file explorer

fix: prevent window resize crash

docs: update README

refactor: simplify ipc bridge

style: improve sidebar spacing

chore: update dependencies
```

---

# Pull Requests

A good pull request should:

- Have a clear title.
- Explain what changed.
- Explain why the change was made.
- Include screenshots for UI changes when applicable.
- Reference related issues if any.

Small pull requests are easier to review than very large ones.

---

# Coding Guidelines

## Rust

- Prefer idiomatic Rust.
- Avoid unnecessary cloning.
- Handle errors properly.
- Keep modules focused on one responsibility.
- Write readable code before clever code.

## Frontend

- Use TypeScript.
- Keep components modular.
- Prefer semantic HTML.
- Use Tailwind utilities consistently.
- Avoid unnecessary dependencies.

---

# Project Structure

```
odeli/
│
├── crates/
│   ├── app/
│   └── window/
│
├── frontend/
│
├── assets/
│
└── docs/
```

As the project grows, additional crates and directories may be introduced.

---

# Reporting Bugs

When reporting a bug, include:

- Operating system
- Rust version
- Node version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or logs if available

---

# Feature Requests

Feature requests are welcome.

Please describe:

- The problem you're trying to solve.
- Your proposed solution.
- Any alternatives you've considered.

---

# Code of Conduct

Please be respectful and constructive.

Everyone should feel welcome regardless of experience level.

Harassment, discrimination, or personal attacks will not be tolerated.

---

# License

By contributing to Odeli, you agree that your contributions will be licensed under the GNU General Public License v3.0 (GPL-3.0).

---

Thank you for helping build Odeli.
