use serde::{Serialize, Deserialize};
use std::sync::Mutex;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use tauri::Manager; // Required for AppHandle to get path
use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use std::path::PathBuf;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// --- Data Structures ---
#[derive(Debug, Serialize, Deserialize, Clone)]
struct Note {
    id: String,
    title: String,
    content: String,
    tags: Option<Vec<String>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Todo {
    id: String,
    task: String,
    completed: bool,
    is_daily: bool,
    created_at: DateTime<Utc>,
}

// Combined data structure for serialization
#[derive(Debug, Serialize, Deserialize, Clone, Default)] // Default for easy initialization
struct AppData {
    notes: Vec<Note>,
    todos: Vec<Todo>,
    last_daily_reset_date: Option<String>, // New field for tracking daily reset
}

// --- Application State ---
struct AppState {
    data: Mutex<AppData>, // Holds all notes and todos
    app_handle: tauri::AppHandle, // To get app paths
}

const DATA_FILE_NAME: &str = "note_plan_data.json";

fn get_data_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    match app_handle.path().app_data_dir() {
        Ok(base_path) => Ok(base_path.join(DATA_FILE_NAME)),
        Err(tauri_error) => Err(format!("Failed to get app data directory: {}", tauri_error.to_string())),
    }
}

fn load_data(app_handle: &tauri::AppHandle) -> AppData {
    match get_data_file_path(app_handle) {
        Ok(path) => {
            if path.exists() {
                match File::open(&path) {
                    Ok(mut file) => {
                        let mut contents = String::new();
                        if file.read_to_string(&mut contents).is_ok() {
                            match serde_json::from_str(&contents) {
                                Ok(data) => return data,
                                Err(e) => {
                                    eprintln!("Failed to parse data file, using default. Error: {}", e);
                                }
                            }
                        } else {
                            eprintln!("Failed to read data file, using default.");
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to open data file, using default. Error: {}", e);
                    }
                }
            } else {
                // File doesn't exist, which is fine for the first run.
            }
        }
        Err(e) => {
            eprintln!("Failed to get data file path: {}. Using default data.", e);
        }
    }
    AppData::default() // Return default (empty) data if any error occurs
}

fn save_data(app_handle: &tauri::AppHandle, data: &AppData) -> Result<(), String> {
    let path = get_data_file_path(app_handle)?;
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create data directory: {}", e))?;
        }
    }

    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true) // Overwrite existing file
        .open(&path)
        .map_err(|e| format!("Failed to open/create data file for writing: {}", e))?;

    let json_data = serde_json::to_string_pretty(data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;

    file.write_all(json_data.as_bytes())
        .map_err(|e| format!("Failed to write data to file: {}", e))?;
    Ok(())
}

impl AppState {
    fn new(app_handle: tauri::AppHandle) -> Self {
        let loaded_data = load_data(&app_handle);
        Self {
            data: Mutex::new(loaded_data),
            app_handle,
        }
    }
}

// --- Tauri Commands ---

// Note Commands
#[tauri::command]
fn add_note(state: tauri::State<AppState>, title: String, content: String, tags: Option<Vec<String>>) -> Result<(), String> {
    let mut app_data = state.data.lock().map_err(|e| e.to_string())?;
    let now = Utc::now();
    let new_note = Note {
        id: Uuid::new_v4().to_string(),
        title,
        content,
        tags: tags.map(|t_vec| t_vec.into_iter().map(|t| t.trim().to_lowercase()).filter(|t| !t.is_empty()).collect()),
        created_at: now,
        updated_at: now,
    };
    app_data.notes.push(new_note);
    save_data(&state.app_handle, &app_data)
}

#[tauri::command]
fn get_notes(state: tauri::State<AppState>) -> Result<Vec<Note>, String> {
    let app_data = state.data.lock().map_err(|e| e.to_string())?;
    Ok(app_data.notes.clone())
}

#[tauri::command]
fn update_note(state: tauri::State<AppState>, id: String, title: String, content: String, tags: Option<Vec<String>>) -> Result<(), String> {
    let mut app_data = state.data.lock().map_err(|e| e.to_string())?;
    if let Some(note) = app_data.notes.iter_mut().find(|n| n.id == id) {
        note.title = title;
        note.content = content;
        note.tags = tags.map(|t_vec| t_vec.into_iter().map(|t| t.trim().to_lowercase()).filter(|t| !t.is_empty()).collect());
        note.updated_at = Utc::now();
        save_data(&state.app_handle, &app_data)
    } else {
        Err("Note not found".to_string())
    }
}

#[tauri::command]
fn delete_note(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let mut app_data = state.data.lock().map_err(|e| e.to_string())?;
    let initial_len = app_data.notes.len();
    app_data.notes.retain(|note| note.id != id);
    if app_data.notes.len() < initial_len {
        save_data(&state.app_handle, &app_data)
    } else {
        Ok(()) // No change, no need to save. Or return Err if note not found for deletion.
    }
}

// New command to get all unique tags
#[tauri::command]
fn get_all_tags(state: tauri::State<AppState>) -> Result<Vec<String>, String> {
    let app_data = state.data.lock().map_err(|e| e.to_string())?;
    let mut all_tags = std::collections::HashSet::new();
    for note in app_data.notes.iter() {
        if let Some(tags) = &note.tags {
            for tag in tags {
                all_tags.insert(tag.clone());
            }
        }
    }
    Ok(all_tags.into_iter().collect())
}

// Todo Commands
#[tauri::command]
fn add_todo(state: tauri::State<AppState>, task: String, is_daily: bool) -> Result<(), String> {
    let mut app_data = state.data.lock().map_err(|e| e.to_string())?;
    let now = Utc::now();
    let new_todo = Todo {
        id: Uuid::new_v4().to_string(),
        task,
        completed: false,
        is_daily,
        created_at: now,
    };
    app_data.todos.push(new_todo);
    save_data(&state.app_handle, &app_data)
}

#[tauri::command]
fn get_todos(state: tauri::State<AppState>) -> Result<Vec<Todo>, String> {
    let app_data = state.data.lock().map_err(|e| e.to_string())?;
    Ok(app_data.todos.clone())
}

#[tauri::command]
fn toggle_todo_status(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let mut app_data = state.data.lock().map_err(|e| e.to_string())?;
    if let Some(todo) = app_data.todos.iter_mut().find(|t| t.id == id) {
        todo.completed = !todo.completed;
        save_data(&state.app_handle, &app_data)
    } else {
        Err("Todo not found".to_string())
    }
}

#[tauri::command]
fn delete_todo(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let mut app_data = state.data.lock().map_err(|e| e.to_string())?;
    let initial_len = app_data.todos.len();
    app_data.todos.retain(|todo| todo.id != id);
    if app_data.todos.len() < initial_len {
        save_data(&state.app_handle, &app_data)
    } else {
        Ok(()) // No change, no need to save. Or return Err if todo not found.
    }
}

#[tauri::command]
fn check_and_reset_daily_todos(state: tauri::State<AppState>) -> Result<bool, String> {
    let mut app_data = state.data.lock().map_err(|e| e.to_string())?;
    let now_utc = Utc::now();
    let current_date_str = now_utc.format("%Y-%m-%d").to_string();

    let mut needs_reset = false;
    match &app_data.last_daily_reset_date {
        Some(last_reset_str) => {
            if current_date_str > *last_reset_str {
                needs_reset = true;
            }
        }
        None => {
            // If no last reset date, it's the first time or data was cleared, so reset.
            needs_reset = true;
        }
    }

    if needs_reset {
        let mut modified = false;
        for todo in app_data.todos.iter_mut() {
            if todo.is_daily && todo.completed {
                todo.completed = false;
                modified = true;
            }
        }
        app_data.last_daily_reset_date = Some(current_date_str);
        // Save data only if something was actually reset or the date was updated for the first time.
        // The modified flag helps if all daily tasks were already incomplete.
        // We always save if needs_reset is true because last_daily_reset_date is updated.
        save_data(&state.app_handle, &app_data)?;
        Ok(modified) // Return true if any task was actually reset, or just true if date updated.
                     // Let's return true if a reset cycle was due and processed.
    } else {
        Ok(false) // No reset was needed
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_state = AppState::new(app.handle().clone());
            app.manage(app_state); 
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            add_note,
            get_notes,
            update_note, 
            delete_note,
            get_all_tags, 
            add_todo,
            get_todos,
            toggle_todo_status,
            delete_todo,
            check_and_reset_daily_todos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
