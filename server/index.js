
const waas = require('@coinbase/waas-server-auth');
const express = require('express');
const app = express();

const apiKeyName = "organizations/bc6d9ff7-1cff-410a-bf5e-22a495a69512/apiKeys/00e85827-60d3-44f7-9785-731f4d6a7354";
const privateKey = "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIJgL5jDxMryp38GzRkgRr5qda07rIsQh7CQkANfRs67WoAoGCCqGSM49\nAwEHoUQDQgAEDuHp5jlIv0P5jxCURtj26uvpJttDxtHUfVKplYQ4dQHvSdmZZabK\nT79J2ZnE2Bt9blNnrTxCoDNgam89cwoMPw==\n-----END EC PRIVATE KEY-----\n";

app.post("/auth", async (_, res) => {
    const userID = "<User UUID>"
    const token = await waas.issueUserToken({ apiKeyName, privateKey, userID });

    res.json({ success: true, token });
});

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});