# 🔍 AEO Diagnostic Engine

Answer Engine Optimization (AEO) is a web application which simulates how modern AI Search Engines process user queries and checks if your specific brand is being recommended. 

Built with a highly resilient architecture, this tool utilizes custom headless browser automation to securely extract live product imagery and integrates with a dynamic open source AI routing library to process real time analytics without relying on expensive premium APIs or rate limited gateways.

## Features
* **Custom Headless Scraping:** Utilizes a custom Selenium WebDriver algorithm to bypass anti bot walls and extract live visual data securely.
* **Keyless Dynamic Routing:** Integrates the `g4f` (GPT4Free) architecture to dynamically route requests through public AI providers. This enables 100% free access to models with zero API keys and zero rate limits.
* **Live Visual Extraction:** Dynamically scrapes real time product imagery from the web based on the user's specific brand and query.
* **Automated Diagnostics:** Analyzes the generated AI responses to determine if your brand is visible, dynamically calculates a win rate score, and identifies exactly which competitors are currently winning the AI recommendation space.
* **Modern UI/UX:** Built with React, Tailwind CSS, and Framer Motion for a fluid, responsive, and highly polished user experience.

## Installation

### Prerequisites
* Node.js installed
* Python 3.10+ installed
* Google Chrome installed (required for the Selenium WebDriver)

1. Clone or download this repository.

### Backend Setup
2. Navigate to the backend directory:
   `cd backend`
3. Create a virtual environment:
   `python -m venv venv`
4. Activate the environment:
   * Mac/Linux: `source venv/bin/activate`
   * Windows: `venv\Scripts\activate`
5. Install dependencies:
   `pip install -r requirements.txt`
6. (Optional) Create a `.env` file in the `backend` directory to manage standard environment variables.

### Frontend Setup
7. Open a new terminal window and navigate to the frontend directory:
   `cd frontend`
8. Install dependencies:
   `npm install`


## Usage

To run the application, you need to start both the backend server and the frontend client simultaneously in two separate terminal windows.

**1. Start the Backend API**
In your backend terminal (with the virtual environment activated), run:
`uvicorn main:app --reload`
*(The backend will run on http://localhost:8000)*

**2. Start the Frontend UI**
In your frontend terminal, run:
`npm run dev`
*(The frontend will run on http://localhost:5173)*

Open your browser to `http://localhost:5173`, enter a customer search query (e.g., "Best noise canceling headphones") and your target brand (e.g., "Sony"), and run your global AEO Audit!

**Live Website:** https://aeo-dun.vercel.app/