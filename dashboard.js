document.addEventListener('DOMContentLoaded', () => {
    const addEntryBtn = document.getElementById('add-entry-btn');
    const modal = document.getElementById('modal');
    const saveBtn = document.getElementById('save-entry-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const tableBody = document.querySelector('#application-table tbody');
  
    let applications = [];
  
    // Load data from storage
    chrome.storage.local.get(['applications'], (result) => {
      applications = result.applications || [];
      renderTable();
    });
  
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
            <button onclick="editEntry(${index})">Edit</button>
            <button onclick="deleteEntry(${index})">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  
    addEntryBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      resetModal();
    });
  
    cancelBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  
    saveBtn.addEventListener('click', () => {
      const company = document.getElementById('company').value;
      const jobTitle = document.getElementById('job-title').value;
      const dateApplied = document.getElementById('date-applied').value;
      const status = document.getElementById('status').value;
  
      applications.push({ company, jobTitle, dateApplied, status });
      chrome.storage.local.set({ applications }, renderTable);
  
      modal.classList.add('hidden');
    });
  
    function resetModal() {
      document.getElementById('company').value = '';
      document.getElementById('job-title').value = '';
      document.getElementById('date-applied').value = '';
      document.getElementById('status').value = 'Pending';
    }
  });
  