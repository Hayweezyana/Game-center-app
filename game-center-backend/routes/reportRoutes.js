const express = require('express');
const router = express.Router();
const { Game } = require('../models'); // Adjust model import as needed
const { Op } = require('sequelize');

const ExcelJS = require('exceljs');

router.get('/reports/export', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const records = await Game.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)],
                },
            },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Duration', key: 'duration', width: 15 },
            { header: 'Date', key: 'createdAt', width: 20 },
        ];

        worksheet.addRows(records.map((record) => record.dataValues));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Report_${startDate}_to_${endDate}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting records:', error);
        res.status(500).json({ error: 'An error occurred while exporting reports.' });
    }
});


module.exports = router;