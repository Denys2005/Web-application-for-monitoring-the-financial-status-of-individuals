import http from 'http';

const email = 'test' + Date.now() + '@test.com';
const password = 'password123';

const registerData = JSON.stringify({ email, password, firstName: 'Test', lastName: 'User' });
const req = http.request('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerData)
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const token = JSON.parse(data).accessToken;
            if (!token) return console.log("Register failed", data);
            
            http.get('http://localhost:5000/api/ai/showinformation?includeBalanceSheet=false&currencySymbol=$', {
                headers: { 'Authorization': `Bearer ${token}` }
            }, (res2) => {
                let data2 = '';
                res2.on('data', chunk => data2 += chunk);
                res2.on('end', () => console.log("AI result:", data2));
            }).on('error', console.error);
        } catch(e) {
            console.log("Error parsing register response", data);
        }
    });
});
req.on('error', console.error);
req.write(registerData);
req.end();
