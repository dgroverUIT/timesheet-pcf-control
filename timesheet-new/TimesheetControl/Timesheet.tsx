import * as React from 'react';
import { useState } from 'react';
import { IInputs } from "./generated/ManifestTypes";

interface TimeEntry {
    date: Date;
    hours: number;
    project: string;
    description: string;
}

interface TimesheetProps {
    context: ComponentFramework.Context<IInputs>;
    onSave: (entry: TimeEntry) => Promise<void>;
    projectOptions: {
        id: string;
        name: string;
        entityType: string;
    }[];
    timeEntries: TimeEntry[];
}

export const Timesheet: React.FC<TimesheetProps> = ({ context, onSave, projectOptions, timeEntries }) => {
    const [newEntry, setNewEntry] = useState<TimeEntry>({
        date: new Date(),
        hours: 0,
        project: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await onSave(newEntry);
        setNewEntry({
            date: new Date(),
            hours: 0,
            project: '',
            description: ''
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewEntry(prev => ({
            ...prev,
            [name]: name === 'date' ? new Date(value) : 
                    name === 'hours' ? parseInt(value) || 0 : 
                    value
        }));
    };

    return (
        <div className="timesheet-container">
            <h2>New Time Entry</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={newEntry.date.toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="hours">Hours:</label>
                    <input
                        type="number"
                        id="hours"
                        name="hours"
                        min="0"
                        max="24"
                        value={newEntry.hours}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="project">Project:</label>
                    <select
                        id="project"
                        name="project"
                        value={newEntry.project}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select a project</option>
                        {projectOptions.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={newEntry.description}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit">Save Time Entry</button>
            </form>

            <h2>Recent Time Entries</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Hours</th>
                        <th>Project</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {timeEntries.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.date.toLocaleDateString()}</td>
                            <td>{entry.hours}</td>
                            <td>
                                {projectOptions.find(p => p.id === entry.project)?.name || entry.project}
                            </td>
                            <td>{entry.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 