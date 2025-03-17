# Timesheet PCF Control

A Power Apps Component Framework (PCF) control for managing time entries in Dynamics 365.

## Features

- Week view for time entries
- Support for multiple projects
- Draft, submitted, and approved states
- Day and week level submission
- Modern UI with React

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the control:
```bash
npm run build
```

3. Push the PCF control to your environment:
```bash
pac pcf push --publisher-prefix tsc
```

4. Import the solution:
```bash
pac solution import --path ./dist/TimesheetControl.zip
```

## Development

- The main control code is in `index.ts`
- React components are in the `components` directory
- Styles are in `css/timesheet.css`
- Solution files are in the `solution` directory

## Solution Structure

- UniqueName: tsc_TimesheetControlSolution
- Publisher Prefix: tsc
- Control Namespace: tsc
- Control Name: TimesheetControl

## Properties

- timeEntries: Collection of time entries
- projects: Collection of available projects

## Known Issues

When deploying on macOS, you might encounter .NET Framework issues with `pac pcf push`. In this case:
1. Build the control on macOS
2. Push the control and import the solution from a Windows machine 