import * as React from 'react';
import { IInputs } from "./generated/ManifestTypes";

interface TimesheetProps {
    context: ComponentFramework.Context<IInputs>;
}

export const Timesheet: React.FC<TimesheetProps> = ({ context }) => {
    return React.createElement(
        'div',
        { className: 'timesheet-container', style: { padding: '20px' } },
        [
            React.createElement('h2', {}, 'Timesheet Entry'),
            React.createElement(
                'div',
                { style: { marginTop: '20px' } },
                [
                    React.createElement(
                        'table',
                        { style: { width: '100%', borderCollapse: 'collapse' } },
                        [
                            React.createElement(
                                'thead',
                                {},
                                React.createElement('tr', {}, [
                                    React.createElement('th', { style: { border: '1px solid #ddd', padding: '8px' } }, 'Date'),
                                    React.createElement('th', { style: { border: '1px solid #ddd', padding: '8px' } }, 'Hours'),
                                    React.createElement('th', { style: { border: '1px solid #ddd', padding: '8px' } }, 'Project'),
                                    React.createElement('th', { style: { border: '1px solid #ddd', padding: '8px' } }, 'Description')
                                ])
                            ),
                            React.createElement(
                                'tbody',
                                {},
                                React.createElement('tr', {}, [
                                    React.createElement(
                                        'td',
                                        { style: { border: '1px solid #ddd', padding: '8px' } },
                                        React.createElement('input', { type: 'date', style: { width: '100%' } })
                                    ),
                                    React.createElement(
                                        'td',
                                        { style: { border: '1px solid #ddd', padding: '8px' } },
                                        React.createElement('input', { type: 'number', min: '0', max: '24', style: { width: '100%' } })
                                    ),
                                    React.createElement(
                                        'td',
                                        { style: { border: '1px solid #ddd', padding: '8px' } },
                                        React.createElement('input', { type: 'text', style: { width: '100%' } })
                                    ),
                                    React.createElement(
                                        'td',
                                        { style: { border: '1px solid #ddd', padding: '8px' } },
                                        React.createElement('input', { type: 'text', style: { width: '100%' } })
                                    )
                                ])
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        { style: { marginTop: '20px' } },
                        React.createElement(
                            'button',
                            {
                                style: {
                                    padding: '8px 16px',
                                    backgroundColor: '#0078d4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }
                            },
                            'Add Entry'
                        )
                    )
                ]
            )
        ]
    );
}; 