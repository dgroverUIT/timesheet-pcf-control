import * as React from 'react';
import { TimeEntry, Project } from '../types/timesheet';

interface TimeEntryFormProps {
    date: string;
    projects: Project[];
    onSubmit: (entry: Omit<TimeEntry, 'id' | 'status'>) => void;
    onCancel: () => void;
    initialValues?: TimeEntry;
}

export default function TimeEntryForm({
    date,
    projects,
    onSubmit,
    onCancel,
    initialValues
}: TimeEntryFormProps) {
    const [projectId, setProjectId] = React.useState(initialValues?.projectId || '');
    const [taskId, setTaskId] = React.useState(initialValues?.taskId || '');
    const [duration, setDuration] = React.useState(initialValues?.duration.toString() || '');
    const [description, setDescription] = React.useState(initialValues?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            projectId,
            taskId,
            duration: parseFloat(duration),
            description,
            date
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                </label>
                <select
                    id="project"
                    value={projectId}
                    onChange={(e) => {
                        setProjectId(e.target.value);
                        setTaskId(''); // Clear task when project changes
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                >
                    <option value="">Select a project</option>
                    {projects
                        .filter(project => project.status === 'active')
                        .map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))
                    }
                </select>
            </div>

            <div>
                <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-1">
                    Task
                </label>
                <select
                    id="task"
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    disabled={!projectId}
                >
                    <option value="">Select a task</option>
                    {projectId && projects
                        .find(p => p.id === projectId)?.tasks
                        ?.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.name}
                            </option>
                        ))
                    }
                </select>
            </div>

            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (hours)
                </label>
                <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="0.25"
                    max="24"
                    step="0.25"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {initialValues ? 'Update' : 'Add'} Time Entry
                </button>
            </div>
        </form>
    );
} 