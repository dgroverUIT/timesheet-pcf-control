import * as React from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { TimeEntry, Project } from '../types/timesheet';

interface WeekViewProps {
    timeEntries: TimeEntry[];
    projects: Project[];
    onAddTimeEntry: (date: string) => void;
    onEditTimeEntry: (entry: TimeEntry) => void;
    onMoveTimeEntry: (entryId: string, newDate: string) => void;
    onCloneTimeEntry: (entry: TimeEntry, newDate: string) => void;
    onSubmitTimeEntries: (entryIds: string[]) => void;
}

export default function WeekView({ 
    onAddTimeEntry, 
    timeEntries, 
    onEditTimeEntry,
    onMoveTimeEntry,
    onCloneTimeEntry,
    onSubmitTimeEntries,
    projects
}: WeekViewProps) {
    const [currentWeekStart, setCurrentWeekStart] = React.useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [draggedEntry, setDraggedEntry] = React.useState<TimeEntry | null>(null);

    const handlePreviousWeek = () => {
        setCurrentWeekStart(prev => subWeeks(prev, 1));
    };

    const handleNextWeek = () => {
        setCurrentWeekStart(prev => addWeeks(prev, 1));
    };

    const handleDragStart = (entry: TimeEntry, e: React.DragEvent) => {
        if (entry.status !== 'draft') {
            e.preventDefault();
            return;
        }
        setDraggedEntry(entry);
        if (entry.id) {
            e.dataTransfer.setData('text/plain', entry.id);
        }
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (targetDate: string, e: React.DragEvent) => {
        e.preventDefault();
        const entryId = e.dataTransfer.getData('text/plain');
        
        if (draggedEntry && entryId) {
            onMoveTimeEntry(entryId, targetDate);
            setDraggedEntry(null);
        }
    };

    const getProjectName = (projectId: string): string => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name.slice(0, 15) + (project.name.length > 15 ? '...' : '') : 'Unknown Project';
    };

    const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(currentWeekStart, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayEntries = timeEntries.filter(entry => entry.date === dateStr);
        const totalHours = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);

        return {
            date,
            dateStr,
            dayName: format(date, 'EEEE'),
            dayDate: format(date, 'MMM d'),
            entries: dayEntries,
            totalHours
        };
    });

    const weekRange = `${format(days[0].date, 'MMM d')} - ${format(days[6].date, 'MMM d, yyyy')}`;

    // Calculate if there are any draft entries for the week
    const hasWeekDrafts = timeEntries.some(entry => 
        days.some(day => day.dateStr === entry.date) && 
        entry.status === 'draft'
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handlePreviousWeek}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-900 flex items-center font-medium"
                    >
                        <span className="mr-1">←</span> Previous
                    </button>
                    <div className="px-4 py-2 bg-white border rounded-lg text-gray-900 font-medium">
                        {weekRange}
                    </div>
                    <button
                        onClick={handleNextWeek}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-900 flex items-center font-medium"
                    >
                        Next <span className="ml-1">→</span>
                    </button>
                </div>
                {hasWeekDrafts && (
                    <button
                        onClick={() => onSubmitTimeEntries(timeEntries
                            .filter(entry => 
                                days.some(day => day.dateStr === entry.date) && 
                                entry.status === 'draft'
                            )
                            .map(entry => entry.id!)
                        )}
                        className="px-4 py-2 bg-[#35a490] text-white rounded-lg hover:bg-[#2c8a78] transition-colors font-medium"
                    >
                        Submit Week
                    </button>
                )}
            </div>

            <div className="grid grid-cols-7 gap-4">
                {days.map((day) => {
                    const hasDraftEntries = day.entries.some(entry => entry.status === 'draft');
                    const allEntriesSubmitted = day.entries.length > 0 && day.entries.every(entry => entry.status !== 'draft');

                    return (
                        <div
                            key={day.dateStr}
                            className={`border rounded-lg p-4 bg-white hover:shadow-md transition-shadow
                                ${format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                                    ? 'ring-2 ring-blue-500' 
                                    : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(day.dateStr, e)}
                        >
                            <div className="space-y-2 mb-4">
                                <div className="text-center">
                                    <div className="font-medium text-gray-900">{day.dayName}</div>
                                    <div className="text-lg font-bold text-gray-900">{day.dayDate}</div>
                                </div>
                                {hasDraftEntries ? (
                                    <button
                                        onClick={() => onSubmitTimeEntries(
                                            day.entries
                                                .filter(entry => entry.status === 'draft')
                                                .map(entry => entry.id!)
                                        )}
                                        className="w-full px-3 py-1 text-sm bg-[#35a490] text-white rounded hover:bg-[#2c8a78] transition-colors font-medium"
                                    >
                                        Submit Day
                                    </button>
                                ) : allEntriesSubmitted ? (
                                    <div className="text-sm text-[#35a490] font-medium text-center">
                                        All Entries Submitted
                                    </div>
                                ) : null}
                            </div>
                            
                            <div className="space-y-2">
                                {day.entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={`text-sm p-2 bg-gray-50 rounded border group 
                                            ${entry.status === 'draft' 
                                                ? 'border-gray-200 cursor-move' 
                                                : entry.status === 'submitted'
                                                ? 'border-[#35a490] bg-[#35a490]/5'
                                                : 'border-green-200 bg-green-50'}`}
                                        draggable={entry.status === 'draft'}
                                        onDragStart={(e) => handleDragStart(entry, e)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="font-medium text-gray-900">{entry.duration}h</div>
                                                {entry.status !== 'draft' && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full
                                                        ${entry.status === 'submitted' 
                                                            ? 'bg-[#35a490]/10 text-[#35a490]' 
                                                            : 'bg-green-100 text-green-800'}`}>
                                                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                                {entry.status === 'draft' && (
                                                    <>
                                                        <button
                                                            onClick={() => onEditTimeEntry(entry)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Edit"
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            onClick={() => onCloneTimeEntry(entry, day.dateStr)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Clone"
                                                        >
                                                            ⧉
                                                        </button>
                                                    </>
                                                )}
                                                {entry.status === 'submitted' && (
                                                    <button
                                                        onClick={() => onCloneTimeEntry(entry, day.dateStr)}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Clone"
                                                    >
                                                        ⧉
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-gray-700 mt-1 truncate">
                                            {getProjectName(entry.projectId)}
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="text-center pt-2 border-t">
                                    <div className="text-sm font-medium text-gray-900 mb-2">
                                        Total: {day.totalHours}h
                                    </div>
                                    {!allEntriesSubmitted && (
                                        <button
                                            onClick={() => onAddTimeEntry(day.dateStr)}
                                            className="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                                        >
                                            + Add Time
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 