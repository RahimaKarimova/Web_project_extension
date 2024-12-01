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
      let experiences = [];
      const experienceContainer = document.querySelector('#experience');

      if (experienceContainer) {
        // Navigate to the sibling div containing the experience data
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

      // Extract summary
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

      // Extract education
      let education = [];
      const educationContainer = document.querySelector('#education');

      if (educationContainer) {
        // Navigate to the sibling div
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

      // Extract skills
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
      let certificates = [];
      const certificatesContainer = document.querySelector('#licenses_and_certifications');

      if (certificatesContainer) {
        // Navigate to the sibling div containing the certificates data
        const siblingDiv = certificatesContainer.nextElementSibling?.nextElementSibling;

        if (siblingDiv) {
          // Look for the certificate items within this div
          const certificateItems = siblingDiv.querySelectorAll('li.artdeco-list__item');

          certificateItems.forEach((item) => {
            const certificateNameElement = item.querySelector('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]');
            const certificateName = certificateNameElement ? certificateNameElement.textContent.trim() : null;

            const issuingOrgElement = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
            const issuingOrganization = issuingOrgElement ? issuingOrgElement.textContent.trim() : null;

            // Extract issued and expiration dates if available
            const dateElement = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"]');
            const dateText = dateElement ? dateElement.textContent.trim() : null;

            if (certificateName || issuingOrganization) {
              certificates.push({ certificateName, issuingOrganization, dateText });
            }
          });

          console.log('Extracted Certificates:', certificates);
        } else {
          console.log('Sibling div containing certificates data not found.');
        }
      } else {
        console.log('Certificates container with ID "licenses_and_certifications" not found.');
      }

      // Extract languages
      let languages = [];
      const languagesContainer = document.querySelector('#languages');

      if (languagesContainer) {
        // Navigate to the sibling div containing the languages data
        const siblingDiv = languagesContainer.nextElementSibling?.nextElementSibling;

        if (siblingDiv) {
          // Look for the language items within this div
          const languageItems = siblingDiv.querySelectorAll('li.artdeco-list__item');

          languageItems.forEach((item) => {
            const languageNameElement = item.querySelector('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]');
            const languageName = languageNameElement ? languageNameElement.textContent.trim() : null;

            // Extract proficiency if available
            const proficiencyElement = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"]');
            const proficiency = proficiencyElement ? proficiencyElement.textContent.trim() : null;

            if (languageName) {
              languages.push({ languageName, proficiency });
            }
          });

          console.log('Extracted Languages:', languages);
        } else {
          console.log('Sibling div containing languages data not found.');
        }
      } else {
        console.log('Languages container with ID "languages" not found.');
      }

      // Prepare data object
      const data = {
        name,
        experiences,
        education,
        skills,
        summary,
        certificates, // Added certificates
        languages     // Added languages
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
    if (data.name && matchesField(['name', 'full name', 'your name', 'applicant name', 'candidate name', 'first name', 'last name', 'given name', 'surname', 'legal name'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.name;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill experiences
    else if (data.experiences && data.experiences.length > 0 && matchesField(['experience', 'work experience', 'employment history', 'professional experience', 'job history', 'previous employment', 'past jobs', 'career history', 'prior positions', 'work background'], nameAttr, idAttr, placeholderAttr, labelText)) {
      const experiencesText = data.experiences.map(exp => `${exp.jobTitle || ''} at ${exp.company || ''}`).join('\n');
      input.value = experiencesText;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill education
    else if (data.education && data.education.length > 0 && matchesField(['education', 'educational background', 'academic history', 'education history', 'degrees', 'qualifications', 'academic qualifications', 'scholastic record', 'educational attainment', 'educational qualifications'], nameAttr, idAttr, placeholderAttr, labelText)) {
      const educationText = data.education.map(edu => `${edu.university || ''} - ${edu.degreeMajor || ''}`).join('\n');
      input.value = educationText;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill skills
    else if (data.skills && data.skills.length > 0 && matchesField(['skills', 'your skills', 'skill set', 'competencies', 'abilities', 'expertise', 'proficiencies', 'technical skills', 'soft skills', 'core competencies'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.skills.join(', ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill certificates
    else if (data.certificates && data.certificates.length > 0 && matchesField(['certificates', 'certification', 'licenses', 'accreditations', 'diplomas', 'credentials', 'certifications and licenses', 'professional certifications', 'certification details', 'licensure'], nameAttr, idAttr, placeholderAttr, labelText)) {
      const certificatesText = data.certificates.map(cert => {
        let certStr = cert.certificateName || '';
        if (cert.issuingOrganization) {
          certStr += ` from ${cert.issuingOrganization}`;
        }
        if (cert.dateText) {
          certStr += ` (${cert.dateText})`;
        }
        return certStr;
      }).join('\n');
      input.value = certificatesText;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill languages
    else if (data.languages && data.languages.length > 0 && matchesField(['languages', 'language', 'spoken languages', 'language proficiency', 'linguistic abilities', 'language skills', 'languages spoken', 'bilingual abilities', 'multilingual skills', 'language competencies'], nameAttr, idAttr, placeholderAttr, labelText)) {
      const languagesText = data.languages.map(lang => {
        let langStr = lang.languageName;
        if (lang.proficiency) {
          langStr += ` - ${lang.proficiency}`;
        }
        return langStr;
      }).join('\n');
      input.value = languagesText;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill portfolio links
    else if (data.portfolio && matchesField(['portfolio', 'portfolio links', 'work samples', 'project links', 'online portfolio', 'portfolio URL', 'portfolio website', 'sample works', 'portfolio showcase', 'digital portfolio'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.portfolio;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill personal summary
    else if (data.summary && matchesField(['summary', 'personal summary', 'about me', 'professional summary', 'personal statement', 'bio', 'biography', 'self-description', 'candidate profile', 'introduction'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.summary;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Fill cover letter
    else if (data.coverLetter && matchesField(['cover letter', 'motivation letter', 'letter', 'application letter', 'covering letter', 'letter of intent', 'statement of purpose', 'motivational statement', 'introductory letter', 'letter of application'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.coverLetter;
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