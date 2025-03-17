import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WeekView } from "./components/WeekView";
import { TimeEntry, Project } from "./types/timesheet";

export class TimesheetControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _timeEntries: TimeEntry[] = [];
    private _projects: Project[] = [];
    private _notifyOutputChanged: () => void;

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary): void {
        this._container = document.createElement("div");
        this._notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Get time entries from the bound dataset
        const timeEntriesDataSet = context.parameters.timeEntries;
        if (timeEntriesDataSet.loading) return;

        this._timeEntries = timeEntriesDataSet.sortedRecordIds.map(id => {
            const record = timeEntriesDataSet.records[id];
            return {
                id: record.getRecordId(),
                date: new Date(record.getValue("date")),
                hours: record.getValue("hours"),
                project: record.getValue("project"),
                description: record.getValue("description"),
                status: record.getValue("status")
            };
        });

        // Get projects from the bound dataset
        const projectsDataSet = context.parameters.projects;
        if (projectsDataSet.loading) return;

        this._projects = projectsDataSet.sortedRecordIds.map(id => {
            const record = projectsDataSet.records[id];
            return {
                id: record.getRecordId(),
                name: record.getValue("name")
            };
        });

        ReactDOM.render(
            React.createElement(WeekView, {
                timeEntries: this._timeEntries,
                projects: this._projects,
                onTimeEntryChange: this.onTimeEntryChange.bind(this),
                onTimeEntrySubmit: this.onTimeEntrySubmit.bind(this),
                onTimeEntryDelete: this.onTimeEntryDelete.bind(this)
            }),
            this._container
        );
    }

    private onTimeEntryChange(entry: TimeEntry): void {
        // Handle time entry changes
        this._notifyOutputChanged();
    }

    private onTimeEntrySubmit(entry: TimeEntry): void {
        // Handle time entry submission
        this._notifyOutputChanged();
    }

    private onTimeEntryDelete(entryId: string): void {
        // Handle time entry deletion
        this._notifyOutputChanged();
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
    }
} 