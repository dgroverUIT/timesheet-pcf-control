/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    timeEntries: ComponentFramework.PropertyTypes.StringProperty;
    projects: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
    timeEntries?: string;
    projects?: string;
}
