import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'; // Using CDN for simplicity, or use local import if bundled
const { invoke } = window.__TAURI__.core;

// --- DOM Elements ---
// Main View Elements
const mainView = document.getElementById('main-view');
const noteForm = document.getElementById('note-form');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentInput = document.getElementById('note-content-input');
const noteTagsInput = document.getElementById('note-tags-input'); // New input for tags in form
const notesList = document.getElementById('notes-list');

const todoForm = document.getElementById('todo-form');
const todoTaskInput = document.getElementById('todo-task-input');
const todoIsDailyInput = document.getElementById('todo-is-daily-input'); // New daily checkbox
const todosList = document.getElementById('todos-list');

const tagsListSidebar = document.getElementById('tags-list-sidebar'); // Tags sidebar list

// Note Editor View Elements
const noteEditorView = document.getElementById('note-editor-view');
const editorNoteTitle = document.getElementById('editor-note-title');
const editorNoteTags = document.getElementById('editor-note-tags'); // New input for tags in editor
const markdownInput = document.getElementById('markdown-input');
const markdownPreview = document.getElementById('markdown-preview');
const saveNoteBtn = document.getElementById('save-note-btn');
const backToListBtn = document.getElementById('back-to-list-btn');
const editorNoteCreated = document.getElementById('editor-note-created');
const editorNoteUpdated = document.getElementById('editor-note-updated');

let currentEditingNoteId = null;
let allNotesCache = []; // Cache for all notes to avoid re-fetching for editor
let currentFilterTag = 'all'; // To keep track of the currently selected tag for filtering
// To keep track of expanded tags in the sidebar, using a Set for efficient add/remove/check
const expandedTags = new Set(); 

// --- View Management ---
function showMainView() {
    mainView.style.display = 'block';
    noteEditorView.style.display = 'none';
    currentEditingNoteId = null;
    loadNotes(); 
    loadTodos();
    loadAndRenderTags(); 
}

async function showEditorView(noteId) {
    mainView.style.display = 'none';
    noteEditorView.style.display = 'block';
    currentEditingNoteId = noteId;

    try {
        // Try to find note in cache first
        let noteToEdit = allNotesCache.find(note => note.id === noteId);
        if (!noteToEdit) { // If not in cache, fetch (should ideally not happen if list is up-to-date)
            console.warn("Note not found in cache, fetching all notes again.");
            await loadNotes(); // This will update allNotesCache
            noteToEdit = allNotesCache.find(note => note.id === noteId);
        }

        if (noteToEdit) {
            editorNoteTitle.value = noteToEdit.title;
            markdownInput.value = noteToEdit.content;
            editorNoteTags.value = noteToEdit.tags ? noteToEdit.tags.join(', ') : ''; // Populate tags input
            renderMarkdownPreview(noteToEdit.content);
            editorNoteCreated.textContent = `创建于: ${new Date(noteToEdit.created_at).toLocaleString()}`;
            editorNoteUpdated.textContent = `最后更新: ${new Date(noteToEdit.updated_at).toLocaleString()}`;
        } else {
            console.error('Error: Note to edit not found.');
            alert('无法加载笔记进行编辑。');
            showMainView(); // Go back to main view if note not found
        }
    } catch (error) {
        console.error('Failed to load note for editing:', error);
        alert('加载笔记进行编辑失败。');
        showMainView();
    }
}

function renderMarkdownPreview(markdownText) {
    markdownPreview.innerHTML = marked(markdownText);
}

// --- Tags Functions ---
async function loadAndRenderTags() {
    try {
        const tags = await invoke('get_all_tags');
        tagsListSidebar.innerHTML = ''; 
        
        const allNotesLi = document.createElement('li');
        allNotesLi.dataset.tag = 'all';
        allNotesLi.innerHTML = `<span class="tag-text">所有笔记</span>`; 
        if (currentFilterTag === 'all') {
            allNotesLi.classList.add('active-tag');
        }
        tagsListSidebar.appendChild(allNotesLi);

        tags.sort(); 
        tags.forEach(tag => {
            const li = document.createElement('li');
            li.dataset.tag = tag;
            
            const toggleIcon = document.createElement('span');
            toggleIcon.classList.add('toggle-icon');
            
            const tagText = document.createElement('span');
            tagText.classList.add('tag-text');
            tagText.textContent = escapeHtml(tag);

            li.appendChild(toggleIcon);
            li.appendChild(tagText);
            
            if (tag === currentFilterTag && currentFilterTag !== 'all') { // Ensure 'all' doesn't steal active if a tag is the filter
                li.classList.add('active-tag');
            }

            const subListUl = document.createElement('ul');
            subListUl.classList.add('notes-under-tag');
            li.appendChild(subListUl); 

            tagsListSidebar.appendChild(li);

            const isExpanded = expandedTags.has(tag);
            if (isExpanded) {
                toggleSubList(li, true, false); 
            }
            updateToggleIcon(li, isExpanded); // Set initial icon state (expanded or collapsed)
        });
        // Final check for "All Notes" active state if no specific tag is the filter
        if (currentFilterTag === 'all') {
             tagsListSidebar.querySelector('li[data-tag="all"]')?.classList.add('active-tag');
        }

    } catch (error) {
        console.error('Failed to load tags:', error);
    }
}

function updateToggleIcon(tagLiElement, isExpanded) {
    const toggleIcon = tagLiElement.querySelector('.toggle-icon');
    if (toggleIcon) {
        toggleIcon.textContent = '►'; // Always set base icon via JS, CSS handles rotation if expanded
        if (isExpanded) {
            toggleIcon.classList.add('expanded');
        } else {
            toggleIcon.classList.remove('expanded');
        }
    }
}

function toggleSubList(tagLiElement, forceExpand = null, updateMainFilter = true) {
    const tagName = tagLiElement.dataset.tag;
    if (!tagName || tagName === 'all') return; 

    const subListUl = tagLiElement.querySelector('ul.notes-under-tag');
    const isCurrentlyExpanded = expandedTags.has(tagName);
    
    let shouldExpand = forceExpand !== null ? forceExpand : !isCurrentlyExpanded;

    if (shouldExpand) {
        expandedTags.add(tagName);
        renderNotesUnderTag(subListUl, tagName);
        subListUl.classList.add('expanded'); // CSS will make it display: block;
    } else {
        expandedTags.delete(tagName);
        subListUl.classList.remove('expanded'); // CSS will make it display: none;
    }
    updateToggleIcon(tagLiElement, shouldExpand); // This will now also handle adding/removing .expanded for icon rotation

    if (updateMainFilter) {
        currentFilterTag = tagName; 
        tagsListSidebar.querySelectorAll('li[data-tag]').forEach(li => {
            li.classList.remove('active-tag');
            // Also ensure non-active tags that are not the one being toggled have their sublists collapsed if we want that behavior
            // For now, only manage the current one and its active state for filtering
        });
        tagLiElement.classList.add('active-tag');
        const allNotesLi = tagsListSidebar.querySelector('li[data-tag="all"]');
        if(allNotesLi && tagName !== 'all') { 
             allNotesLi.classList.remove('active-tag');
        }
        renderNotesList(allNotesCache); 
    }
}

function renderNotesUnderTag(subListUl, tagName) {
    subListUl.innerHTML = ''; 
    const notesForTag = allNotesCache.filter(note => note.tags && note.tags.includes(tagName));
    notesForTag.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));

    if (notesForTag.length === 0) {
        const li = document.createElement('li');
        li.textContent = '(此标签下无笔记)'; // More specific message
        li.style.fontStyle = 'italic';
        li.style.color = '#999';
        li.style.cursor = 'default';
        subListUl.appendChild(li);
        return;
    }

    notesForTag.forEach(note => {
        const li = document.createElement('li');
        li.textContent = escapeHtml(note.title);
        li.dataset.noteId = note.id;
        li.title = escapeHtml(note.title); // Add a tooltip with the full title
        li.style.cursor = 'pointer';
        subListUl.appendChild(li);
    });
}

tagsListSidebar.addEventListener('click', (e) => {
    const targetLiWithTag = e.target.closest('li[data-tag]');
    if (!targetLiWithTag) return;

    const tagName = targetLiWithTag.dataset.tag;
    
    // Check if the click was on a note title within a sublist
    if (e.target.tagName === 'LI' && e.target.dataset.noteId && e.target.closest('ul.notes-under-tag')) {
        showEditorView(e.target.dataset.noteId);
        return;
    }

    if (tagName === 'all') {
        currentFilterTag = 'all';
        expandedTags.clear(); 
        // Deselect all other tags and activate "All Notes"
        tagsListSidebar.querySelectorAll('li[data-tag]').forEach(li => li.classList.remove('active-tag'));
        targetLiWithTag.classList.add('active-tag');
        // Collapse all sublists by re-rendering tags, icons will be updated
        loadAndRenderTags(); 
        renderNotesList(allNotesCache);
        return;
    }

    // If clicking a tag (either its text or toggle icon) to toggle its sublist AND filter
    toggleSubList(targetLiWithTag, null, true);
});

// --- Notes Functions ---
async function loadNotes() {
    try {
        const notes = await invoke('get_notes');
        allNotesCache = notes; // Update cache
        renderNotesList(notes);
    } catch (error) {
        console.error('Failed to load notes:', error);
        allNotesCache = [];
        notesList.innerHTML = '<p>加载笔记错误。</p>';
    }
}

function renderNotesList(notes) {
    notesList.innerHTML = '';
    const filteredNotes = currentFilterTag === 'all' 
        ? notes 
        : notes.filter(note => note.tags && note.tags.includes(currentFilterTag));

    if (filteredNotes.length === 0) {
        notesList.innerHTML = currentFilterTag === 'all' 
            ? '<p>还没有笔记，快来添加一个吧！</p>' 
            : `<p>没有找到标签为 "${escapeHtml(currentFilterTag)}" 的笔记。</p>` ;
        return;
    }

    filteredNotes.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at)); // Sort by most recently updated

    filteredNotes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.classList.add('note-item');

        const noteClickableArea = document.createElement('div');
        noteClickableArea.classList.add('note-main-content');
        noteClickableArea.dataset.noteId = note.id; // Keep for click handler
        const noteTagsHtml = note.tags && note.tags.length > 0 
            ? `<div class="note-item-tags">${note.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>` 
            : '';
        noteClickableArea.innerHTML = `
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')).replace(/\n/g, '<br>')}</p>
            ${noteTagsHtml}
            <small>最后更新: ${new Date(note.updated_at).toLocaleString()}</small>
        `;
        noteEl.appendChild(noteClickableArea);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.dataset.id = note.id;
        deleteBtn.dataset.type = 'note';
        deleteBtn.textContent = '删除';
        noteEl.appendChild(deleteBtn);

        notesList.appendChild(noteEl);
    });
}

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const tags = parseTagsString(noteTagsInput.value);

    if (title && content) {
        try {
            await invoke('add_note', { title, content, tags });
            noteTitleInput.value = '';
            noteContentInput.value = '';
            noteTagsInput.value = ''; // Clear tags input
            await loadNotes();
            await loadAndRenderTags(); // Refresh tags in sidebar
        } catch (error) {
            console.error('Failed to add note:', error);
            alert('添加笔记失败！');
        }
    }
});

// --- Todos Functions ---
async function loadTodos() {
    try {
        const todos = await invoke('get_todos');
        renderTodosList(todos);
    } catch (error) {
        console.error('Failed to load todos:', error);
        todosList.innerHTML = '<p>加载待办事项错误。</p>';
    }
}

function renderTodosList(todos) {
    todosList.innerHTML = '';
    if (todos.length === 0) {
        todosList.innerHTML = '<p>没有待办事项！</p>';
        return;
    }

    const dailyTodos = todos.filter(todo => todo.is_daily);
    const regularTodos = todos.filter(todo => !todo.is_daily);

    const sortedTodos = [
        ...dailyTodos.sort((a,b) => a.task.localeCompare(b.task)), 
        ...regularTodos.sort((a,b) => a.task.localeCompare(b.task))
    ];

    sortedTodos.forEach(todo => {
        const todoEl = document.createElement('div');
        todoEl.classList.add('todo-item');
        if (todo.completed) {
            todoEl.classList.add('completed');
        }
        if (todo.is_daily) {
            todoEl.classList.add('daily-todo'); 
        }

        // Checkbox for completion status
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.dataset.id = todo.id;
        checkbox.classList.add('todo-checkbox'); // For styling and event delegation
        todoEl.appendChild(checkbox);
        
        const todoTextSpan = document.createElement('span');
        todoTextSpan.classList.add('todo-text'); // New class for just the text
        // todoTextSpan.dataset.id = todo.id; // ID is on checkbox now for direct toggle
        // todoTextSpan.dataset.type = 'toggle-todo'; // Click on text could still toggle, or just be text
        
        let taskText = escapeHtml(todo.task);
        if (todo.is_daily) {
            // Task text can remain clean, visual indication of daily can be via class or icon
            // For now, keeping the [每日] prefix for clarity with current styling phase
            taskText = `<span class="daily-marker">[每日]</span> ${taskText}`;
        }
        todoTextSpan.innerHTML = taskText; 
        todoEl.appendChild(todoTextSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.dataset.id = todo.id;
        deleteBtn.dataset.type = 'todo'; // Keep for delete logic
        deleteBtn.textContent = '删除';
        todoEl.appendChild(deleteBtn);
        
        todosList.appendChild(todoEl);
    });
}

todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const task = todoTaskInput.value.trim();
    const isDaily = todoIsDailyInput.checked; // Get the state of the new checkbox

    if (task) {
        try {
            await invoke('add_todo', { task, isDaily }); // Pass isDaily to backend
            todoTaskInput.value = '';
            todoIsDailyInput.checked = false; // Reset the checkbox
            await loadTodos();
        } catch (error) {
            console.error('Failed to add todo:', error);
            alert('添加待办失败！');
        }
    }
});

// --- Editor Logic ---
markdownInput.addEventListener('input', (e) => {
    renderMarkdownPreview(e.target.value);
});

saveNoteBtn.addEventListener('click', async () => {
    if (!currentEditingNoteId) return;
    const title = editorNoteTitle.value.trim();
    const content = markdownInput.value.trim(); // Markdown content
    const tags = parseTagsString(editorNoteTags.value);

    if (!title) {
        alert('笔记标题不能为空！');
        return;
    }

    try {
        await invoke('update_note', { id: currentEditingNoteId, title, content, tags });
        alert('笔记已保存！');
        
        const noteInCache = allNotesCache.find(n => n.id === currentEditingNoteId);
        if(noteInCache) {
            noteInCache.title = title;
            noteInCache.content = content;
            noteInCache.tags = tags;
            noteInCache.updated_at = new Date().toISOString(); 
            editorNoteUpdated.textContent = `最后更新: ${new Date(noteInCache.updated_at).toLocaleString()}`;
        }
        await loadAndRenderTags(); // Refresh tags; this will also re-apply expanded state for visible tags
    } catch (error) {
        console.error('Failed to save note:', error);
        alert('保存笔记失败！');
    }
});

backToListBtn.addEventListener('click', () => {
    showMainView();
});


// --- Event Delegation for Main View (needs to handle checkbox clicks) ---
document.getElementById('main-view').addEventListener('click', async (e) => {
    // Handle Clicking on a note to open editor
    const noteContentClicked = e.target.closest('.note-main-content');
    if (noteContentClicked && noteContentClicked.dataset.noteId) {
        showEditorView(noteContentClicked.dataset.noteId);
        return; // Stop further processing if it was a note click
    }

    // Handle Delete Buttons (for notes and todos)
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        if (!id || !type) return;

        const confirmDelete = confirm("确定要删除吗？");
        if (!confirmDelete) return;

        try {
            if (type === 'note') {
                await invoke('delete_note', { id });
                await loadNotes(); // Reload notes in main view
                await loadAndRenderTags(); // If the deleted note was the last one for a tag that was expanded, that tag might disappear
                // or its sublist might become empty. loadAndRenderTags will handle this.
            } else if (type === 'todo') {
                await invoke('delete_todo', { id });
                await loadTodos(); // Reload todos in main view
            }
        } catch (error) {
            console.error(`Failed to delete ${type}:`, error);
            alert(`删除${type === 'note' ? '笔记' : '待办'}失败！`);
        }
        return; // Stop further processing if it was a delete click
    }
    
    // Handle Toggle Todo Status via Checkbox
    if (e.target.classList.contains('todo-checkbox') && e.target.dataset.id) {
        const id = e.target.dataset.id;
        try {
            // No need to pass current checked state, backend toggles it
            await invoke('toggle_todo_status', { id });
            await loadTodos(); // Refresh list to show updated status
        } catch (error) {
            console.error('Failed to toggle todo status:', error);
            alert('更新待办状态失败！');
            // Potentially revert checkbox state if API call fails
            e.target.checked = !e.target.checked; 
        }
        return; 
    }

    // Optional: Handle Toggle Todo Status by clicking on the text (if desired)
    /*
    const todoTextClicked = e.target.closest('.todo-text'); // Or a more specific selector
    if (todoTextClicked) {
        const todoItemDiv = todoTextClicked.closest('.todo-item');
        const checkbox = todoItemDiv?.querySelector('.todo-checkbox');
        if (checkbox && checkbox.dataset.id) {
            const id = checkbox.dataset.id;
            try {
                await invoke('toggle_todo_status', { id });
                await loadTodos();
            } catch (error) {
                console.error('Failed to toggle todo status:', error);
                alert('更新待办状态失败！');
            }
            return;
        }
    }
    */
});


// --- Utility function to escape HTML ---
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

// --- Utility Function to parse tags string ---
function parseTagsString(tagsStr) {
    if (!tagsStr || typeof tagsStr !== 'string') return [];
    return tagsStr.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');
}

async function initializeApp() {
    try {
        const resetHappened = await invoke('check_and_reset_daily_todos');
        if (resetHappened) {
            console.log('Daily todos were reset.');
        }
    } catch (error) {
        console.error('Error during daily todo reset check:', error);
    }
    showMainView(); // This already calls loadNotes, loadTodos, loadAndRenderTags
}

// Initial Load & Daily Reset Check
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Optional: Re-check on window focus if app is open across midnight
window.addEventListener('focus', async () => {
    console.log("Window focused, re-checking daily todos.");
    try {
        const resetHappened = await invoke('check_and_reset_daily_todos');
        if (resetHappened) {
            console.log('Daily todos were reset on focus.');
            await loadTodos(); // Explicitly reload todos if reset happened on focus
        }
    } catch (error) {
        console.error('Error during daily todo reset check on focus:', error);
    }
});
