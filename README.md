# Praxis CDM Service

Matrix application service that adds collaborative decision-making (CDM) capabilities to Matrix chat rooms with support for proposals, vote validation, consensus tracking, as well as optional LLM-assisted facilitation.

## Work in progress

You are entering a construction yard. Things are going to change and break regularly as the project is still getting off the ground. Please bear in mind that Praxis is not yet intended for serious use outside of testing or research purposes. Your feedback is highly welcome.

## Installation and setup

Ensure that you have [Node.js](https://nodejs.org/en/download) v22.11.0 installed on your machine before proceeding.

```bash
# Install project dependencies
$ npm install

# Copy environment variables
$ cp .env.example .env
```

## Docker

Install [Docker](https://docs.docker.com/engine/install) to use the following commands.

```bash
# Start app in a container
$ docker compose up -d

# Build and restart app after making changes
$ docker compose up -d --build
```
