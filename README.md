# **Auto Filler with Job Tracker**

An intelligent and user-friendly browser extension designed to simplify your job application process. **Auto Filler with Job Tracker** automates form filling, generates professional cover letters, and helps you track your job applications efficiently—all in one place.

---

## **How It Works**

### **Profile Management**
- **Extract Profile**:
  - Automatically pull your personal details (e.g., name, email, phone, work experience) from platforms like LinkedIn.
- **Edit or Add Fields**:
  - Modify extracted data or add custom fields.
  - Use the **Save** button to store your updated profile.
- **Reload Profile**:
  - Revert to the last saved version with the **Reload** button.

> **Tip**: Whenever you open the extension, your last saved profile will load automatically.

### **Profile Switching**
- Create multiple profiles tailored to different industries or job roles.
- Use the **Profile Selector** dropdown in the popup to switch between profiles instantly.
- Save and manage separate profiles for customized application workflows.

---

## **Button and Interface Overview**

### **Popup Interface**
- **Extract Profile**: Extract data from supported platforms.
- **Auto-Fill**: Automatically populate web forms with saved profile data.
- **Add Custom Field**: Add personalized data fields to your profile.
- **Save**: Save your profile changes.
- **Reload**: Restore the last saved version of your profile.
- **Export Data**: Download your profile or application data as a file.
- **Import Data**: Upload external data to update your profile.
- **Generate Cover Letter**: Use AI to create a tailored cover letter based on your profile and job details.
- **Profile Selector**: Switch between multiple profiles easily.

### **Form Management**
- **Save Form**: Store partially completed forms for future use.
- **Restore Form**: Retrieve saved forms and complete them at your convenience.

### **Dashboard**
- **Add Entry**: Add a new job application to the tracker.
- **Edit**: Update existing job applications.
- **Delete**: Remove job applications from the list.
- **View History**: Open a modal to review your submission history.
- **Save Entry**: Save changes to a job application in the tracker.
- **Cancel**: Exit the modal without saving changes.

---

## **Detailed Functionalities**

### **Form Auto-Filling**
1. Navigate to a web form (e.g., job application).
2. Open the extension and click **Auto-Fill**.
3. The form is populated with data from your profile.

> **Pro Tip**: If the form isn’t ready for submission, save the filled form using **Save Current Form Data** and restore it later.

### **Form Field Mapping**
- Map LinkedIn fields to specific form fields to ensure data accuracy on forms with unique or non-standard field names.
- Customize mappings once, and the extension remembers them for future use.

### **Profile Switching**
- Create multiple profiles tailored to specific industries or roles.
- Use the **Profile Selector** dropdown in the popup to switch between profiles instantly.
- Save time by maintaining separate profiles for different job applications.

### **Cover Letter Generation**
1. Open the extension and click **Generate Cover Letter**.
2. Enter job-specific details (e.g., job title, company name).
3. The AI creates a professional and customized cover letter using your profile information.

### **Job Tracking Dashboard**
- Access the dashboard to manage your job search.
- **Add Entry**: Log a new job application (e.g., position, company, date applied).
- **View History**: See a chronological record of form submissions.
- **Edit and Delete**: Update or remove job application entries.

### **Data Export and Import**
- Export your data to share or create backups.
- Import data from external sources to enrich your profile or tracker.

---

## **User Scenarios**

### **Scenario 1: Automated Form Filling**
1. Extract your profile from LinkedIn.
2. Save and customize your profile.
3. Visit a job application form, open the extension, and click **Auto-Fill**.
4. Submit the form or save it for later.

### **Scenario 2: Professional Cover Letter**
1. Open the extension and click **Generate Cover Letter**.
2. Provide job-specific details.
3. Use the AI-generated letter to enhance your application.

### **Scenario 3: Job Application Tracking**
1. Open the dashboard and add new job applications.
2. View or edit existing applications as needed.
3. Track your application status in the history section.

### **Scenario 4: Profile Switching**
1. Create profiles for different industries (e.g., marketing, software development).
2. Use the **Profile Selector** to switch to the desired profile for specific applications.
3. Fill forms with the most relevant profile data.

### **Scenario 5: Form Field Mapping**
1. Map LinkedIn fields to specific form fields on a job application.
2. Save the mappings for future use.
3. Ensure seamless and accurate auto-filling across various forms.

---

## **Project Structure**
- **popup.html**: Interface for profile management and auto-filling.
- **dashboard.html**: Interface for job tracking and history management.
- **contentScript.js**: Handles interaction with web forms for auto-filling.
- **popup.js**: Implements profile extraction, editing, saving, and profile switching.
- **dashboard.js**: Manages job applications and history tracking.
- **formFieldMapping.js**: Implements field mapping functionality for custom forms.
- **manifest.json**: Extension metadata and permissions.
- **icons/**: Contains icons used by the extension.
- **styles/**: CSS styles for the interface.

---

## **FAQs**

### Q: How do I restore a saved form?
A: Use the **Restore Form** button to retrieve and complete previously saved forms.

### Q: Can I switch between profiles?
A: Yes, use the **Profile Selector** dropdown in the popup to switch between saved profiles.

### Q: How do I map LinkedIn fields to custom forms?
A: Open the **Field Mapping** tool, select LinkedIn fields, and map them to the target form fields.

### Q: Can I export my data?
A: Yes, use the **Export Data** button to download your profile or application data.

### Q: How do I generate a cover letter?
A: Click **Generate Cover Letter** in the popup, enter the job details, and let the AI handle the rest!

---

## **Contributing**
We welcome contributions! Feel free to fork the repository, submit issues, or make pull requests.
