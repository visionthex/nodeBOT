// Load environment variables from .env file
require('dotenv').config();

// Access your API key as an environment variable
const apiKey = process.env.API_KEY;

// Import the GoogleGenerativeAI module
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Create an instance of GoogleGenerativeAI with your API key
const genAI = new GoogleGenerativeAI(apiKey);

// Import readline module
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Start of the Array to store conversation
let conversation = [];

// The main run function of the program
async function run(userMessage) {

  // Access the generative model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  // Use the user's message as the prompt
  const result = await model.generateContentStream(userMessage);

  // This helps with streaming the results faster for a faster interaction with the chatbot.
  let text = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
    text += chunkText;
  }

  // Save the converstion in the array
  conversation.push({
    question: userMessage,
    answer: text
  });

  return text;
}

// The chatWithBot function that allows the user to chat with the bot
function chatWithBot() {
  rl.question('\x1b[36m\nPlease enter your question (or enter 0 to go back): \x1b[0m', (question) => {
    if (question === '0') {
      askQuestion(); // Go back
    } else {
      // Call run function with user input
      run(question).then(text => {
        console.log(text);
        chatWithBot(); // Ask another question
      }).catch(err => {
        console.error(err);
        rl.close();
      });
    }
  });
}

// The aboutMe function that displays information about the author
function aboutMe() {
  console.log('\x1b[35m\nAbout Me\x1b[0m');
  console.log('-------------------');
  console.log('Name: \x1b[36mCharles Sanders\x1b[0m');
  console.log('Role: \x1b[36mSoftware Developer\x1b[0m');
  console.log('Email: \x1b[36msandseclos@gmail.com\x1b[0m');
  console.log('GitHub: \x1b[36mhttps://github.com/visionthex\x1b[0m');
  console.log('-------------------');
  rl.question('\x1b[36m\nPress 0 to go back: \x1b[0m', (answer) => {
    if (answer === '0') {
      askQuestion(); // Go back
    } else {
      aboutMe(); // Invalid input, ask again
    }
  });
}

// README.md file reader
// Import fs and path modules
const fs = require('fs');
const path = require('path');

function readme() {
  // Adjust the path according to your file structure
  const readmePath = path.join(__dirname, './README.md');

  // If the README.md file is not found, display an error message
  fs.readFile(readmePath, 'utf8', (err, data) => {
    if (err) {
      console.error('An error occurred while reading the file:', err);
      return;
    }
    // Display the content of the README.md file
    console.log('This is the content of the README.md file:\n', data);

    rl.question('\x1b[35m\nPress 0 to go back: \x1b[0m', (answer) => {
      if (answer === '0') {
        askQuestion(); // Go back
      } else {
        readme(); // Invalid input, ask again
      }
    });
  });
}

// Function to display prior conversations
function displayConversations() {
  if (conversation.length === 0) {
    console.log('No prior conversations to display.');
  } else {
    conversation.forEach((conversation, index) => {
      console.log(`\nConversation ${index + 1}:`);
      console.log(`Question: ${conversation.question}`);
      console.log(`Answer: ${conversation.answer}`);
    });
  }

  rl.question('\x1b[35m\nPress 0 to go back: \x1b[0m', (answer) => {
    if (answer === '0') {
      askQuestion(); // Go back
    } else {
      displayConversations(); // Invalid input, ask again
    }
  });
}


// The askQuestion function that displays the menu and asks the user for input
function askQuestion() {
  // Display menu
  console.log('\x1b[35m\n1. README.md');
  console.log('2. About me');
  console.log('3. Chat with Bot');
  console.log('4. Display prior conversations')
  console.log('5. Exit\x1b[0m')

  // Ask user for input
  rl.question('\x1b[34m\nPlease select an option: \x1b[0m', (answer) => {
    switch (answer) {
      case '1':
        readme();
        break;
      case '2':
        aboutMe();
        break;
      case '3':
        chatWithBot();
        break;
      case '4':
        displayConversations();
        break;
      case '5':
        console.log('Exiting...');
        rl.close();
        break;
      default:
        console.log('Invalid option. Please select a number from 1 to 3.');
        askQuestion(); // Ask another question
        break;
    }
  });
}

askQuestion(); // Start asking questions

// Listen for command event
process.on('command', function() {
  console.log('\nGracefully shutting down from command (Ctrl+C)');
  rl.close();
});