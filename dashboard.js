    // *Reference*: MDN Web Docs
    // *Topic*: DOMContentLoaded event
    // *URL*: https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
document.addEventListener('DOMContentLoaded', () => {
    const addEntryBtn = document.getElementById('add-entry-btn');
    const modal = document.getElementById('modal');
    const saveBtn = document.getElementById('save-entry-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const tableBody = document.querySelector('#application-table tbody');
    const historyTableBody = document.querySelector('#history-table tbody');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const historyModal = document.getElementById('history-modal');

    let applications = [];
    let editIndex = -1; // Keep track of the entry being edited

    // *Reference*: Chrome Developers
    // *Topic*: chrome.storage API
    // *URL*: https://developer.chrome.com/docs/extensions/reference/storage
    // Load data from storage for applications
    chrome.storage.local.get(['applications'], (result) => {
        applications = result.applications || [];
        renderTable();
    });

    // Load data from storage for form history
    chrome.storage.local.get(['formHistory'], (result) => {
        const history = result.formHistory || [];
        renderHistoryTable(history);
    });

    // Render the applications table
    function renderTable() {
        tableBody.innerHTML = '';
        applications.forEach((app, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.company}</td>
                <td>${app.jobTitle}</td>
                <td>${app.dateApplied}</td>
                <td>${app.status}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                editEntry(index);
            });
        });

        document.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                deleteEntry(index);
            });
        });
    }

    // Show the modal for adding a new entry
    addEntryBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        resetModal();
        editIndex = -1; // Ensure we're not editing
    });

    // Hide the modal
    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Save or update an application entry
    saveBtn.addEventListener('click', () => {
        const company = document.getElementById('company').value;
        const jobTitle = document.getElementById('job-title').value;
        const dateApplied = document.getElementById('date-applied').value;
        const status = document.getElementById('status').value;

        if (editIndex === -1) {
            // Add new entry
            applications.push({ company, jobTitle, dateApplied, status });
        } else {
            // Update existing entry
            applications[editIndex] = { company, jobTitle, dateApplied, status };
        }

        // Save to storage and refresh table
        chrome.storage.local.set({ applications }, renderTable);
        modal.classList.add('hidden');
    });

    // Reset the modal fields
    function resetModal() {
        document.getElementById('company').value = '';
        document.getElementById('job-title').value = '';
        document.getElementById('date-applied').value = '';
        document.getElementById('status').value = 'Pending';
    }

    // Edit an application entry
    function editEntry(index) {
        editIndex = index;
        const app = applications[index];
        document.getElementById('company').value = app.company;
        document.getElementById('job-title').value = app.jobTitle;
        document.getElementById('date-applied').value = app.dateApplied;
        document.getElementById('status').value = app.status;
        modal.classList.remove('hidden');
    }

    // Delete an application entry
    function deleteEntry(index) {
        applications.splice(index, 1);
        chrome.storage.local.set({ applications }, renderTable);
    }

    // Render the saved form history table
    function renderHistoryTable(history) {
        historyTableBody.innerHTML = '';
        history.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.url}</td>
                <td><pre>${JSON.stringify(entry.formData, null, 2)}</pre></td>
                <td>
                    <button class="delete-history-btn" data-index="${index}">Delete</button>
                </td>
            `;
            historyTableBody.appendChild(row);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-history-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                deleteHistoryEntry(index, history);
            });
        });
    }

    // Delete a saved history entry
    function deleteHistoryEntry(index, history) {
        if (confirm('Are you sure you want to delete this entry?')) {
            history.splice(index, 1);
            chrome.storage.local.set({ formHistory: history }, () => {
                alert('Entry deleted successfully.');
                renderHistoryTable(history);
            });
        }
    }

    // OpenAI. (2024, December 1). ChatGPT (v4). Prompt: "How to toggle visibility of a modal in JavaScript using classes?"
    // Show or hide the history modal
    viewHistoryBtn.addEventListener('click', () => {
        historyModal.classList.toggle('hidden');
    });

});