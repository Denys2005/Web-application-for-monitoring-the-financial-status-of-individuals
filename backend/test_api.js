import http from 'http';

const loginData = JSON.stringify({ email: 'test@test.com', password: 'password123' });
const req = http.request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const token = JSON.parse(data).accessToken;
            if (!token) return console.log("Login failed", data);
            
            http.get('http://localhost:5000/api/ai/showinformation?includeBalanceSheet=false&currencySymbol=$', {
                headers: { 'Authorization': `Bearer ${token}` }
            }, (res2) => {
                let data2 = '';
                res2.on('data', chunk => data2 += chunk);
                res2.on('end', () => console.log("AI result:", data2));
            }).on('error', console.error);
        } catch(e) {
            console.log("Error parsing login response", data);
        }
    });
});
req.on('error', console.error);
req.write(loginData);
req.end();
