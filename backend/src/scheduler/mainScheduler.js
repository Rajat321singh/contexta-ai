import cron from 'node-cron';
import { collectAllSources } from '../collectors/index.js';
import { processUnprocessedEvents } from './eventProcessor.js';
import { startDigestScheduler } from './digestScheduler.js';

export function startSchedulers() {
  console.log('\n🚀 Starting all schedulers...\n');

  // 1. Collect data every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('\n📡 Scheduled data collection triggered');
    try {
      await collectAllSources();
    } catch (error) {
      console.error('Collection error:', error);
    }
  });

  // 2. Process events every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('\n🤖 Scheduled event processing triggered');
    try {
      await processUnprocessedEvents();
    } catch (error) {
      console.error('Processing error:', error);
    }
  });

  // 3. Start digest scheduler
  startDigestScheduler();

  console.log('✅ All schedulers active\n');
}