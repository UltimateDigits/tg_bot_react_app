**ULTIMATE BOT REACT APP**

> [!WARNING]
> DO NOT EXPOSE _**coinbase_cloud_api_key.json**_ on open network

Install All dependent Libraries : npm i

You need to start two servers
1) Auth Server 
2) React Server 

As of now we are using example AUTH server

To Start Auth Server run : 

Run this Command :  node .\node_modules\@coinbase\waas-sdk-example-auth-server\dist\index.js .\coinbase_cloud_api_key.json
After running command, you'll need to open https://localhost:8082 and allow the self-signed certificate. (Server will run on https and browser will not allow it). Just open and see a success message. Try in chrome, as brave have some issues

To Start React Server run : npm start
