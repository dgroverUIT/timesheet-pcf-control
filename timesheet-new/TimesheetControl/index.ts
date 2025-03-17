import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timesheet } from "./Timesheet";

interface TimeEntry {
    date: Date;
    hours: number;
    project: string;
    description: string;
}

interface WebAPIError {
    message: string;
    errorCode?: number;
    stack?: string;
}

interface ProjectOption {
    id: string;
    name: string;
    entityType: string;
}

export class TimesheetControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private context: ComponentFramework.Context<IInputs>;
    private notifyOutputChanged: () => void;
    private timeEntries: TimeEntry[] = [];
    private projectOptions: ProjectOption[] = [];

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.context = context;
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;

        // Initialize the control
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            // Load projects first
            await this.loadProjects();
            
            // Then load time entries
            await this.loadTimeEntries();
            
            // Render the control
            this.renderControl();
        } catch (error: unknown) {
            console.error("Error initializing control:", error);
            const webError = error as WebAPIError;
            this.context.navigation.openErrorDialog({
                errorCode: 500,
                message: "Failed to initialize timesheet control",
                details: webError.message || "Unknown error occurred"
            });
        }
    }

    private async loadProjects(): Promise<void> {
        try {
            const result = await this.context.webAPI.retrieveMultipleRecords(
                "msdyn_project",
                "?$select=msdyn_projectid,msdyn_subject&$filter=statecode eq 0"
            );
            
            this.projectOptions = result.entities.map(project => ({
                id: project.msdyn_projectid,
                name: project.msdyn_subject,
                entityType: "msdyn_project"
            }));
        } catch (error: unknown) {
            console.error("Error loading projects:", error);
            throw error;
        }
    }

    private async loadTimeEntries(): Promise<void> {
        try {
            // Get current user's ID
            const userId = this.context.userSettings.userId;
            
            // Get today's date and 30 days ago for filtering
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            // Format dates for OData filter
            const todayStr = today.toISOString();
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
            
            // Retrieve time entries for the current user from the last 30 days
            const result = await this.context.webAPI.retrieveMultipleRecords(
                "msdyn_timeentry",
                `?$select=msdyn_date,msdyn_duration,msdyn_project,msdyn_description&$filter=_ownerid_value eq ${userId} and msdyn_date ge ${thirtyDaysAgoStr} and msdyn_date le ${todayStr}&$orderby=msdyn_date desc`
            );
            
            this.timeEntries = result.entities.map(entry => ({
                date: new Date(entry.msdyn_date),
                hours: entry.msdyn_duration,
                project: entry._msdyn_project_value,
                description: entry.msdyn_description || ''
            }));
        } catch (error: unknown) {
            console.error("Error loading time entries:", error);
            throw error;
        }
    }

    private async handleSave(entry: TimeEntry): Promise<void> {
        try {
            await this.context.webAPI.createRecord("msdyn_timeentry", {
                "msdyn_date": entry.date,
                "msdyn_duration": entry.hours,
                "msdyn_project@odata.bind": `/msdyn_projects(${entry.project})`,
                "msdyn_description": entry.description
            });

            await this.loadTimeEntries();
            this.renderControl();

            this.context.navigation.openAlertDialog({
                text: "Time entry saved successfully!"
            });
        } catch (error: unknown) {
            console.error("Error saving time entry:", error);
            const webError = error as WebAPIError;
            this.context.navigation.openErrorDialog({
                errorCode: 500,
                message: "Failed to save time entry",
                details: webError.message || "Unknown error occurred"
            });
        }
    }

    private renderControl(): void {
        ReactDOM.render(
            React.createElement(Timesheet, {
                context: this.context,
                onSave: this.handleSave.bind(this),
                projectOptions: this.projectOptions,
                timeEntries: this.timeEntries
            }),
            this.container
        );
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.context = context;
        this.renderControl();
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.container);
    }
}