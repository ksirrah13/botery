"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatus = void 0;
const mongoose_1 = require("mongoose");
const jobStatusSchema = new mongoose_1.Schema({
    jobId: { type: String, required: true },
    status: { type: String, required: true },
});
exports.JobStatus = (0, mongoose_1.model)('JobStatus', jobStatusSchema);
