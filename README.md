# Moonbug: Your Cosmic Companion

Moonbug is a unique productivity and mindfulness application designed to help you align your personal and professional life with the rhythms of the cosmos. It combines practical tools like event management with reflective features based on the lunar cycle, creating a holistic digital experience.

## What is Moonbug?

At its core, Moonbug is a dashboard for your life, viewed through a celestial lens. It's for those who find solace in the stars, who want to track time not just by the clock, but by the waxing and waning of the moon.

**Key Features:**
*   **Personal Dashboard:** A central hub to see upcoming events, jot down quick thoughts on a sticky note, and get a feel for the current cosmic conditions.
*   **Event Management:** Create personal events with titles, locations, and optional dates. Get timed, voice-narrated reminders for your most important appointments.
*   **Lunar Calendar:** A unique calendar that visualizes the year in lunar months, allowing you to see your events in the context of the moon's phases.
*   **Cosmic Blueprint:** Discover your "lunar age" by entering your birthdate and see how many new moons you've lived through.
*   **Community Hub:** Share interesting articles and links in the **Posts** section, or upload beautiful photos to the **Snaps** gallery.
*   **AI-Powered Discovery:** Find real-world events happening globally or near you, powered by Google's Generative AI.

## Technology Showcase

Moonbug is built with a modern, powerful, and scalable tech stack:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **UI:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/)
*   **Component Library:** [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible, and customizable components.
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (including Firestore for the database and Firebase Authentication).
*   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (Google's open-source AI framework) for features like event discovery and text-to-speech.

## How to Run the App

To run Moonbug on your local machine, you'll need Node.js and npm installed.

1.  **Install Dependencies:**
    Open your terminal in the project directory and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    Once the dependencies are installed, you can start the Next.js development server:
    ```bash
    npm run dev
    ```

3.  **Open in Browser:**
    Open [http://localhost:9002](http://localhost:9002) in your browser to see the application live.

> **Note:** This starter is pre-configured with a Firebase project. Your interactions with the database (creating events, posting links, etc.) will be live.
