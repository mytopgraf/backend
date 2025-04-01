const { Client, Databases } = require("appwrite");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Appwrite
const client = new Client();

client
    .setProject(process.env.PROJECT_ID) // Replace with your project ID
    // .setKey("YOUR_API_KEY"); // Replace with your API key (Make sure it's a Server key)

const databases = new Databases(client);
