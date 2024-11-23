chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const data = request;
    fillForm(data);
    sendResponse({status: 'Form filled successfully.'});
  });
  
  function fillForm(data) {
    // For each field in data, try to find the input/textarea fields on the page and fill them
    const inputs = document.querySelectorAll('input:not([type=hidden]):not([disabled]), textarea, select');
  
    inputs.forEach(input => {
      const nameAttr = (input.name || '').toLowerCase();
      const idAttr = (input.id || '').toLowerCase();
      const placeholderAttr = (input.placeholder || '').toLowerCase();
      const labelText = (getLabelText(input) || '').toLowerCase();
  
      if (data.name && matchesField(['name', 'full name', 'your name'], nameAttr, idAttr, placeholderAttr, labelText)) {
        input.value = data.name;
      } else if (data.experience && matchesField(['experience', 'work experience'], nameAttr, idAttr, placeholderAttr, labelText)) {
        input.value = data.experience;
      } else if (data.education && matchesField(['education', 'educational background'], nameAttr, idAttr, placeholderAttr, labelText)) {
        input.value = data.education;
      } else if (data.skills && matchesField(['skills', 'your skills'], nameAttr, idAttr, placeholderAttr, labelText)) {
        input.value = data.skills;
      } else if (data.certificates && matchesField(['certificates', 'certification'], nameAttr, idAttr, placeholderAttr, labelText)) {
        input.value = data.certificates;
      } else if (data.portfolio && matchesField(['portfolio', 'portfolio links'], nameAttr, idAttr, placeholderAttr, labelText)) {
        input.value = data.portfolio;
      } else if (data.summary && matchesField(['summary', 'personal summary', 'about me'], nameAttr, idAttr, placeholderAttr, labelText)) {
        input.value = data.summary;
      } else if (data.customFields && Array.isArray(data.customFields)) {
        data.customFields.forEach(field => {
          const key = field.key.toLowerCase();
          if (key && field.value && matchesField([key], nameAttr, idAttr, placeholderAttr, labelText)) {
            input.value = field.value;
          }
        });
      }
    });
  }
  
  function matchesField(keywords, ...attributes) {
    return keywords.some(keyword => attributes.some(attr => attr.includes(keyword)));
  }
  
  function getLabelText(element) {
    let label = '';
    if (element.labels && element.labels.length > 0) {
      label = element.labels[0].innerText;
    } else if (element.id) {
      const labelElement = document.querySelector(`label[for="${element.id}"]`);
      if (labelElement) {
        label = labelElement.innerText;
      }
    }
    return label;
  }
  