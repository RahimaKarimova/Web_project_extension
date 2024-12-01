let profiles = [];
let selectedProfileIndex = 0;

// Initialize an array to hold custom fields
let customFields = [];


// OpenAI. (2024, December 1). ChatGPT (v4). Prompt: "How to use DOMContentLoaded to initialize JavaScript functionality in a Chrome extension?"
// Load profiles when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  loadProfiles();

  // Event listeners for buttons and inputs
  document.getElementById('add-custom-field').addEventListener('click', () => {
    addCustomField();
  });

  document.getElementById('profile-select').addEventListener('change', () => {
    selectedProfileIndex = parseInt(document.getElementById('profile-select').value, 10);
    loadSelectedProfileData();
  });

  document.getElementById('new-profile').addEventListener('click', createNewProfile);
  document.getElementById('delete-profile').addEventListener('click', deleteProfile);
  document.getElementById('save').addEventListener('click', saveProfileData);

  document.getElementById('reload').addEventListener('click', loadProfiles);
  document.getElementById('auto-fill').addEventListener('click', autoFill);
  document.getElementById('export-data').addEventListener('click', exportData);
  document.getElementById('import-data').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  document.getElementById('file-input').addEventListener('change', importData);
  document.getElementById('extract-data').addEventListener('click', extractData);
  document.getElementById('send-email').addEventListener('click', sendEmail);

  // Reference: MDN Web Docs
  // Topic: chrome.tabs.create()
  // URL: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/create
  // Add Open Dashboard button listener
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });

  // Event listener for the "Generate Cover Letter" button
  document.getElementById('generate-letter').addEventListener('click', () => {
    const data = profiles[selectedProfileIndex].data;

    // Get company name and job title from input fields
    const companyName = document.getElementById('company-name').value.trim();
    const jobTitle = document.getElementById('job-title').value.trim();

    
    // OpenAI. (2024, November 10). ChatGPT (v4). Prompt: "How to implement a generate cover letter button in a Chrome extension?"
    // Call the createCoverLetter function
    createCoverLetter(data, companyName, jobTitle);
  });

  // Event listener for "Extract from Page" button
  document.getElementById('extract-job-details').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // Reference: GeeksforGeeks
      // Topic: Using chrome.scripting.executeScript
      // URL: https://www.geeksforgeeks.org/how-to-use-chrome-scripting-executescript-method/
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: extractJobDetails,
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error('Error injecting script:', chrome.runtime.lastError);
            alert('Error extracting job details: ' + chrome.runtime.lastError.message);
            return;
          }

          if (!results || results.length === 0 || !results[0].result) {
            console.error('No results from script execution');
            alert('Unable to extract job details from the page.');
            return;
          }

          const { jobTitle, companyName } = results[0].result;
          if (!jobTitle && !companyName) {
            alert('Unable to detect job title or company name on this page.');
            return;
          }

          // OpenAI. (2024, November 19). ChatGPT (v4). Prompt: "How to populate input fields dynamically in a Chrome extension popup?"
          // Populate the input fields in the popup
          if (jobTitle) {
            document.getElementById('job-title').value = jobTitle;
          }
          if (companyName) {
            document.getElementById('company-name').value = companyName;
          }

          showMessage('Job details extracted successfully.');
        }
      );
    });
  });

  loadMappings();
  // Add autofill button functionality
  document.getElementById("autofillButton").addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "applyMappings", currentProfileIndex: selectedProfileIndex });
      });
  });
});

// Reference: W3Schools
// Topic: Creating and appending HTML elements using JavaScript
// URL: https://www.w3schools.com/js/js_htmldom_nodes.asp
// Function to add a custom field to the popup
function addCustomField(key = '', value = '') {
  const container = document.getElementById('custom-fields-container');
  const div = document.createElement('div');
  div.className = 'custom-field';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Field Name';
  keyInput.value = key;

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Field Value';
  valueInput.value = value;

  const removeButton = document.createElement('button');
  removeButton.textContent = 'X';
  removeButton.className = 'remove-button';
  removeButton.addEventListener('click', () => {
    container.removeChild(div);
    customFields = customFields.filter(f => f !== div);
  });

  div.appendChild(keyInput);
  div.appendChild(valueInput);
  div.appendChild(removeButton);

  container.appendChild(div);
  customFields.push(div);
}

// OpenAI. (2024, November 20). ChatGPT (v4). Prompt: "How to use chrome.storage.local.get to retrieve data in JavaScript?"
// Function to load profiles from storage
function loadProfiles() {
  chrome.storage.local.get(['profiles'], (result) => {
    profiles = result.profiles || [];

    // If no profiles exist, create a default one
    if (profiles.length === 0) {
      profiles.push({
        profileName: 'Default Profile',
        data: {}
      });
    }

    // Ensure the selectedProfileIndex is within bounds
    if (selectedProfileIndex >= profiles.length) {
      selectedProfileIndex = 0;
    }

    populateProfileDropdown();
    loadSelectedProfileData();
  });
}

// Function to populate the profile dropdown
function populateProfileDropdown() {
  const profileSelect = document.getElementById('profile-select');
  profileSelect.innerHTML = '';
  profiles.forEach((profile, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.text = profile.profileName;
    profileSelect.add(option);
  });
  profileSelect.selectedIndex = selectedProfileIndex;
}

// Function to load data of the selected profile into form fields
function loadSelectedProfileData() {
  if (profiles[selectedProfileIndex]) {
    const data = profiles[selectedProfileIndex].data;
    document.getElementById('name').value = data.name || '';
    document.getElementById('experiences').value = formatExperiences(data.experiences) || '';
    document.getElementById('education').value = formatEducation(data.education) || '';
    document.getElementById('skills').value = formatSkills(data.skills) || '';
    document.getElementById('certificates').value = formatCertificates(data.certificates) || '';
    document.getElementById('languages').value = formatLanguages(data.languages) || '';
    document.getElementById('portfolio').value = data.portfolio || '';
    document.getElementById('summary').value = data.summary || '';
    document.getElementById('cover-letter').value = data.coverLetter || '';

    // Clear existing custom fields
    document.getElementById('custom-fields-container').innerHTML = '';
    customFields = [];

    // Reload custom fields
    if (data.customFields) {
      data.customFields.forEach(field => {
        addCustomField(field.key, field.value);
      });
    }
  }
}

// Helper functions to format data for display
function formatExperiences(experiences) {
  if (!Array.isArray(experiences)) return '';
  return experiences.map(exp => `${exp.jobTitle || ''} at ${exp.company || ''}`).join('\n');
}

function formatEducation(education) {
  if (!Array.isArray(education)) return '';
  return education.map((edu, index) => {
    const university = edu.university || 'Unknown University';
    const degreeMajor = edu.degreeMajor || 'Degree/Major not specified';
    const duration = edu.duration ? `Duration: ${edu.duration}` : 'Duration not specified';
    const grade = edu.grade ? `Grade: ${edu.grade}` : 'Grade not specified';
    const activities = edu.activities ? `Activities: ${edu.activities}` : 'Activities not specified';

    const formatted = `${university}\n${degreeMajor}\n${duration}\n${grade}\n${activities}`;
    return formatted;
  }).join('\n\n'); // Add a blank line between entries
}

function formatSkills(skills) {
  if (!Array.isArray(skills)) return '';
  return skills.join(', ');
}

function formatCertificates(certificates) {
  if (!Array.isArray(certificates)) return '';
  return certificates.map(cert => {
    let certStr = cert.certificateName || '';
    if (cert.issuingOrganization) {
      certStr += ` from ${cert.issuingOrganization}`;
    }
    if (cert.dateText) {
      certStr += ` (${cert.dateText})`;
    }
    return certStr;
  }).join('\n');
}

function formatLanguages(languages) {
  if (!Array.isArray(languages)) return '';
  return languages.map(lang => {
    let langStr = lang.languageName || '';
    if (lang.proficiency) {
      langStr += ` - ${lang.proficiency}`;
    }
    return langStr;
  }).join('\n');
}

// Function to create a new profile
function createNewProfile() {
  // Get modal-related elements
  const newProfileModal = document.getElementById('new-profile-modal');
  const saveNewProfileButton = document.getElementById('save-new-profile');
  const cancelNewProfileButton = document.getElementById('cancel-new-profile');
  const newProfileNameInput = document.getElementById('new-profile-name');

  // Show modal when "New Profile" button is clicked
  newProfileModal.style.display = 'flex';

  // Event listener for saving the new profile
  const saveProfile = () => {
    const profileName = newProfileNameInput.value.trim();
    if (profileName) {
      profiles.push({
        profileName: profileName,
        data: {}
      });
      selectedProfileIndex = profiles.length - 1;
      chrome.storage.local.set({ profiles: profiles }, () => {
        populateProfileDropdown();
        loadSelectedProfileData();
        showMessage('Profile created successfully!');
      });
    }
    // Clear the input and hide the modal
    newProfileNameInput.value = '';
    newProfileModal.style.display = 'none';

    // Clean up event listeners to avoid duplicate listeners
    saveNewProfileButton.removeEventListener('click', saveProfile);
    cancelNewProfileButton.removeEventListener('click', cancelProfileCreation);
  };

  // Event listener for canceling the new profile creation
  const cancelProfileCreation = () => {
    newProfileModal.style.display = 'none';
    newProfileNameInput.value = ''; // Clear the input

    // Clean up event listeners to avoid duplicate listeners
    saveNewProfileButton.removeEventListener('click', saveProfile);
    cancelNewProfileButton.removeEventListener('click', cancelProfileCreation);
  };

  // Attach the listeners
  saveNewProfileButton.addEventListener('click', saveProfile);
  cancelNewProfileButton.addEventListener('click', cancelProfileCreation);
}

// Function to delete the selected profile
function deleteProfile() {
  if (profiles.length <= 1) {
    alert('At least one profile must exist.');
    return;
  }
  if (confirm('Are you sure you want to delete this profile?')) {
    profiles.splice(selectedProfileIndex, 1);
    selectedProfileIndex = 0;
    chrome.storage.local.set({ profiles: profiles }, () => {
      populateProfileDropdown();
      loadSelectedProfileData();
    });
  }
}

// Function to save the current profile data
function saveProfileData() {
  const name = document.getElementById('name').value.trim();
  const experiencesInput = document.getElementById('experiences').value.trim();
  const educationInput = document.getElementById('education').value.trim();
  const skillsInput = document.getElementById('skills').value.trim();
  const certificatesInput = document.getElementById('certificates').value.trim();
  const languagesInput = document.getElementById('languages').value.trim();
  const portfolio = document.getElementById('portfolio').value.trim();
  const summary = document.getElementById('summary').value.trim();
  const coverLetter = document.getElementById('cover-letter').value.trim();

  // Process experiences and education into structured arrays
  const experiencesArray = parseTextToArray(experiencesInput, ' at ');
  const educationArray = parseTextToArray(educationInput, ' - ');

  // Process skills into an array
  const skillsArray = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);

  // Process certificates into an array
  const certificatesArray = certificatesInput.split('\n').map(line => {
    const [namePart, rest] = line.split(' from ');
    let certificateName = namePart ? namePart.trim() : '';
    let issuingOrganization = '';
    let dateText = '';

    if (rest) {
      const dateStart = rest.indexOf('(');
      if (dateStart !== -1) {
        issuingOrganization = rest.substring(0, dateStart).trim();
        dateText = rest.substring(dateStart + 1, rest.length - 1).trim();
      } else {
        issuingOrganization = rest.trim();
      }
    }

    return { certificateName, issuingOrganization, dateText };
  }).filter(cert => cert.certificateName);

  // Process languages into an array
  const languagesArray = languagesInput.split('\n').map(line => {
    const [languageName, proficiency] = line.split(' - ');
    return { languageName: languageName.trim(), proficiency: proficiency ? proficiency.trim() : '' };
  }).filter(lang => lang.languageName);

  const data = {
    name: name || '',
    experiences: experiencesArray,
    education: educationArray,
    skills: skillsArray,
    certificates: certificatesArray,
    languages: languagesArray,
    portfolio: portfolio || '',
    summary: summary || '',
    coverLetter: coverLetter || '',
    customFields: customFields.map(div => {
      const inputs = div.getElementsByTagName('input');
      return {
        key: inputs[0].value.trim(),
        value: inputs[1].value.trim()
      };
    })
  };

  profiles[selectedProfileIndex].data = data;

  // Save profiles array to chrome.storage.local
  chrome.storage.local.set({ profiles: profiles }, () => {
    // Display a success message
    showMessage('Profile saved successfully.');
  });
}

// Helper function to parse text input into an array of objects
function parseTextToArray(input, delimiter) {
  if (!input) return [];
  return input.split('\n').map(line => {
    const [part1, part2] = line.split(delimiter);
    if (delimiter === ' at ') {
      return { jobTitle: part1 ? part1.trim() : '', company: part2 ? part2.trim() : '' };
    } else if (delimiter === ' - ') {
      return { university: part1 ? part1.trim() : '', degreeMajor: part2 ? part2.trim() : '' };
    }
    return {};
  }).filter(item => Object.values(item).some(value => value));
}

// OpenAI. (2024, November 22). ChatGPT (v4). Prompt: "How to display a temporary success message using JavaScript?"
// Function to display a temporary message
function showMessage(message) {
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 2000);
}

function generateCoverLetter() {
  const data = profiles[selectedProfileIndex].data;

  // Get company name and job title from input fields
  const companyName = document.getElementById('company-name').value.trim();
  const jobTitle = document.getElementById('job-title').value.trim();

  if (!companyName || !jobTitle) {
    alert('Please enter both Company Name and Job Title, or click "Extract from Page".');
    return;
  }

  // Proceed to create the cover letter
  createCoverLetter(data, companyName, jobTitle)
    .then((coverLetter) => {
      document.getElementById('cover-letter').value = coverLetter;
      data.coverLetter = coverLetter;
      profiles[selectedProfileIndex].data = data;
      chrome.storage.local.set({ profiles: profiles });
      showMessage('Cover letter generated successfully.');
    })
    .catch((error) => {
      console.error('Error generating cover letter:', error);
      alert('Error generating cover letter: ' + error.message);
    });
}

// Function to extract job details from the application page
function extractJobDetails() {
  let jobTitle = '';
  let companyName = '';

  // Attempt to detect job title and company name
  const jobTitleElement = document.querySelector('h1.job-title, h1.title, .job-title, .title, h1');
  const companyNameElement = document.querySelector('.company-name, .company, .employer');

  if (jobTitleElement) {
    jobTitle = jobTitleElement.innerText.trim();
  }

  if (companyNameElement) {
    companyName = companyNameElement.innerText.trim();
  }

  return { jobTitle, companyName };
}

// Function to autofill the form on the current tab
// Function to autofill the form on the current tab
function autoFill() {
  saveProfileData();
  const data = profiles[selectedProfileIndex].data;

  if (data) {
    // Retrieve field mappings from storage
    chrome.storage.local.get(["fieldMappings"], (result) => {
      const fieldMappings = result.fieldMappings || [];

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;

        // Inject contentScript.js into the active tab
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["contentScript.js"],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              alert(
                "Error injecting content script: " +
                  chrome.runtime.lastError.message
              );
            } else {
              // Send profile data and field mappings to the content script
              chrome.tabs.sendMessage(
                tabId,
                {
                  action: "autoFill",
                  data,
                  fieldMappings,
                },
                function (response) {
                  if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    alert(
                      "Error: " + chrome.runtime.lastError.message
                    );
                  } else if (response && response.status) {
                    console.log(response.status);
                    showMessage(response.status);
                  } else {
                    console.error("Unexpected response:", response);
                    alert("Unexpected response from content script.");
                  }
                }
              );
            }
          }
        );
      });
    });
  } else {
    alert("No data available for the selected profile.");
  }
}

// Function to export profile data to a JSON file
function exportData() {
  chrome.storage.local.get(['profiles'], (result) => {
    const profilesData = result.profiles || [];

    const jsonData = JSON.stringify(profilesData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'profiles.json';
    a.click();

    URL.revokeObjectURL(url);
  });
}

// Function to import profile data from a JSON file
function importData(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedData = JSON.parse(e.target.result);

        if (Array.isArray(importedData)) {
          if (confirm('Do you want to replace your existing profiles with the imported data? Click "Cancel" to merge them.')) {
            chrome.storage.local.set({ profiles: importedData }, () => {
              alert('Profiles replaced successfully.');
              loadProfiles();
            });
          } else {
            chrome.storage.local.get(['profiles'], (result) => {
              const existingProfiles = result.profiles || [];
              const mergedProfiles = existingProfiles.concat(importedData);
              chrome.storage.local.set({ profiles: mergedProfiles }, () => {
                alert('Profiles merged successfully.');
                loadProfiles();
              });
            });
          }
        } else {
          alert('Invalid data format. Please select a valid profiles JSON file.');
        }
      } catch (error) {
        console.error(error);
        alert('Error parsing the file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  }
}

// Function to extract data from the current page
function extractData() {
  const confirmExtract = confirm('Ensure you are on the LinkedIn profile page you want to extract data from. Proceed?');
  if (!confirmExtract) return;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;
    const tabUrl = tabs[0].url;

    console.log('Extracting data from tab:', tabUrl);

    // Inject contentScript.js into the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ['contentScript.js']
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Error injecting content script:', chrome.runtime.lastError);
          alert('Error injecting content script: ' + chrome.runtime.lastError.message);
          return;
        }

        // After injecting, send the message to extract data
        chrome.tabs.sendMessage(tabId, { action: 'extractData' }, function (response) {
          if (!response) {
            console.error('No response from content script');
            alert('No response from content script');
            return;
          }
          if (response.success) {
            const data = response.data;
            console.log('Extracted Data:', data);
            populateDataFields(data);
            showMessage('Data extracted successfully.');
          } else {
            console.error('Error extracting data:', response.error);
            alert('Error extracting data: ' + response.error);
          }
        });
      }
    );
  });
}

// Function to populate data fields with extracted data
function populateDataFields(data) {
  document.getElementById('name').value = data.name || '';

  // Format experiences array into a string
  let experiencesText = '';
  if (data.experiences && data.experiences.length > 0) {
    experiencesText = data.experiences.map(exp => {
      let expStr = '';
      if (exp.jobTitle) {
        expStr += exp.jobTitle;
      }
      if (exp.company) {
        expStr += ` at ${exp.company}`;
      }
      return expStr;
    }).join('\n');
  }
  document.getElementById('experiences').value = experiencesText;

  document.getElementById('summary').value = data.summary || '';

  // Format education array into a string with all details
  let educationText = '';
  if (data.education && data.education.length > 0) {
    educationText = data.education.map(edu => {
      let eduStr = '';
      if (edu.university) {
        eduStr += `${edu.university}`;
      }
      if (edu.degreeMajor) {
        eduStr += ` - ${edu.degreeMajor}`;
      }
      return eduStr.trim();
    }).join('\n');
  }
  document.getElementById('education').value = educationText;

  // Format skills array into a string
  let skillsText = '';
  if (data.skills && data.skills.length > 0) {
    skillsText = data.skills.join(', ');
  }
  document.getElementById('skills').value = skillsText;

  // Format certificates into a string
  let certificatesText = '';
  if (data.certificates && data.certificates.length > 0) {
    certificatesText = data.certificates.map(cert => {
      let certStr = cert.certificateName || '';
      if (cert.issuingOrganization) {
        certStr += ` from ${cert.issuingOrganization}`;
      }
      if (cert.dateText) {
        certStr += ` (${cert.dateText})`;
      }
      return certStr;
    }).join('\n');
  }
  document.getElementById('certificates').value = certificatesText;

  // Format languages into a string
  let languagesText = '';
  if (data.languages && data.languages.length > 0) {
    languagesText = data.languages.map(lang => {
      let langStr = lang.languageName || '';
      if (lang.proficiency) {
        langStr += ` - ${lang.proficiency}`;
      }
      return langStr;
    }).join('\n');
  }
  document.getElementById('languages').value = languagesText;

  // Clear existing custom fields
  document.getElementById('custom-fields-container').innerHTML = '';
  customFields = [];

  if (data.customFields) {
    data.customFields.forEach(field => {
      addCustomField(field.key, field.value);
    });
  }
}

function sendEmail() {
  chrome.storage.local.get(['profiles'], (result) => {
    const profilesData = result.profiles || [];
    const jsonData = JSON.stringify(profilesData, null, 2);

    // Create a Blob and file URL for the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
    const fileUrl = URL.createObjectURL(blob);

    // Automatically download the JSON file
    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = 'profiles.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Prefill an email with instructions to attach the downloaded file
    const subject = encodeURIComponent('Exported Profile Data');
    const body = encodeURIComponent(
      `Attached is the exported profile data from the Supreme Auto Filler extension.\n\nPlease attach the downloaded file "profiles.json" to this email before sending.`
    );

    // Open the user's email client
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    // Revoke the Blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  });
}

function addMappingToUI(linkedinField, formFieldName) {
  const container = document.getElementById("mapping-container");

  const div = document.createElement("div");
  div.classList.add("mapping-item");

  const mappingText = document.createElement("span");
  mappingText.textContent = `${linkedinField} → ${formFieldName}`;
  div.appendChild(mappingText);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "❌";
  deleteButton.classList.add("delete-btn");
  deleteButton.addEventListener("click", () => {
      container.removeChild(div);
      saveMappingsToStorage();
  });
  div.appendChild(deleteButton);

  container.appendChild(div);

  saveMappingsToStorage();
}

function saveMappingsToStorage() {
  const mappings = Array.from(document.querySelectorAll(".mapping-item span")).map((span) => {
      const [linkedinField, formFieldName] = span.textContent.split(" → ");
      return { linkedinField, formFieldName };
  });
  chrome.storage.local.set({ fieldMappings: mappings });
}

function loadMappings() {
  chrome.storage.local.get(["fieldMappings"], (result) => {
      const mappingFields = result.fieldMappings || [];
      mappingFields.forEach(({ linkedinField, formFieldName }) => {
          addMappingToUI(linkedinField, formFieldName);
      });
  });
}

// Add mapping button logic
document.getElementById("add-mapping").addEventListener("click", () => {
  const linkedinField = document.getElementById("linkedin-field").value.trim();
  const formFieldName = document.getElementById("form-field").value.trim();
  if (linkedinField && formFieldName) {
      addMappingToUI(linkedinField, formFieldName);
      saveMappingsToStorage();
  }
});

document.getElementById("auto-fill").addEventListener("click", () => {
  chrome.storage.local.get(["profiles", "fieldMappings"], (result) => {
      const profiles = result.profiles || [];
      const currentProfile = profiles[selectedProfileIndex] || {};
      const fieldMappings = result.fieldMappings || [];

      // Send autofill message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {
              action: "applyMappings",
              fieldMappings,
              profileData: currentProfile.data,
          });
      });
  });
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('save-form-data').addEventListener('click', saveCurrentFormData);
  document.getElementById('load-form-data').addEventListener('click', loadFormDataForCurrentPage);
});

/**
 * Save form data from the active page
 */
function saveCurrentFormData() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        func: extractFormData,
      },
      (results) => {
        if (chrome.runtime.lastError) {
          alert('Error extracting form data: ' + chrome.runtime.lastError.message);
          return;
        }

        const formData = results[0]?.result;
        if (!formData || Object.keys(formData).length === 0) {
          alert('No form data found on this page.');
          return;
        }

        // Save the form data with the page URL
        chrome.storage.local.get(['formHistory'], (result) => {
          const history = result.formHistory || [];
          history.push({
            url: activeTab.url,
            formData,
            timestamp: new Date().toISOString()
          });
          chrome.storage.local.set({ formHistory: history }, () => {
            alert('Form data saved successfully.');
          });
        });
      }
    );
  });
}

/**
 * Extracts form data from the active page
 */
function extractFormData() {
  const formData = {};
  const inputs = document.querySelectorAll('input, textarea, select');

  inputs.forEach((input) => {
    const name = input.name || input.id || input.placeholder || `field_${Math.random().toString(36).substr(2, 5)}`;
    formData[name] = input.value;
  });

  return formData;
}

/**
 * Load saved form data for the current page and autofill the form
 */
function loadFormDataForCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    chrome.storage.local.get(['formHistory'], (result) => {
      const history = result.formHistory || [];
      const savedForm = history.find((entry) => entry.url === activeTab.url);

      if (!savedForm) {
        alert('No saved form data found for this page.');
        return;
      }

      // Autofill the form with the saved data
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          func: autofillForm,
          args: [savedForm.formData],
        },
        () => {
          if (chrome.runtime.lastError) {
            alert('Error autofilling form: ' + chrome.runtime.lastError.message);
          } else {
            alert('Form data loaded successfully.');
          }
        }
      );
    });
  });
}

/**
 * Autofill a form with provided data
 */
// Reference: Stack Overflow
// Topic: Triggering input change events in JavaScript
// URL: https://stackoverflow.com/questions/2856513/how-can-i-trigger-an-onsomething-change-event
function autofillForm(data) {
  const inputs = document.querySelectorAll('input, textarea, select');

  inputs.forEach((input) => {
    const name = input.name || input.id || input.placeholder;
    if (name && data[name] !== undefined) {
      input.value = data[name];
      input.dispatchEvent(new Event('input', { bubbles: true })); // Trigger change event
    }
  });
}
