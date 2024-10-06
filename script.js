// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import Firebase from the installed package
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 

// Function to save user data
async function saveUserData(data) {
    try {
        const docRef = await addDoc(collection(db, "resumes"), data);
        console.log("Document written with ID: ", docRef.id);
        // Call the function to generate resume templates after saving
        await generateResumeTemplates(data);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Function to generate resume templates using OpenAI API
async function generateResumeTemplates(data) {
    const apiKey = process.env.OPENAI_API_KEY; // Your OpenAI API key from the .env file
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Create a resume for a ${data.jobTitle} with the following details: Name: ${data.fullName}, Contact: ${data.contactNumber}, Email: ${data.email}, Address: ${data.address}, Education: ${data.education}, Experience: ${data.experience}, Skills: ${data.skills}, Certifications: ${data.certifications}, Language Skills: ${data.languageSkills}.`
                }]
            })
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Generated Resume Templates:', result);

        // Display the generated resume (assuming the response contains the relevant text)
        displayResume(result.choices[0].message.content); // Adjust based on API response structure

    } catch (error) {
        console.error('Failed to generate resume templates:', error);
    }
}

function displayResume(resumeContent) {
    // For demonstration, log to console
    console.log('Resume Content:', resumeContent);

    // Display in your HTML (You can adjust this part as needed)
    document.getElementById('resume-output').innerText = resumeContent; // Ensure you have a proper element in HTML
}

// Event listener for form submission
document.getElementById('resume-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Collect input values
    const data = {
        jobTitle: document.getElementById('job-title').value,
        fullName: document.getElementById('full-name').value,
        contactNumber: document.getElementById('contact-number').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        education: document.getElementById('education').value,
        experience: document.getElementById('experience').value,
        skills: document.getElementById('skills').value,
        certifications: document.getElementById('certifications').value,
        languageSkills: document.getElementById('language-skills').value
    };

    // Basic validation
    if (!data.jobTitle || !data.fullName || !data.contactNumber || !data.email || !data.address || !data.education || !data.experience || !data.skills || !data.languageSkills) {
        alert('Please fill out all required fields!');
        return;
    }

    // Save data to Firestore
    await saveUserData(data);

    // Display success message
    alert('Your data has been saved! Resume templates will be generated soon.');
});
