import { analyzeFinance } from './src/services/ai.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) return console.log("No users found");
        console.log("Testing AI for user:", user.id);
        const result = await analyzeFinance(user.id, true, '$');
        console.log("Success:", result);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
