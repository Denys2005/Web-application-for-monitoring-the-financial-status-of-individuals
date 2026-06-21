import dotenv from 'dotenv';
dotenv.config();

import prisma from './src/config/database.config.js';
import { analyzeFinance } from './src/services/ai.service.js';

async function test() {
    try {
        console.log("Finding a user in the database...");
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error("NO USER FOUND IN DATABASE! Please register a user first.");
            return;
        }
        console.log(`Found user: ${user.name} (ID: ${user.id}). Running financial analysis...`);
        const result = await analyzeFinance(user.id, true, '$');
        console.log("SUCCESS:", result);
    } catch (err: any) {
        console.error("FAILED WITH ERROR:", err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
