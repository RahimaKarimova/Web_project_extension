document.addEventListener('DOMContentLoaded', () => {
  const addEntryBtn = document.getElementById('add-entry-btn');
  const modal = document.getElementById('modal');
  const saveBtn = document.getElementById('save-entry-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const tableBody = document.querySelector('#application-table tbody');

  let applications = [];
  let editIndex = -1; // Keep track of the entry being edited

  // Load data from storage
  chrome.storage.local.get(['applications'], (result) => {
      applications = result.applications || [];
      renderTable();
  });

  // Render the table
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
      document.querySelectorAll('.edit-btn').forEach(button => {
          button.addEventListener('click', (event) => {
              const index = event.target.dataset.index;
              editEntry(index);
          });
      });
    
      document.querySelectorAll('.delete-btn').forEach(button => {
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

  // Save or update an entry
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

  // Edit an entry
  function editEntry(index) {
      editIndex = index;
      const app = applications[index];
      document.getElementById('company').value = app.company;
      document.getElementById('job-title').value = app.jobTitle;
      document.getElementById('date-applied').value = app.dateApplied;
      document.getElementById('status').value = app.status;
      modal.classList.remove('hidden');
  }

  // Delete an entry
  function deleteEntry(index) {
      applications.splice(index, 1);
      chrome.storage.local.set({ applications }, renderTable);
  }
});
