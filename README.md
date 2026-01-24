# Spotify Charts API
An Express and Puppeteer-based server that exposes Spotify Charts data as JSON by intercepting Spotify’s internal network requests.
This allows programmatic access to Global and USA daily/weekly charts without scraping HTML.

This project is not affiliated with or endorsed by Spotify.

# Features

Fetch Spotify Charts as raw JSON

Uses puppeteer-extra with stealth plugin

Shared browser instance for better performance

Persistent session using a user data directory

Simple REST-style endpoints

Suitable for Python, data analysis, and automation workflows

Available Endpoints
Endpoint	Description
/global_daily	Global Daily Charts
/global_weekly	Global Weekly Charts
/usa_daily	USA Daily Charts
/usa_weekly	USA Weekly Charts

Example:

```GET http://localhost:3000/global_daily```


Returns Spotify’s internal chart JSON response.

# How It Works

Launches a headless Chromium browser using Puppeteer

Opens the Spotify Charts page for the requested chart

Listens for internal API responses matching /auth/v0/charts/*/latest

Extracts and parses the JSON payload

Returns the data to the client while keeping the browser alive

No HTML scraping is involved.

# Tech Stack

- Node.js

- Express

- Puppeteer Extra

- puppeteer-extra-plugin-stealth

- dotenv

# Installation
```
git clone https://github.com/yourusername/spotify-charts-api.git
cd spotify-charts-api
npm install
```

# Usage

Start the server:

```node server.js```


The server will run on:

```http://localhost:3000```


A shared browser instance is initialized on startup, and session data is stored in the spotify_session directory.

# Example Client (Python)

```
import requests

url = "http://localhost:3000/global_weekly"
response = requests.get(url)
data = response.json()

print(data["entries"][0])

```

Project Structure  
```
.  
├── .env  
├── server.js  
├── package.json  
├── spotify_session/  
└── README.md

```

# Notes and Limitations

Spotify may change internal APIs at any time

Excessive requests may result in temporary blocking

First request may be slower due to browser initialization

Intended for personal, educational, or research use

# Legal Disclaimer

This project accesses undocumented internal APIs used by Spotify’s web application.
Use at your own risk and comply with applicable laws and terms of service.
