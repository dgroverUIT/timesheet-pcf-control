import { IInputs, IOutputs } from "../generated/ManifestTypes";

export interface TimeEntry {
    id?: string;
    projectId: string;
    taskId: string;
    date: string;
    duration: number;
    description?: string;
    status: 'draft' | 'submitted' | 'approved';
}

export interface Task {
    id: string;
    name: string;
    projectId: string;
}

export interface Project {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    tasks: Task[];
}

export interface D365TimeEntry {
    msdyn_timeentryid: string;
    msdyn_project: string;
    msdyn_projecttask: string;
    msdyn_start: string;
    msdyn_duration: number;
    msdyn_description: string;
    statuscode: number;
}

export interface D365Project {
    msdyn_projectid: string;
    msdyn_subject: string;
    statuscode: number;
}

export interface D365Task {
    msdyn_projecttaskid: string;
    msdyn_subject: string;
    msdyn_project: string;
}

export interface TimesheetInputs extends IInputs {
    // Add any specific input parameters for your PCF control
}

export interface TimesheetOutputs extends IOutputs {
    // Add any specific output parameters for your PCF control
} 