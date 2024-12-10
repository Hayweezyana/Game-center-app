import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

const Reports = () => {
    const [records, setRecords] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        // Fetch records periodically when a date range is set
        if (startDate && endDate) {
            axios
                .get(`${process.env.REACT_APP_BACKEND_URL}/api/reports`, {
                    params: { startDate, endDate },
                })
                .then((response) => setRecords(response.data))
                .catch((error) => console.error('Error fetching records:', error));
        }
    }, [startDate, endDate]);

    const exportToExcel = () => {
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/reports/export`, {
                params: { startDate, endDate },
                responseType: 'blob',
            })
            .then((response) => {
                const blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                saveAs(blob, `Report_${startDate}_to_${endDate}.xlsx`);
            })
            .catch((error) => console.error('Error exporting records:', error));
    };

    const handlePrint = () => {
        const printContent = document.getElementById('report-table').outerHTML;
        const newWindow = window.open('', '_blank');
        newWindow.document.write('<html><head><title>Report</title></head><body>');
        newWindow.document.write(printContent);
        newWindow.document.write('</body></html>');
        newWindow.document.close();
        newWindow.print();
    };

    return (
        <div>
            <h1>Reports</h1>
            <div>
                <label>
                    Start Date:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label>
                    End Date:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
            </div>

            <table id="report-table" border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Duration</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id}>
                            <td>{record.id}</td>
                            <td>{record.title}</td>
                            <td>{record.duration}</td>
                            <td>{record.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={exportToExcel}>Export to Excel</button>
            <button onClick={handlePrint}>Print Report</button>
        </div>
    );
};

export default Reports;
