use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum FsError {
    #[error("Path not found: {0}")]
    NotFound(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    #[error("IO Error: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub is_symlink: bool,
}

pub struct FileSystemEngine;

impl FileSystemEngine {
    /// Read contents of a directory and return sorted file entries
    pub fn read_dir<P: AsRef<Path>>(path: P) -> Result<Vec<FileItem>, FsError> {
        let path = path.as_ref();
        if !path.exists() {
            return Err(FsError::NotFound(path.display().to_string()));
        }

        let entries = fs::read_dir(path)?;
        let mut items = Vec::new();

        for entry in entries.flatten() {
            let entry_path = entry.path();

            let file_type = match entry.file_type() {
                Ok(ft) => ft,
                Err(_) => continue,
            };

            let is_symlink = file_type.is_symlink();
            let metadata = entry_path.metadata().ok();
            let is_dir = metadata
                .as_ref()
                .map(|m| m.is_dir())
                .unwrap_or_else(|| file_type.is_dir());
            let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);

            items.push(FileItem {
                name: entry.file_name().to_string_lossy().to_string(),
                path: entry_path.to_string_lossy().to_string(),
                is_dir,
                size,
                is_symlink,
            });
        }

        // Sort: Folders first, then case-insensitive alphabetical
        items.sort_by(|a, b| match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        });

        Ok(items)
    }

    /// Read raw text content from a file
    pub fn read_file<P: AsRef<Path>>(path: P) -> Result<String, FsError> {
        let path = path.as_ref();
        fs::read_to_string(path).map_err(FsError::Io)
    }

    /// Write content to a file safely, creating parent folders if needed
    pub fn write_file<P: AsRef<Path>>(path: P, content: &str) -> Result<(), FsError> {
        let path = path.as_ref();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(path, content).map_err(FsError::Io)
    }

    /// Create a new folder directory
    pub fn create_dir<P: AsRef<Path>>(path: P) -> Result<(), FsError> {
        fs::create_dir_all(path).map_err(FsError::Io)
    }

    /// Delete a file or directory recursively
    pub fn delete_node<P: AsRef<Path>>(path: P) -> Result<(), FsError> {
        let path = path.as_ref();
        if path.is_dir() {
            fs::remove_dir_all(path).map_err(FsError::Io)
        } else {
            fs::remove_file(path).map_err(FsError::Io)
        }
    }
}
