# Doc Viewer Certification Demo

* `npm run start` to run the example
* port `localhost:3005`
* certificates & files avaiable in /public folder
* Application is also served for demo purposes - http://164.90.235.200:3005

Demo flow:
1. pick a file below
2. load it into viewer via button
3. all the certificates are fetched from file-server `http://164.90.235.200:3010`
4. file with no certificate and self-signed are displayed correctly - file using CA public certificate is not

Expected Result:
* Extracted public GlobalSign CA from certificates within Acrobat Reader.
* We'd like PDFTron to certify this signature the same reader does it.
