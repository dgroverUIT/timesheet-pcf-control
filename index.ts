import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { TimeEntry, Project, TimesheetInputs, TimesheetOutputs, D365Project, D365Task } from "./types/timesheet";
import WeekView from "./components/WeekView";

type D365Entity = ComponentFramework.WebApi.Entity;

export class TimesheetControl implements ComponentFramework.StandardControl<TimesheetInputs, TimesheetOutputs> {
    private container: HTMLDivElement;
    private notifyOutputChanged: () => void;
    private context: ComponentFramework.Context<TimesheetInputs, TimesheetOutputs>;
    private timeEntries: TimeEntry[] = [];
    private projects: Project[] = [];

    public init(
        context: ComponentFramework.Context<TimesheetInputs, TimesheetOutputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;
        this.context = context;

        // Load projects and tasks
        this.loadProjects().then(() => {
            // Load time entries after projects are loaded
            this.loadTimeEntries();
        });
    }

    private async loadProjects(): Promise<void> {
        try {
            const result = await this.context.webAPI.retrieveMultipleRecords(
                "msdyn_project",
                "?$select=msdyn_projectid,msdyn_subject,statuscode&$expand=msdyn_projecttask_Project($select=msdyn_projecttaskid,msdyn_subject)"
            );

            this.projects = result.entities.map((entity: D365Entity) => {
                const project = entity as unknown as D365Project & { msdyn_projecttask_Project: D365Task[] };
                return {
                    id: project.msdyn_projectid,
                    name: project.msdyn_subject,
                    status: project.statuscode === 1 ? 'active' : 'inactive',
                    tasks: project.msdyn_projecttask_Project.map((task: D365Task) => ({
                        id: task.msdyn_projecttaskid,
                        name: task.msdyn_subject,
                        projectId: project.msdyn_projectid
                    }))
                };
            });

            this.updateView();
        } catch (error) {
            console.error("Error loading projects:", error);
        }
    }

    private async loadTimeEntries(): Promise<void> {
        try {
            const result = await this.context.webAPI.retrieveMultipleRecords(
                "msdyn_timeentry",
                `?$select=msdyn_timeentryid,msdyn_project,msdyn_projecttask,msdyn_start,msdyn_duration,msdyn_description,statuscode&$filter=_ownerid_value eq ${this.context.userSettings.userId}`
            );

            this.timeEntries = result.entities.map((entity: D365Entity) => {
                const entry = entity as unknown as {
                    msdyn_timeentryid: string;
                    msdyn_project: string;
                    msdyn_projecttask: string;
                    msdyn_start: string;
                    msdyn_duration: number;
                    msdyn_description: string;
                    statuscode: number;
                };
                return {
                    id: entry.msdyn_timeentryid,
                    projectId: entry.msdyn_project,
                    taskId: entry.msdyn_projecttask,
                    date: new Date(entry.msdyn_start).toISOString().split('T')[0],
                    duration: entry.msdyn_duration,
                    description: entry.msdyn_description,
                    status: this.mapStatusCode(entry.statuscode)
                };
            });

            this.updateView();
        } catch (error) {
            console.error("Error loading time entries:", error);
        }
    }

    private mapStatusCode(statuscode: number): TimeEntry['status'] {
        switch (statuscode) {
            case 1: return 'draft';
            case 2: return 'submitted';
            case 3: return 'approved';
            default: return 'draft';
        }
    }

    private handleAddTimeEntry = (date: string) => {
        // Show form to add new time entry
        // This will be implemented in the modal component
    };

    private handleEditTimeEntry = (entry: TimeEntry) => {
        // Show form to edit time entry
        // This will be implemented in the modal component
    };

    private handleMoveTimeEntry = async (entryId: string, newDate: string) => {
        try {
            const entry = this.timeEntries.find(e => e.id === entryId);
            if (!entry) return;

            await this.context.webAPI.updateRecord(
                "msdyn_timeentry",
                entryId,
                {
                    msdyn_start: `${newDate}T00:00:00.000Z`
                }
            );

            entry.date = newDate;
            this.updateView();
        } catch (error) {
            console.error("Error moving time entry:", error);
        }
    };

    private handleCloneTimeEntry = async (entry: TimeEntry, newDate: string) => {
        try {
            const result = await this.context.webAPI.createRecord(
                "msdyn_timeentry",
                {
                    msdyn_project: entry.projectId,
                    msdyn_projecttask: entry.taskId,
                    msdyn_start: `${newDate}T00:00:00.000Z`,
                    msdyn_duration: entry.duration,
                    msdyn_description: entry.description,
                    statuscode: 1 // Always create as draft
                }
            );

            const newEntry: TimeEntry = {
                id: result.id,
                projectId: entry.projectId,
                taskId: entry.taskId,
                date: newDate,
                duration: entry.duration,
                description: entry.description,
                status: 'draft'
            };

            this.timeEntries.push(newEntry);
            this.updateView();
        } catch (error) {
            console.error("Error cloning time entry:", error);
        }
    };

    private handleSubmitTimeEntries = async (entryIds: string[]) => {
        try {
            for (const entryId of entryIds) {
                await this.context.webAPI.updateRecord(
                    "msdyn_timeentry",
                    entryId,
                    {
                        statuscode: 2 // Set to submitted
                    }
                );

                const entry = this.timeEntries.find(e => e.id === entryId);
                if (entry) {
                    entry.status = 'submitted';
                }
            }

            this.updateView();
        } catch (error) {
            console.error("Error submitting time entries:", error);
        }
    };

    public updateView(context?: ComponentFramework.Context<TimesheetInputs, TimesheetOutputs>): void {
        if (context) {
            this.context = context;
        }
        
        ReactDOM.render(
            React.createElement(WeekView, {
                timeEntries: this.timeEntries,
                projects: this.projects,
                onAddTimeEntry: this.handleAddTimeEntry,
                onEditTimeEntry: this.handleEditTimeEntry,
                onMoveTimeEntry: this.handleMoveTimeEntry,
                onCloneTimeEntry: this.handleCloneTimeEntry,
                onSubmitTimeEntries: this.handleSubmitTimeEntries
            }),
            this.container
        );
    }

    public getOutputs(): TimesheetOutputs {
        return {};
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.container);
    }
} 