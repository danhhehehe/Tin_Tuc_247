import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { getFootballDebugInfo } from '../services/footballService.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

try {
  await connectDB(uri);
  const info = await getFootballDebugInfo();
  console.log('[FOOTBALL DEBUG]');
  console.log(`Provider selected: ${info.config.provider}`);
  console.log(`API-Football key: ${info.config.apiFootballKey ? 'yes' : 'no'}`);
  console.log(`football-data key: ${info.config.footballDataKey ? 'yes' : 'no'}`);
  console.log(`TheSportsDB key: ${info.config.theSportsDbKey ? 'yes' : 'no'}`);
  console.log(`ScoreBat token: ${info.config.scoreBatToken ? 'yes' : 'no'}`);
  console.log('');
  console.log('Provider result:');
  for (const result of info.providerResults) {
    console.log(`- ${result.provider}: ${result.ok ? 'success' : 'fail'}${result.reason ? ` / ${result.reason}` : ''}`);
  }
  console.log('');
  console.log(`Matches found: ${info.matchesFound}`);
  console.log(`News fallback found: ${info.newsFallbackFound}`);
  console.log(`Widget mode: ${info.widgetMode}`);
  process.exit(0);
} catch (error) {
  console.error('[DEBUG FOOTBALL FAILED]', error.message);
  process.exit(1);
}
