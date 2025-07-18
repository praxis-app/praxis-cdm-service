# Praxis CDM Service

Praxis is a chat-based collaborative decision-making (CDM) app that seamlessly blends informal discussion with structured decision-making processes. Built on the Matrix protocol for federated, decentralized communication, this tool allows groups to transition smoothly from informal conversation to structured decision-making without breaking flow.

Designed for organizations, teams, and communities that need robust group decision-making capabilities, it combines the familiarity of messaging apps with powerful decision-making features like inline proposals, multiple voting models, and forum-style organization when needed. The frontend is built with React and the Matrix JS SDK, while the backend leverages the [Synapse](https://github.com/element-hq/synapse) homeserver implementation (Python + Rust) and a custom application service for validation and extended functionality.

NOTE: This repository contains the Matrix application service that adds collaborative decision-making (CDM) capabilities to Matrix chat rooms with support for proposals, vote validation, and consensus tracking.

See the [Praxis Matrix Client](https://github.com/praxis-app/praxis-matrix-client) repository for more information.

## Work in progress

You are entering a construction yard. Things are going to change and break regularly as the project is still getting off the ground. Please bear in mind that Praxis is not yet intended for serious use outside of testing or research purposes. Your feedback is highly welcome.

Please note that this is also an experimental approach within the Praxis project. The main repository is located at https://github.com/praxis-app/praxis.

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
