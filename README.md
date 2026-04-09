# somali-to-somali-dictionary

A full-stack Somali language platfrom that provides structured Somali-to-Somali lexical defintions, built from raw dicionary data through custom parsing and normalization pipeline. It's live at [qaamuuska soomaliga](https://qaamuus.xaruntasoomaaliga.com).

![Demo](./resources/big-screen.gif)

## Overview

This project is a part of a broader initiative to build high-quality language infrastructure for Somali language.s

It transforms unstructed, old noisy dictionary sources (PDFs/text/) into queryable, structured API, powering a responsive frontend with real-time suggestions.

## Features

- Word lookup with structured definitions.
- Real-time suggestions (autocomplete).
- Custom parsing pipeline for messy linguistic data.
- Relational schema for entries, senses, synonyms, and examples.
- Frontend + API integration.
- API Key-protected backend
- proxy servers in the frontend to get around CORS issues.

## Architecture

```
Raw Dictionary (PDF / Text / manually entered examples)
​​​​​​​ㅤㅤㅤㅤㅤㅤ​↓
Parsing & Cleaning Scripts
ㅤㅤㅤㅤㅤㅤ↓
Structured JSON / Data Models
ㅤㅤㅤㅤㅤㅤ↓
SQLite Database
ㅤㅤㅤㅤㅤㅤ↓
FastAPI Backend
ㅤㅤㅤㅤㅤㅤ↓
Next.js Frontend (Proxy Layer)
```

This will be the chain of processing, once a request is made by the user.

`Frontend → API → Database → Data Pipeline`

The UI sends the user input to the proxy layer. The proxy layer sends the query and API key to the backend routes. the backend route veryfies the API key and goes into data layer and retrieves the data. Thre process is reversed until the user receives the data in the UI.

## Components

- #### Parsing Layer
  - Extracts, merges, and cleans data
  - Handles mutliple sense entries, examples, and linguistic markers

- #### Database Layer
  - SQLite with relational schema with `entries`, `senses`, `examples`, and `cross_refs` tables.

- #### Backend (FastAPI)
  - Query endpoints for lookup and suggestions
  - API key authentication
  - Structured JSON Response defined with `Pydantic` ensuring response confirms to expected format.

- #### Frontend (Next.js)
  - Debounced search
  - Server-side proxy to communicate with the backend.
  - Responsive UI

##### API Example

```bash
GET /qaamuus/suggest/{prefix} # endpoint
# example request
GET /qaamuus/suggest/daal

```

```json
// Response
[
  "daal",
  "daalac",
  "daalacan",
  "daalacasho",
  "daalaco",
  "daalalli",
  "daalan",
  "daaldhe",
  "daali",
  "daalib"
]
```

```bash
# request
GET /qaamuus/define{word} # endpoint

# Example request
GET /qaamuus/define/daalac
```

```json
// Response
[
  {
    "headword": "daalac",
    "pos": "Magac Lab",
    "senses": [
      {
        "definition": "Wax dheeraad ah oo cid loo raacdo.",
        "examples": [
          "Raali galin buu bixiyay, laakiin wali daalac baa loo haystaa"
        ]
      }
    ],
    "cross_refs": []
  },
  {
    "headword": "daalac",
    "pos": "Fal Magudbe (daalacay, daalacday, daalici)",
    "senses": [
      {
        "definition": "Dayax ama qorrax soo muuqasho.",
        "examples": []
      }
    ],
    "cross_refs": []
  }
]
```

## Data Pipeline

One of the core challenges of this project is transforming unstructued linguistic data into a usable format.

#### Key Steps:

1. Extraction
   - Parse old multi-column PDF text, and handle inconsistent formatting.
2. Normalization
   - Remove noise (e.g. superscripts, spacing issues, artifacts resulting from scanned pdf file), and standardize markers and tokens.
3. Segmentation
   - Split entries into multiple headwords depending on which part of speech segment should belong. Further splitting into `headword`, part of speech: `pos`, `senses`, and `examples`.
4. Structuring
   - Converting into CSV, and then JSON schema. We then load into Relational database (SQLite) in this case.

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: Next.js (React)
- Database: SQLite
- Parsing: Python (custom scripts)
- Deployment: Vercel (frontend), Render (backend) with github CI/CD pipeline.

### Running Locally

##### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
uvicorn main:app --reload # if you only want to run on your local device
uvicorn main:app --reload --host 0.0.0.0 # over your internet.
# if port 8000 is already in use run this
uvicorn main:app --reload --host 0.0.0.0 --port 8001 # specify the port if port 8000 is in use.
```

```bash
cd front-end
npm install
npm run dev # if you want to run on your device only
npm run dev -- --hostname 0.0.0.0 # if you want to run it over your internet.
```

## Challenges and Engineering Decisions

1. **Parsing old Multi-Column PDFS**
   - Most of the dictionary data is from old PDFS that were not correctly formatted and full off scanned arficacts. It required finding ways to read the data from the pdf while maintaining PDS structure. Since these were old scanned PDFs, most of the available tools for pdf parsing struggle and so did I. After extracting the text, there were so many internal formatting inconsistences.
2. **Linguistic Variability**
   - Entries contained inconsistnet formatting, abbreviations, and markers.
   - I had to build normalization logic for markers, what little indentation that go preserved. I then had to manually correct for the parts that the heuristic normalization logic failed at.
3. **Data Modeling**
   - Designed Relational Schema to support; Multiple senses per entry. Examples per sense (very few words had examples. I am in the process of manually generating examles for daily use words and phrases). Cross references for similar words to the current entry.
4. **Frontend-Backend Separation**
   - I have used proxy layer to secure API key and avoid dealing with messy CORS issues. This helps with centralized API access for the dictionary data for now and for future projects.

## Roadmap

- [] Add fuzzy search and ranking
- [] Introduce Redis caching layer
- [] Expand dataset with more examples for each headword and clean up and discovered inconsistence.
- [] Add user-facing features (history, favorites)
- [] Build Somali NLP tools on top of dataset available and scraped data from somali websites.

## Vision

Somali language is a very law resource language, and for this reason, this project is the foundation for a broader **Somali language AI ecosystem**, including:

- Somali Lexical databases
- search and retrieval systems
- machine translation
- linguistic analysis toolsf
