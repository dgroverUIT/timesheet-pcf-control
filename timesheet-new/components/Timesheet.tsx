import * as React from 'react';

interface TimesheetProps {
    context: ComponentFramework.Context<any>;
}

export const Timesheet: React.FC<TimesheetProps> = ({ context }) => {
    return (
        <div className="timesheet-container" style={{ padding: '20px' }}>
            <h2>Timesheet Entry</h2>
            <div style={{ marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Hours</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Project</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <input type="date" style={{ width: '100%' }} />
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <input type="number" min="0" max="24" style={{ width: '100%' }} />
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <input type="text" style={{ width: '100%' }} />
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <input type="text" style={{ width: '100%' }} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div style={{ marginTop: '20px' }}>
                    <button 
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#0078d4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Add Entry
                    </button>
                </div>
            </div>
        </div>
    );
}; 