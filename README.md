# ELSA V2 - A Compassionate AI Companion

ELSA is a voice-driven web application designed to be a comforting and empathetic companion. Built with React, it leverages the power of large language models via Groq and realistic, emotive text-to-speech from Microsoft Azure to create a natural and supportive conversational experience.

The user interface is crafted as a "Digital Sanctuary," featuring a calming, animated environment with a central "breathing" orb to promote a sense of peace and well-being during interaction.


## Core Features

- **Voice-First Interaction:** Speak naturally to ELSA and hear her respond in a human-like voice.
- **Empathetic AI Persona:** ELSA is powered by a large language model (Llama 3.3) with a system prompt designed to make her a supportive and understanding therapist.
- **"Digital Sanctuary" UI:** A soothing, animated gradient background and a "breathing" central orb that responds to the conversation state (idle, listening, speaking).
- **Realistic, Emotive Voice:** Utilizes Azure's neural text-to-speech with custom SSML to add natural pauses and an empathetic tone.
- **Interruptible Conversation:** You can interrupt ELSA at any time by tapping the orb to speak, creating a more natural conversational flow.
- **Glassmorphism Chat History:** Review your conversation in a clean, translucent panel that doesn't break the calming aesthetic.

## Tech Stack

- **Frontend:** React, Framer Motion (for animations), Tailwind CSS
- **AI Language Model:** Groq (running Llama 3.3 70B)
- **Text-to-Speech (TTS):** Microsoft Azure Cognitive Services
- **Speech-to-Text (STT):** Browser's native Web Speech API

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- Node.js and npm installed on your machine.
- API keys for Groq and Microsoft Azure.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Create an environment file:**
    Create a file named `.env` in the root of your project directory. Copy the contents of your existing `.env` file into it. It should look like this:

    ```env
    # .env
    REACT_APP_GROQ_API_KEY=your_groq_api_key_here
    REACT_APP_AZURE_SPEECH_KEY=your_azure_speech_key_here
    REACT_APP_AZURE_SPEECH_REGION=your_azure_speech_region_here
    ```

4.  **Run the application:**
    ```sh
    npm start
    ```
    This will open the app in your browser at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify).