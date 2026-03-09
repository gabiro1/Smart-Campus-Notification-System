import cron from 'node-cron';
import Event from '../models/Event.js';

// Run every hour
cron.schedule('0 * * * *', async () => {
    const upcoming = await Event.find({
        date: { $gte: new Date(), $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });
    
    upcoming.forEach(event => {
        console.log(`Reminder: ${event.title} is happening in less than 24 hours!`);
        // Trigger specific reminder logic here
    });
});