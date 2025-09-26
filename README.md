# WIP: PLaywright setup

A brief setup for playwright

## Table of Contents
- [Project Structure](#projectstructure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

Playwright-Allure-Demo/
├──.github                  # Workflow to run tests, check pr title and dependabot
├── tests/                  # Playwright test specs
    ├── api                 # API tests
    ├── config              # config with sample types, interface and default url
    ├── report              # Playwright report
    ├── ui                  # UI tests
        ├── feature         # Tests location
        ├── pages           #  Page Object Model
    ├── fixtures.ts         # Custom fixtures    
├── playwright.config.ts    # Playwright configuration
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
└── ...

## Installation

Instructions on how to install the project. Include any prerequisites and the steps to get the development environment running.

```bash
# Example installation commands
yarn

# Run example tests from playwright ui tests
yarn test:ui

# Run pw api tests
yarn test:api

# Open playwright UI
yarn test:ui