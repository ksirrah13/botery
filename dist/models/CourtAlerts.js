"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtAlerts = void 0;
const mongoose_1 = require("mongoose");
const CourtAlertsSchema = new mongoose_1.Schema({
    userId: String,
    courtId: String,
    date: String,
    timeStart: String,
    timeEnd: String,
    status: String,
});
exports.CourtAlerts = (0, mongoose_1.model)('CourtAlerts', CourtAlertsSchema);
