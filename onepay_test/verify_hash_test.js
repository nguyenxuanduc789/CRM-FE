const crypto = require('crypto');
const querystring = require('querystring');

const urlString = "vpc_Amount=500000&vpc_Card=VIETQR&vpc_CardNum=************&vpc_Command=pay&vpc_MerchTxnRef=KT_1782481362419&vpc_Merchant=KHITAMWEB&vpc_Message=Approved&vpc_OrderInfo=Goi+Tri+Lieu+Khi+Tam+5K+Test&vpc_PayChannel=WEB&vpc_TransactionNo=PAY-V7cGKvOxQCqqFV1yp9OQ9A&vpc_TxnResponseCode=0&vpc_Version=2&vpc_SecureHash=D73EA2D06C2A2743B712119BED4DC99A3D0C99B9793A8097949FEB3CF3FF13A1";
const secretHex = "F61D8D692B54C256184059F42225C6BF";

const query = querystring.parse(urlString);
const receivedHash = query.vpc_SecureHash;
delete query.vpc_SecureHash;

// Test 1: Hashing with parsed spaces (default querystring.parse decodes '+' to space)
console.log("Parsed vpc_OrderInfo:", JSON.stringify(query.vpc_OrderInfo));

function sortObject(obj) {
    return Object.keys(obj).sort().reduce((res, key) => {
        res[key] = obj[key];
        return res;
    }, {});
}

function testHash(params, orderInfoVal) {
    const testParams = { ...params };
    if (orderInfoVal !== undefined) {
        testParams.vpc_OrderInfo = orderInfoVal;
    }
    const sorted = sortObject(testParams);
    const rawData = Object.entries(sorted)
        .filter(([k, v]) => v !== undefined && v !== null && v !== '' && k !== 'vpc_SecureHash' && k !== 'vpc_SecureHashType')
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    
    const hmac = crypto.createHmac('sha256', Buffer.from(secretHex, 'hex'));
    const hash = hmac.update(rawData).digest('hex').toUpperCase();
    console.log(`Raw data string: "${rawData}"`);
    console.log(`Generated Hash:  "${hash}"`);
    console.log(`Expected Hash:   "${receivedHash}"`);
    console.log(`Match?           ${hash === receivedHash}`);
    console.log("----------------------------");
}

console.log("--- TEST 1: Decoded Space (' ') ---");
testHash(query, "Goi Tri Lieu Khi Tam 5K Test");

console.log("--- TEST 2: Plus Sign ('+') ---");
testHash(query, "Goi+Tri+Lieu+Khi+Tam+5K+Test");

console.log("--- TEST 3: Encoded Space ('%20') ---");
testHash(query, "Goi%20Tri%20Lieu%20Khi%20Tam%205K%20Test");
