# Personal Executive AI – System Architecture

## Overview

This application is a Context-Aware Personal Executive that acts as a memory layer for users.  
It retrieves information from multiple sources like:

- Emails
- PDFs
- CSV files
- Notes

The system uses an AI agent architecture to decide which data source to search.

---

## Architecture Flow

User Query
↓
Frontend (React)
↓
Backend API (FastAPI)
↓
CrewAI Agent System
↓
Tool Layer
↓
Data Sources
↓
Response to User

---

## Components

### Frontend

Built with React and Tailwind.

Features:

- Login / Signup
- Chat interface
- File uploads
- Dashboard

### Backend

Built using FastAPI.

Handles:

- authentication
- chat processing
- file uploads
- search requests

### AI Agents

Agents coordinate the system:

Manager Agent

- decides which tool to use

Document Agent

- searches PDF and CSV

Email Agent

- searches email datasets

Answer Agent

- generates the final response

---

## Data Sources

1. Email dataset
2. PDF reports
3. CSV structured data
4. Notes text files

---

## Storage

Uploads:

- user documents

Embeddings:

- semantic vectors for document search

---

## Future Improvements

- integrate OpenAI or local LLM
- semantic vector search
- real email integrations
- knowledge graph memory
