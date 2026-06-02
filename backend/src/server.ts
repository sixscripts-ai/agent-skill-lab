import express from 'express';
import cors from 'cors';
import {
  getHealthPayload,
  getRegistryPayload,
  getRuntimePayload,
  getProvidersPayload,
  getMcpPayload,
  getLogsPayload,
  getLatestReportPayload,
  getRunHistoryPayload,
  runCliCommand,
  runDoctorCommand,
  runEvalCommand,
  runSyncCommand,
  runPromptCommand,
  runGateCommand,
  runDedupeCommand
} from './skillLabBackend.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => res.json(await getHealthPayload()));
app.get('/api/registry', async (req, res) => res.json(await getRegistryPayload()));
app.get('/api/runtime', async (req, res) => res.json(await getRuntimePayload()));
app.get('/api/providers', async (req, res) => res.json(await getProvidersPayload()));
app.get('/api/mcp', async (req, res) => res.json(await getMcpPayload()));
app.get('/api/logs', async (req, res) => res.json(await getLogsPayload()));
app.get('/api/reports/latest', async (req, res) => res.json(await getLatestReportPayload()));
app.get('/api/history', async (req, res) => res.json(await getRunHistoryPayload()));

app.post('/api/cli', async (req, res) => res.json(await runCliCommand(req.body.command)));
app.post('/api/doctor', async (req, res) => res.json(await runDoctorCommand()));
app.post('/api/eval', async (req, res) => res.json(await runEvalCommand()));
app.post('/api/sync', async (req, res) => res.json(await runSyncCommand(req.body.target || 'all')));
app.post('/api/run', async (req, res) => res.json(await runPromptCommand(req.body.prompt)));
app.post('/api/gate', async (req, res) => res.json(await runGateCommand(req.body.command)));
app.post('/api/dedupe', async (req, res) => res.json(await runDedupeCommand(req.body.name, req.body.description)));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});
