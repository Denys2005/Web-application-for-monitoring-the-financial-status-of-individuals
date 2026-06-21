// import { getIncomeLines } from './income.service.js';
// import { getExpenses } from './expense.service.js';
// import { getCashSavings } from './cashSavings.service.js';
// import { getBalanceSheet } from './balanceSheet.service.js';
// import { GoogleGenAI } from '@google/genai';

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
// const GEMINI_MODEL = process.env.GEMINI_MODEL;

// if (!GEMINI_API_KEY) {
//   throw new Error('GEMINI_API_KEY is not set in environment');
// }
// if (!GEMINI_MODEL) {
//   throw new Error('GEMINI_MODEL is not set in environment');
// }

// const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// // collecting user financial status
// export async function collectUserFinancialStatus(userId: number, includeBalanceSheet: boolean = true) {
//     const [incomes, expenses, cashSavings, balanceSheet] = await Promise.all([
//         getIncomeLines(userId),
//         getExpenses(userId),
//         getCashSavings(userId),
//         includeBalanceSheet ? getBalanceSheet(userId) : Promise.resolve(null),
//     ]);

//     return { incomes, expenses, cashSavings, balanceSheet: includeBalanceSheet ? balanceSheet : null };
// }

// export async function analyzeFinance(userId: number, includeBalanceSheet: boolean = true, currencySymbol: string = '$') {
//     const { incomes, expenses, cashSavings, balanceSheet } = await collectUserFinancialStatus(userId, includeBalanceSheet);

//     // Build user data string conditionally
//     let userDataString = `Incomes: ${JSON.stringify(incomes)}
//         Expenses: ${JSON.stringify(expenses)}
//         Cash Savings: ${JSON.stringify(cashSavings)}`;
    
//     if (includeBalanceSheet && balanceSheet) {
//         userDataString += `
//         Balance Sheet (Assets & Liabilities): ${JSON.stringify(balanceSheet)}`;
//     }

//     // Build analysis categories based on available data
//     const categories = [
//         '- Income analysis: insights on earned, passive, and portfolio income trends, ratios and more',
//         '- Expense behavior: notable increases, recurring high-cost categories, spending balance and more',
//         '- Cashflow and savings: sustainability of current savings rate, spending-to-income ratio and more'
//     ];
    
//     if (includeBalanceSheet && balanceSheet) {
//         categories.push('- Assets and liabilities: asset growth, debt-to-asset ratio, liquidity and more');
//     }
    
//     categories.push('- Financial Freedom Progress: percentage of expenses covered by passive/portfolio income, suggestions to improve the ratio and more');

//     const categoriesText = categories.join('\n        ');

//     // ai analysis
//     const response = await ai.models.generateContent({
//         model: GEMINI_MODEL!,
//         contents: `You are a financial adivsor. Given this user data, return only valid json with keys:
//         ${categoriesText}

//         Important: When mentioning any monetary values, use the currency symbol "${currencySymbol}" (e.g., ${currencySymbol}1,000).

//         User Data:
//         ${userDataString}
//         `,
//         config: {
//             systemInstruction: ` return in this format, at most 3 sentences per category and just put the main takeaways. Use ${currencySymbol} for all monetary values. { 'Income analysis': '', 'Expense behavior': '', 'Cashflow and savings': '', 'Assets and liabilities': '', 'Financial Freedom Progress': '' }`,
//         }
//     });

//     // Robust extraction of generated text
//     try {
//         const anyResp: any = response;
//         let textOutput = '';

//         // common candidate-based shape
//         const candidate = anyResp?.candidates?.[0];

//         if (candidate) {
//             const content = candidate.content;
//             if (content?.parts && Array.isArray(content.parts)) {
//                 textOutput = content.parts.map((p: any) => {
//                     if (typeof p === 'string') return p;
//                     return p?.text ?? JSON.stringify(p);
//                 }).join('');
//             } else if (typeof content === 'string') {
//                 textOutput = content;
//             } else if (content?.text) {
//                 textOutput = content.text;
//             } else {
//                 textOutput = JSON.stringify(content);
//             }
//         } else if (anyResp?.outputText && typeof anyResp.outputText === 'string') {
//             textOutput = anyResp.outputText;
//         } else if (typeof anyResp === 'string') {
//             textOutput = anyResp;
//         } else {
//             textOutput = JSON.stringify(anyResp);
//         }

//         // Remove surrounding markdown/code fences like ```json ... ```
//         textOutput = textOutput
//             .replace(/^\s*```(?:\w+)?\s*/i, '')   // leading ``` or ```json
//             .replace(/\s*```\s*$/i, '')           // trailing ```
//             .trim();

//         return textOutput;
//     } catch (err) {
//         // return full response as fallback for debugging
//         return JSON.stringify(response);
//     }
// }

import { getIncomeLines } from './income.service.js';
import { getExpenses } from './expense.service.js';
import { getCashSavings } from './cashSavings.service.js';
import { getBalanceSheet } from './balanceSheet.service.js';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
// Використовуємо модель із файлу .env або стандартну gemini-1.5-flash (моделі gemini-2.5-flash не існує)
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash"; 

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Збір фінансового стану користувача
export async function collectUserFinancialStatus(userId: number, includeBalanceSheet: boolean = true) {
    const [incomes, expenses, cashSavings, balanceSheet] = await Promise.all([
        getIncomeLines(userId),
        getExpenses(userId),
        getCashSavings(userId),
        includeBalanceSheet ? getBalanceSheet(userId) : Promise.resolve(null),
    ]);

    return { incomes, expenses, cashSavings, balanceSheet: includeBalanceSheet ? balanceSheet : null };
}

// Головна функція аналізу
export async function analyzeFinance(userId: number, includeBalanceSheet: boolean = true, currencySymbol: string = '$') {
    const { incomes, expenses, cashSavings, balanceSheet } = await collectUserFinancialStatus(userId, includeBalanceSheet);

    let userDataString = `Incomes: ${JSON.stringify(incomes)}
        Expenses: ${JSON.stringify(expenses)}
        Cash Savings: ${JSON.stringify(cashSavings)}`;
    
    if (includeBalanceSheet && balanceSheet) {
        userDataString += `\nBalance Sheet (Assets & Liabilities): ${JSON.stringify(balanceSheet)}`;
    }

    const categories = [
        '- Income analysis',
        '- Expense behavior',
        '- Cashflow and savings',
        '- Assets and liabilities',
        '- Financial Freedom Progress'
    ];
    
    const categoriesText = categories.join('\n        ');

    try {
        // Запит до штучного інтелекту
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `You are a financial advisor. Given this user data, return only valid json with keys:
            ${categoriesText}

            Important: When mentioning any monetary values, use the currency symbol "${currencySymbol}".

            User Data:
            ${userDataString}
            `,
            config: {
                systemInstruction: `return in this format, at most 3 sentences per category and just put the main takeaways. Use ${currencySymbol} for all monetary values. { 'Income analysis': '', 'Expense behavior': '', 'Cashflow and savings': '', 'Assets and liabilities': '', 'Financial Freedom Progress': '' }`
            }
        });

        const anyResp: any = response;
        let textOutput = '';

        const candidate = anyResp?.candidates?.[0];
        if (candidate) {
            const content = candidate.content;
            if (content?.parts && Array.isArray(content.parts)) {
                textOutput = content.parts.map((p: any) => p?.text ?? '').join('');
            } else if (content?.text) {
                textOutput = content.text;
            }
        } else if (anyResp?.text) {
            textOutput = anyResp.text;
        } else {
            textOutput = response?.text || '';
        }

        // Безпечне очищення від маркдауну (```json)
        textOutput = textOutput.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();

        // Повертаємо спарсений JSON об'єкт, оскільки фронтенд (SakiAssistant) очікує саме JSON для розділення на категорії
        try {
            const parsedJson = JSON.parse(textOutput);
            // Очищуємо значення від зірочок маркдауну (**)
            const cleanJson: Record<string, string> = {};
            for (const [key, value] of Object.entries(parsedJson)) {
                cleanJson[key] = (value as string).replace(/\*\*/g, '');
            }
            return cleanJson;
        } catch (parseErr) {
            // Якщо парсинг JSON не вдався, повертаємо очищений рядок
            return textOutput.replace(/\*\*/g, '');
        }

    } catch (err: any) {
        console.error("AI Generation Error:", err);
        throw err;
    }
}