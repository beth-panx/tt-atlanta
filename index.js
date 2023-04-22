const { Configuration, OpenAIApi} = require('openai');
const readline = require('readline');
const { exec } = require('child_process');
const { config } = require('dotenv');
config();
const configuration  = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);

// Function to get user input
function getInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Function to generate git command using OpenAI
async function generateGitCommand(prompt) {
    const request = {
        max_tokens: 100,
        temperature: 0.2,
        model:"gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": `You are a helpful assistant. Output a git command only from the following conversation, no explanation or other text: ${prompt}`},
        ]
    }
    const response = await openai.createChatCompletion(request);

    return response.data.choices[0].message.content;
}

// Function to confirm git command with user
async function confirmCommand(gitCommand) {
  const answer = await getInput(`Generated git command: ${gitCommand}. Do you want to execute it? (y/n) `);
  if (answer.toLowerCase() === 'y') {
    return true;
  } else {
    return false;
  }
}

// Function to execute git command
function executeGitCommand(gitCommand) {
  exec(gitCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

// Main function
async function main() {
  let prompt = await getInput('Enter your git command: ');
  while (prompt) {
    const gitCommand = await generateGitCommand(prompt);
    const confirmed = await confirmCommand(gitCommand);
    if (confirmed) {
      executeGitCommand(gitCommand);
    }
    prompt = await getInput('Enter your git command: ');
  }
}

main();