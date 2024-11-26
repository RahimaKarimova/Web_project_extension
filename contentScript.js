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

      // Extract experiences from the "experience" section
      // Extract experiences from the sibling structure of the "experience" section
      let experiences = [];
      const experienceContainer = document.querySelector('#experience');

      // Ensure the correct sibling structure
      if (experienceContainer) {
        // Navigate to the third sibling div containing the experience data
        const siblingDiv = experienceContainer.nextElementSibling?.nextElementSibling;

        if (siblingDiv) {
          // Look for the experience items within this div
          const experienceItems = siblingDiv.querySelectorAll('li.artdeco-list__item');

          experienceItems.forEach((item) => {
            const jobTitleElement = item.querySelector('span[aria-hidden="true"]');
            const jobTitle = jobTitleElement ? jobTitleElement.textContent.trim() : null;

            const companyElement = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
            const company = companyElement ? companyElement.textContent.trim() : null;

            if (jobTitle || company) {
              experiences.push({ jobTitle, company });
            }
          });

          console.log('Extracted Experiences:', experiences);
        } else {
          console.log('Sibling div containing experience data not found.');
        }
      } else {
        console.log('Experience container with ID "experience" not found.');
      }



      let summary = '';
      try {
        // Select the element with id="about"
        const aboutSection = document.querySelector('#about');
      
        if (aboutSection) {
          // Navigate to the second sibling under the about section
          const secondSibling = aboutSection.nextElementSibling?.nextElementSibling;
      
          if (secondSibling) {
            // Find the about text within the specific div
            const aboutSpan = secondSibling.querySelector(
              'div.inline-show-more-text--is-collapsed span[aria-hidden="true"]'
            );
      
            if (aboutSpan) {
              summary = aboutSpan.textContent.trim();
              console.log('Extracted About Text:', summary);
            } else {
              console.error('About text span not found.');
            }
          } else {
            console.error('Second sibling under #about not found.');
          }
        } else {
          console.error('Element with id="about" not found.');
        }
      } catch (error) {
        console.error('Error extracting about text:', error);
      }
      

      let education = [];
      const educationContainer = document.querySelector('#education');

      if (educationContainer) {
        // Navigate to the third sibling div
        const siblingDiv = educationContainer.nextElementSibling?.nextElementSibling;
        if (siblingDiv) {
          // Find all education items within this sibling div
          const educationItems = siblingDiv.querySelectorAll('li.artdeco-list__item');

          educationItems.forEach((item) => {
            // Extract university
            const universityElement = item.querySelector(
              'div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]'
            );
            const university = universityElement ? universityElement.textContent.trim() : null;

            // Extract degree and major
            const degreeMajorElement = item.querySelector(
              'span.t-14.t-normal span[aria-hidden="true"]'
            );
            const degreeMajor = degreeMajorElement ? degreeMajorElement.textContent.trim() : null;

            // Extract duration
            const durationElement = item.querySelector(
              'span.t-14.t-normal.t-black--light span[aria-hidden="true"]'
            );
            const duration = durationElement ? durationElement.textContent.trim() : null;

            // Extract grade (if available)
            const gradeElement = item.querySelector(
              'div.inline-show-more-text span[aria-hidden="true"]'
            );
            const grade = gradeElement && gradeElement.textContent.includes('Grade')
              ? gradeElement.textContent.trim()
              : null;

            // Extract activities and societies (if available)
            const activitiesElement = item.querySelector(
              'div.inline-show-more-text span[aria-hidden="true"]'
            );
            const activities = activitiesElement && activitiesElement.textContent.includes('Activities')
              ? activitiesElement.textContent.trim()
              : null;

            // Add education data to the array
            if (university || degreeMajor || duration || grade || activities) {
              education.push({
                university,
                degreeMajor,
                duration,
                grade,
                activities,
              });
            }
          });

          console.log('Extracted All Education Details:', education);
        } else {
          console.log('Sibling div containing education data not found.');
        }
      } else {
        console.log('Education container with ID "education" not found.');
      }
      let skills = [];
      try {
        // Select the field with id="skills"
        const skillsSection = document.querySelector('#skills');
      
        if (skillsSection) {
          // Navigate to the second sibling under the skills section
          const secondSibling = skillsSection.nextElementSibling?.nextElementSibling;
      
          if (secondSibling) {
            // Find all skill name spans inside the second sibling
            const skillNameSpans = secondSibling.querySelectorAll(
              'div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]'
            );
      
            skillNameSpans.forEach(skillSpan => {
              const skillName = skillSpan.textContent.trim();
              if (skillName) {
                skills.push(skillName);
              }
            });
            console.log('Extracted Skills:', skills);
          } else {
            console.error('Second sibling under #skills not found.');
          }
        } else {
          console.error('Element with id="skills" not found.');
        }
      } catch (error) {
        console.error('Error extracting skills:', error);
      }
      
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