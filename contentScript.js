// contentScript.js

console.log('Content script loaded.');

// Listener for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Content script received a message:', request);

  if (request.action === 'extractData') {
    console.log('Starting data extraction...');
    try {
      // Extract the name
      const nameElement = document.querySelector('h1.inline.t-24.v-align-middle.break-words');
      const name = nameElement ? nameElement.innerText.trim() : null;
      console.log('Extracted Name:', name);

      // Extract job title and company information
      let experiences = [];
      const firstExperienceElement = document.querySelector('li.artdeco-list__item');

      if (firstExperienceElement) {
        // Extract job title
        const jobTitleElement = firstExperienceElement.querySelector('span[aria-hidden="true"]');
        const jobTitle = jobTitleElement ? jobTitleElement.textContent.trim() : null;

        // Extract company name
        const companyElement = firstExperienceElement.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
        const company = companyElement ? companyElement.textContent.trim() : null;

        // Push to experiences array
        if (jobTitle || company) {
          experiences.push({ jobTitle, company });
        }

        console.log('Extracted Experiences:', experiences);
      }

      let summary = null;
      const summaryElement = document.querySelector(
        'div.wdYgMLaqDWfxTYsgpsmnJXppqkATKWYnXBeM span[aria-hidden="true"]'
      );
      if (summaryElement) {
        summary = summaryElement.textContent.trim();
        console.log('Extracted Summary:', summary);
      }
      // Extract education details
      let education = [];
      const educationElement = document.querySelector('a.optional-action-target-wrapper.display-flex.flex-column.full-width');

      if (educationElement) {
        // Extract major
        const majorElement = educationElement.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
        const major = majorElement ? majorElement.textContent.trim() : null;
        console.log('Extracted Major:', major);

        // Extract university
        const universityElement = educationElement.querySelector('div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]');
        const university = universityElement ? universityElement.textContent.trim() : null;
        console.log('Extracted University:', university);

        if (university || major) {
          education.push({ university, major });
        }
      }

      // Extract skills
      const skillElements = document.querySelectorAll('div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold');
      let skills = [];
      skillElements.forEach((skillElement, index) => {
        const skillNameElement = skillElement.querySelector('span[aria-hidden="true"]');
        const skillName = skillNameElement ? skillNameElement.textContent.trim() : null;

        if (skillName) {
          skills.push(skillName);
          console.log(`Extracted Skill [${index}]:`, skillName);
        }
      });

      // Log all extracted skills
      console.log('Extracted Skills:', skills);

      // Prepare data object
      const data = {
        name,
        experiences, // Array of experiences
        education,   // Array of education entries
        skills,      // Array of skills
        summary,     // Add this line
      };
      console.log('Data Extraction Complete:', data);

      sendResponse({ success: true, data });
    } catch (error) {
      console.error('Error extracting data:', error);
      sendResponse({ success: false, error: error.message });
    }

    // Indicate that sendResponse will be called asynchronously
    return true;
  } else if (request.action === 'autoFill') {
    // Autofill the form with provided data
    try {
      const data = request.data;
      fillForm(data);
      sendResponse({ status: 'Form filled successfully.' });
    } catch (error) {
      console.error('Error filling form:', error);
      sendResponse({ status: 'Error filling form.', error: error.message });
    }

    // Indicate that sendResponse will be called asynchronously
    return true;
  }
});

// Define getLabelText function
function getLabelText(input) {
  let label = input.labels && input.labels[0];
  if (label) {
    return label.innerText || label.textContent;
  } else {
    // Try to find a label using for attribute
    const id = input.id;
    if (id) {
      label = document.querySelector(`label[for='${CSS.escape(id)}']`);
      return label ? label.innerText || label.textContent : '';
    }
  }
  return '';
}

// Define matchesField function
function matchesField(fieldNames, ...attributes) {
  return fieldNames.some(fieldName => {
    return attributes.some(attr => attr.includes(fieldName.toLowerCase()));
  });
}

// Function to fill the form fields based on the provided data
function fillForm(data) {
  const inputs = document.querySelectorAll('input:not([type=hidden]):not([disabled]), textarea, select');

  inputs.forEach(input => {
    const nameAttr = (input.name || '').toLowerCase();
    const idAttr = (input.id || '').toLowerCase();
    const placeholderAttr = (input.placeholder || '').toLowerCase();
    const labelText = (getLabelText(input) || '').toLowerCase();

    // Fill name
    if (data.name && matchesField(['name', 'full name', 'your name'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.name;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill experiences
    else if (data.experiences && data.experiences.length > 0 && matchesField(['experience', 'work experience'], nameAttr, idAttr, placeholderAttr, labelText)) {
      const experiencesText = data.experiences.map(exp => `${exp.jobTitle || ''} at ${exp.company || ''}`).join('\n');
      input.value = experiencesText;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill education
    else if (data.education && data.education.length > 0 && matchesField(['education', 'educational background'], nameAttr, idAttr, placeholderAttr, labelText)) {
      const educationText = data.education.map(edu => `${edu.university || ''} - ${edu.major || ''}`).join('\n');
      input.value = educationText;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill skills
    else if (data.skills && data.skills.length > 0 && matchesField(['skills', 'your skills'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.skills.join(', ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill certificates
    else if (data.certificates && matchesField(['certificates', 'certification'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.certificates;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill portfolio links
    else if (data.portfolio && matchesField(['portfolio', 'portfolio links'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.portfolio;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill personal summary
    else if (data.summary && matchesField(['summary', 'personal summary', 'about me'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.summary;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Fill custom fields
    else if (data.customFields && Array.isArray(data.customFields)) {
      data.customFields.forEach(field => {
        const key = field.key.toLowerCase();
        if (key && field.value && matchesField([key], nameAttr, idAttr, placeholderAttr, labelText)) {
          input.value = field.value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }
  });
}
