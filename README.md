# Timesheet PCF Control

A PowerApps Component Framework (PCF) control for timesheet entry in Dynamics 365/PowerApps.

## Features

- Date entry
- Hours tracking
- Project assignment
- Description field
- Modern UI design

## Prerequisites

- Visual Studio 2022
- Power Platform CLI
- Node.js
- npm

## Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the control
4. Use Power Platform CLI to push to your environment:
   ```
   pac pcf push --publisher-prefix YourPrefix
   ```

## Development

The control is built using:
- React 16.14.0
- TypeScript
- PowerApps Component Framework

## Project Structure

- `/TimesheetControl` - Main control files
  - `index.ts` - Entry point
  - `Timesheet.ts` - React component
  - `ControlManifest.Input.xml` - PCF manifest

## Building

```bash
npm run build
```

## Deployment

```bash
pac pcf push --publisher-prefix YourPrefix --skip-dependency-detection --skip-solution-removal
```

## License

MIT 