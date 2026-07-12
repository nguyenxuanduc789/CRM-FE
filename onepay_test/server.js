require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const querystring = require('querystring');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3333;

// ==========================================
// 1. KẾT NỐI MONGODB & MODEL
// ==========================================
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Đã kết nối thành công tới MongoDB'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

const orderSchema = new mongoose.Schema({
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    courseName: String,
    productId: String,
    totalAmount: String,
    currency: { type: String, default: 'VND' },
    cartDetails: Object,
    orderId: String,
    status: { type: String, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
    onepayResponse: Object // Lưu lại lịch sử dữ liệu OnePay trả về để đối soát
});
const Order = mongoose.model('Order', orderSchema);

// ==========================================
// THÊM TABLE THU THẬP THÔNG TIN KHÁCH HÀNG
// ==========================================
const customerLeadSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    task: { type: String }, // Mục đích / Ghi chú / Task
    createdAt: { type: Date, default: Date.now }
});
const CustomerLead = mongoose.model('CustomerLead', customerLeadSchema);

// ==========================================
// THÊM TABLE MAILCHIMP DATA
// ==========================================
const mailchimpDataSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    tags: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});
const MailchimpData = mongoose.model('MailchimpData', mailchimpDataSchema);

// ==========================================
// THÊM TABLE PIPELINE (GHI NHẬN DOANH SỐ)
// ==========================================
const autoIncrement = require("mongoose-sequence")(mongoose);
const pipelineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
    stage: {
      type: String,
      enum: [
        "Quan tâm/tiềm năng",
        "Đang tìm hiểu",
        "Gởi báo giá",
        "Đang cân nhắc",
        "Chốt Deal",
        "Hoàn tất thu tiền",
        "Deal chưa thành công",
        "Khách hàng của affiliate",
      ],
      required: false,
    },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
    amountTotal: { type: Number, required: true, default: 0 },
    Firstpayment: { type: Number, required: true, default: 0 },
    voucherType: { type: String, enum: ["Percent", "Amount"] },
    voucherInt: { type: Number },
    depositAmount: { type: Number, default: 0 },
    PaymentType: { type: String, enum: ["Full", "Install"], default: "Full" },
    totalAmount: { type: Number, default: 0 },
    expectedCloseDate: { type: Date },
    notes: { type: String, required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    K: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, value: { type: String, required: false } }],
    orderCode: { type: Number, unique: true },
    status: { type: String, enum: ["Pending", "Installment", "Completed", "Cancelled"], default: "Pending" },
    surcharge: { type: Number, default: 0 },
    images: [{ url: { type: String, required: true }, filename: { type: String, required: true } }],
    isAffiliate: { type: Boolean, required: false, default: false },
    isBusinessPartner: { type: Boolean, required: false, default: false },
    installments: [{
        installmentNumber: { type: Number, required: true },
        amount: { type: Number, required: true },
        expectedDate: { type: Date, required: true },
        isPaid: { type: Boolean, default: false },
        actualPaymentDate: { type: Date },
        isEmailSent: { type: Boolean, default: false },
    }],
    firstPaymentConfirmed: { type: Boolean, default: false },
    paymentInfo: {
      transactionId: { type: String },
      cassoTransactionId: { type: String },
      amount: { type: Number },
      paymentDate: { type: Date },
      description: { type: String },
      cusum_balance: { type: Number },
    },
    expiryEmailReminders: {
      reminded1Month: { type: Boolean, default: false },
      reminded10Days: { type: Boolean, default: false },
      reminded1Day: { type: Boolean, default: false },
    },
  },
  { timestamps: true, collection: "Pipelines" }
);

pipelineSchema.plugin(autoIncrement, { inc_field: "orderCode", start_seq: 0 });
const Pipeline = mongoose.model("Pipeline", pipelineSchema);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// THÔNG TIN CẤU HÌNH ONEPAY & ZAPIER (TỪ FILE .ENV)
// ==========================================
const merchantId = process.env.ONEPAY_MERCHANT_ID;
const accessCode = process.env.ONEPAY_ACCESS_CODE;
const hashCode = process.env.ONEPAY_HASH_CODE;
const paygateUrl = process.env.ONEPAY_PAYGATE_URL;
const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
const myDomain = process.env.MY_DOMAIN;
const successRedirectUrl = process.env.SUCCESS_REDIRECT_URL;

// Cấu hình QueryDR
const queryDrUrl = process.env.ONEPAY_QUERY_DR_URL;
const queryDrUser = process.env.ONEPAY_QUERY_DR_USER;
const queryDrPassword = process.env.ONEPAY_QUERY_DR_PASSWORD;

/**
 * Sắp xếp các key của Object theo thứ tự Alphabet
 */
function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((res, key) => {
            res[key] = obj[key];
            return res;
        }, {});
}

/**
 * Tính toán Secure Hash bằng thuật toán HMAC-SHA256
 */
function generateSecureHash(params, secretHex) {
    const sortedParams = sortObject(params);
    const rawData = Object.entries(sortedParams)
        .filter(([k, v]) => v !== undefined && v !== null && v !== '' && k !== 'vpc_SecureHash')
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    
    const hmac = crypto.createHmac('sha256', Buffer.from(secretHex, 'hex'));
    return hmac.update(rawData).digest('hex').toUpperCase();
}

// ==========================================
// CẤU HÌNH GỬI EMAIL (Nodemailer)
// ==========================================
const landingMailTransporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'tech@khitamtherapy.com',
    pass: 'gHyK2h$xU3VL',
  },
  tls: { ciphers: 'SSLv3' },
});

async function sendThankYouEmail(order) {
    try {
        const mailOptions = {
            from: '"Khi Tam Therapy Academy" <tech@khitamtherapy.com>',
            to: order.customerEmail,
            cc: 'cloudyluong1205@gmail.com, ducprokb1234@gmail.com, ketoannoibodtp2025@gmail.com, khitamtherapytech@gmail.com, thanhyen.bui@khitamtherapy.com',
            subject: `Xác nhận thanh toán thành công - Khóa học ${order.courseName}`,
            text: `Kính gửi Quý học viên ${order.customerName || ''},

Chúng tôi xin vui mừng xác nhận rằng thanh toán của Quý học viên đã được nhận thành công.

Thông tin thanh toán:
- Dịch vụ: ${order.courseName || ''}
- Giá trị thanh toán: ${Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND
- Mã đơn hàng: ${order.orderId || ''}
- Ngày giao dịch: ${new Date().toLocaleDateString('vi-VN')}
- Phương thức thanh toán: Chuyển khoản ngân hàng qua OnePay

Quý học viên đã chính thức trở thành học viên của Học viện Khí Tâm trị liệu quốc tế. Chúng tôi rất vinh dự được đồng hành cùng Quý học viên trên hành trình học tập và phát triển bản thân.

Chúng tôi cam kết sẽ hỗ trợ Quý học viên một cách tốt nhất trong suốt quá trình học tập.

_____________________________________________________________________________________

Nếu Quý học viên cần bất kỳ hỗ trợ nào, vui lòng liên hệ qua các kênh sau:
- Ban Điều hành:
  Nhà sáng lập: tohai.le@khitamtherapy.com
  CEO Mrs Thanh Yên: thanhyen.bui@khitamtherapy.com
- Team hỗ trợ chuyên môn/đào tạo: academy@khitamtherapy.com
  Mr. Trường Xuân: (+84) 975 077 201
- Team hỗ trợ kỹ thuật IT: tech@khitamtherapy.com
  Mr. Trung Tín: (+84) 913 306 193
  Mr. Nguyễn Xuân Đức: (+84) 70 881 7979

Một lần nữa, xin chân thành cảm ơn sự tin tưởng và đồng hành của Quý học viên.

Chúc Quý học viên mạnh khỏe, bình an và gặt hái nhiều thành công trên hành trình học tập tại Khí Tâm Academy International.

Trân trọng kính chào,
Học viện Khí Tâm Trị liệu Quốc tế
Academy Team`
        };

        const info = await landingMailTransporter.sendMail(mailOptions);
        console.log(`📧 Đã gửi email cảm ơn thành công cho ${order.customerEmail}: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Lỗi gửi email cảm ơn:', error);
    }
}

// ==========================================
// Hàm Xử lý Ghi Nhận Thanh Toán & Bắn Zapier
// ==========================================
async function processSuccessfulPayment(orderId, onepayData = null) {
    try {
        const order = await Order.findOne({ orderId: orderId });
        if (order) {
            let updateFields = {};
            if (order.status !== 'PAID') {
                updateFields.status = 'PAID';
            }
            if (onepayData) {
                updateFields.onepayResponse = onepayData;
            }

            if (Object.keys(updateFields).length > 0) {
                await Order.updateOne({ orderId: orderId }, { $set: updateFields });
            }

            // Chỉ bắn Zapier nếu trạng thái trước đó chưa phải PAID
            if (order.status !== 'PAID') {
                console.log(`✅ Đơn hàng ${orderId} đã CẬP NHẬT PAID! Bắt đầu gửi Zapier và tạo Pipeline...`);

                // Tạo Pipeline để ghi nhận doanh số
                try {
                    let contactInfo = await CustomerLead.findOne({ email: order.customerEmail });
                    let contactId = contactInfo ? contactInfo._id : new mongoose.Types.ObjectId();
                    
                    const newPipeline = new Pipeline({
                        user: contactId,
                        contact: contactId,
                        createdBy: new mongoose.Types.ObjectId("6673b41f56d8b67ed4a5465e"), // ID mặc định của người tạo Website
                        stage: "Hoàn tất thu tiền",
                        amountTotal: Number(order.totalAmount) || 0,
                        totalAmount: Number(order.totalAmount) || 0,
                        Firstpayment: Number(order.totalAmount) || 0,
                        PaymentType: "Full",
                        status: "Completed",
                        notes: `Đơn hàng tự động từ Website OnePay: ${order.orderId}`
                    });
                    await newPipeline.save();
                    console.log(`✅ Đã thêm Pipeline ghi nhận doanh số cho đơn hàng ${order.orderId}`);
                } catch (pipeErr) {
                    console.error("❌ Lỗi tạo Pipeline:", pipeErr.message);
                }

                const nameParts = (order.customerName || '').trim().split(' ');
                const zapierPayload = {
                    email: order.customerEmail,
                    fullName: order.customerName,
                    firstName: nameParts[nameParts.length - 1] || '',
                    lastName: nameParts.slice(0, -1).join(' ') || '',
                    phone: order.customerPhone,
                    courseName: order.courseName,
                    productId: order.productId,
                    productType: order.cartDetails?.lineItems?.[0]?.resource || 'course',
                    orderId: order.orderId,
                    totalAmount: order.totalAmount
                };

                axios.post(zapierWebhookUrl, zapierPayload)
                     .then(() => console.log(`🚀 Zapier: Ghi danh thành công cho đơn ${orderId}!`))
                     .catch(e => console.error("❌ Zapier Lỗi:", e.message));

                // Gửi email cảm ơn
                await sendThankYouEmail(order);
            }
        } else {
            console.error(`❌ Không tìm thấy đơn hàng ${orderId} trong hệ thống.`);
        }
    } catch(e) {
        console.error("❌ Lỗi cập nhật DB & gửi Zapier:", e);
    }
}

// ==========================================
// 2. API TẠO ĐƠN HÀNG VÀ TẠO LINK ONEPAY
// ==========================================
app.post('/api/create-payment', async (req, res) => {
    try {
        const { cusName, cusEmail, cusPhone, cartData } = req.body;
        const amount = cartData?.totals?.totalAmount?.amount || 0;
        const currency = cartData?.totals?.currency || 'VND';
        const orderId = 'KT_' + Date.now(); // Sử dụng prefix KT (Khi Tam) thay vì TEST
        
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (clientIp.includes(',')) clientIp = clientIp.split(',')[0].trim();
        clientIp = clientIp.substring(0, 15);
        
        let courseName = 'Sản phẩm không có tên';
        let productId = '';
        
        if (cartData?.lineItems?.length > 0) {
            const item = cartData.lineItems[0];
            courseName = item.productTitle || courseName;
            productId = item.productTitleId || item.id || '';
            if (productId.startsWith('package_')) productId = productId.replace('package_', '');
        }
        
        // Lưu đơn hàng nháp (PENDING) vào database
        const newOrder = new Order({
            customerName: cusName,
            customerEmail: cusEmail,
            customerPhone: cusPhone,
            courseName: courseName,
            productId: productId,
            totalAmount: amount.toString(),
            currency: currency,
            cartDetails: cartData,
            orderId: orderId,
            status: 'PENDING'
        });
        await newOrder.save();

        // OnePay yêu cầu số tiền nhân với 100 đối với VND
        let finalAmount = Math.round(parseFloat(amount) * 100).toString();
        // Loại bỏ dấu tiếng Việt và ký tự đặc biệt cho vpc_OrderInfo (Max 30 ký tự)
        let orderInfo = courseName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .substring(0, 30);

        const params = {
            vpc_Version: '2',
            vpc_Currency: 'VND',
            vpc_Command: 'pay',
            vpc_AccessCode: accessCode,
            vpc_Merchant: merchantId,
            vpc_Locale: 'vn',
            vpc_ReturnURL: `${myDomain}/return`,
            vpc_MerchTxnRef: orderId,
            vpc_OrderInfo: orderInfo,
            vpc_Amount: finalAmount,
            vpc_TicketNo: clientIp,
            vpc_CardList: 'QR,VIETQR'
        };

        // Tính toán chữ ký bảo mật
        params.vpc_SecureHash = generateSecureHash(params, hashCode);

        const paymentUrl = `${paygateUrl}?${querystring.stringify(params)}`;
        console.log(`Created payment URL for Order ${orderId}: ${paymentUrl}`);

        res.json({ paymentUrl });
    } catch (err) {
        console.error("❌ Lỗi tạo đơn thanh toán:", err);
        return res.status(500).json({ error: "Lỗi hệ thống khi tạo liên kết thanh toán" });
    }
});

// ==========================================
// 3. API TƯƠNG TÁC NGƯỜI DÙNG (/return)
// ==========================================
app.get('/return', async (req, res) => {
    console.log("➡️ Nhận callback /return từ OnePay:", req.query);
    const query = { ...req.query };
    const receivedHash = query.vpc_SecureHash;
    delete query.vpc_SecureHash;

    // Lọc các tham số bắt đầu bằng vpc_ hoặc user_ để tính lại chữ ký
    const filteredQuery = {};
    for (const key in query) {
        if (key.startsWith('vpc_') || key.startsWith('user_')) {
            filteredQuery[key] = query[key];
        }
    }
    
    const generatedHash = generateSecureHash(filteredQuery, hashCode);

    if (generatedHash === receivedHash) {
        const orderId = query.vpc_MerchTxnRef;

        if (query.vpc_TxnResponseCode === '0') {
            await processSuccessfulPayment(orderId, query);
            res.redirect(successRedirectUrl);
        } else {
            await Order.findOneAndUpdate({ orderId: orderId }, { status: 'FAILED', onepayResponse: query }).catch(e=>{});
            res.send(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                    <h2 style="color: #d9534f;">Giao dịch không thành công!</h2>
                    <p>Mã lỗi OnePay: <strong>${query.vpc_TxnResponseCode}</strong></p>
                    <p>Nếu bạn đã bị trừ tiền, vui lòng liên hệ bộ phận hỗ trợ của Khi Tam Therapy để được trợ giúp.</p>
                    <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #0275d8; color: white; text-decoration: none; border-radius: 5px;">Quay lại trang chủ</a>
                </div>
            `);
        }
    } else {
        console.error("❌ Xác thực chữ ký callback thất bại.");
        res.status(400).send('<h2>Xác thực chữ ký thất bại! Lỗi bảo mật.</h2>');
    }
});

// ==========================================
// 4. API GIAO TIẾP NGẦM IPN (OnePay gọi ngầm)
// ==========================================
app.get('/ipn', async (req, res) => {
    console.log("➡️ Nhận IPN từ OnePay:", req.query);
    const query = { ...req.query };
    const receivedHash = query.vpc_SecureHash;
    delete query.vpc_SecureHash;

    const filteredQuery = {};
    for (const key in query) {
        if (key.startsWith('vpc_') || key.startsWith('user_')) {
            filteredQuery[key] = query[key];
        }
    }
    
    const generatedHash = generateSecureHash(filteredQuery, hashCode);

    if (generatedHash === receivedHash) {
        const orderId = query.vpc_MerchTxnRef;
        if (query.vpc_TxnResponseCode === '0') {
            await processSuccessfulPayment(orderId, query);
            res.send('responsecode=1&desc=confirm-success');
        } else {
            await Order.findOneAndUpdate({ orderId: orderId }, { status: 'FAILED', onepayResponse: query }).catch(e=>{});
            res.send('responsecode=1&desc=confirm-success');
        }
    } else {
        console.error("❌ Xác thực chữ ký IPN thất bại.");
        res.send('responsecode=0&desc=invalid-hash');
    }
});

// ==========================================
// 5. API QUERY TRANSACTION STATUS (QueryDR)
// ==========================================
app.get('/api/query-payment/:orderId', async (req, res) => {
    const { orderId } = req.params;
    console.log(`🔍 Truy vấn trạng thái giao dịch (QueryDR) cho đơn hàng: ${orderId}`);

    try {
        const order = await Order.findOne({ orderId: orderId });
        if (!order) {
            return res.status(404).json({ error: "Không tìm thấy đơn hàng trong hệ thống" });
        }

        const params = {
            vpc_Version: '2',
            vpc_Command: 'queryDR',
            vpc_Merchant: merchantId,
            vpc_AccessCode: accessCode,
            vpc_MerchTxnRef: orderId,
            vpc_User: queryDrUser,
            vpc_Password: queryDrPassword
        };

        // Tính toán chữ ký bảo mật cho API QueryDR
        params.vpc_SecureHash = generateSecureHash(params, hashCode);

        // Gửi POST request dạng urlencoded tới cổng Query của OnePay
        const response = await axios.post(
            queryDrUrl,
            querystring.stringify(params),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // Phản hồi từ OnePay QueryDR thường ở dạng query string (ví dụ: vpc_TxnResponseCode=0&vpc_Message=Approved...)
        const responseData = querystring.parse(response.data);
        console.log(`📊 Kết quả QueryDR từ OnePay cho đơn ${orderId}:`, responseData);

        // Cập nhật trạng thái đơn hàng dựa trên phản hồi QueryDR
        const responseCode = responseData.vpc_TxnResponseCode;
        if (responseCode === '0') {
            await processSuccessfulPayment(orderId, responseData);
            return res.json({
                success: true,
                status: 'PAID',
                message: 'Thanh toán thành công (Xác nhận từ QueryDR)',
                onepayDetails: responseData
            });
        } else if (responseCode && responseCode !== '0' && responseCode !== '99') {
            // responseCode = 99 thường là giao dịch đang chờ/chưa thanh toán, không đổi thành FAILED ngay
            await Order.updateOne({ orderId: orderId }, { $set: { status: 'FAILED', onepayResponse: responseData } });
            return res.json({
                success: false,
                status: 'FAILED',
                message: `Giao dịch thất bại (Mã lỗi: ${responseCode})`,
                onepayDetails: responseData
            });
        }

        return res.json({
            success: false,
            status: order.status,
            message: responseData.vpc_Message || 'Giao dịch đang được xử lý hoặc chưa hoàn tất',
            onepayDetails: responseData
        });

    } catch (err) {
        console.error("❌ Lỗi khi gọi API QueryDR:", err.message);
        return res.status(500).json({ error: "Lỗi kết nối tới hệ thống OnePay để đối soát", details: err.message });
    }
});

// ==========================================
// 6. API LẤY DANH SÁCH ĐƠN HÀNG
// ==========================================
app.get('/api/orders', async (req, res) => {
    try {
        const { status } = req.query; // Có thể truyền ?status=PAID hoặc ?status=PENDING
        let filter = {};
        if (status) {
            filter.status = status.toUpperCase();
        }
        // Lấy danh sách đơn hàng, sắp xếp mới nhất lên đầu (createdAt: -1)
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        console.error("❌ Lỗi lấy danh sách đơn hàng:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách đơn hàng" });
    }
});

// ==========================================
// 7. API THU THẬP THÔNG TIN KHÁCH HÀNG (LEAD)
// ==========================================
app.post('/api/customers', async (req, res) => {
    try {
        const { fullName, email, phone, task } = req.body;
        
        if (!fullName || !email || !phone) {
            return res.status(400).json({ error: "Vui lòng cung cấp đủ Họ tên, Email và Số điện thoại" });
        }

        const newLead = new CustomerLead({
            fullName,
            email,
            phone,
            task
        });

        await newLead.save();
        res.json({ success: true, message: "Đã ghi nhận thông tin khách hàng thành công!", data: newLead });
    } catch (err) {
        console.error("❌ Lỗi lưu thông tin khách hàng:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lưu thông tin" });
    }
});

// ==========================================
// 8. API LẤY DANH SÁCH KHÁCH HÀNG (LEADS)
// ==========================================
app.get('/api/customers', async (req, res) => {
    try {
        const { task } = req.query; // Hỗ trợ lọc theo task (ví dụ: ?task=Đăng ký nhận bản tin)
        let filter = {};
        if (task) {
            // Lọc không phân biệt chữ hoa chữ thường
            filter.task = { $regex: task, $options: 'i' }; 
        }
        
        // Lấy danh sách khách hàng, mới nhất xếp trước
        const customers = await CustomerLead.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: customers.length, data: customers });
    } catch (err) {
        console.error("❌ Lỗi lấy danh sách khách hàng:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách khách hàng" });
    }
});

// ==========================================
// 9. API WEBHOOK MAILCHIMP
// ==========================================
app.route('/api/webhook/mailchimp')
    .get((req, res) => {
        // Mailchimp verify webhook khi setup
        res.status(200).send('Webhook Mailchimp is working!');
    })
    .post(async (req, res) => {
        try {
            const bodyStr = JSON.stringify(req.body, null, 2);
            console.log("➡️ Nhận webhook POST (Raw Body):", bodyStr);
            
            // Xử lý linh hoạt cấu trúc body: Make.com thường bọc tất cả payload vào một biến "data" to đùng bên ngoài!
            const actualType = req.body?.data?.type || req.body?.type || 'subscribe';
            
            // Tìm cục data chứa email thật sự
            let actualData = req.body;
            if (req.body?.data?.data) {
                actualData = req.body.data.data; // Trường hợp Make bọc 2 lớp data
            } else if (req.body?.data) {
                actualData = req.body.data; // Trường hợp Mailchimp chuẩn
            }
            
            if (actualType === 'subscribe') {
                let email = actualData.email; 
                
                // GIẢI PHÁP MẠNH NHẤT: Nếu vẫn không thấy email, dùng Regex bới tung toàn bộ Body để tìm email!
                if (!email) {
                    const matchEmail = bodyStr.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                    if (matchEmail) {
                        email = matchEmail[1];
                        console.log("🔥 CẢNH BÁO: Đã dùng Regex để móc email từ payload bị sai cấu trúc:", email);
                    }
                }

                if (!email) {
                    console.log("❌ Webhook bỏ qua vì Body trống trơn hoặc không có bất kỳ email nào!");
                    return res.status(200).send('No email found in completely empty body');
                }

                const merges = actualData.merges || {};
                const fname = merges.FNAME || actualData.firstName || actualData.fullName || '';
                const lname = merges.LNAME || actualData.lastName || '';
                const fullName = fname && lname ? `${fname} ${lname}`.trim() : (fname || email);
                
                // Tìm số điện thoại bằng Regex luôn nếu bị ẩn sâu
                let phone = merges.PHONE || actualData.phone || '';
                if (!phone) {
                    const matchPhone = bodyStr.match(/([0-9]{9,15})/);
                    if (matchPhone) phone = matchPhone[1];
                }

                let tags = actualData.tags || [];
                if (!Array.isArray(tags)) {
                    tags = [tags];
                }

                // Dùng findOneAndUpdate với upsert: true để ĐẢM BẢO CHẮC CHẮN LƯU VÀO DB
                const updatedDoc = await MailchimpData.findOneAndUpdate(
                    { email: email },
                    {
                        $set: {
                            fullName: fullName,
                            phone: phone
                        },
                        $addToSet: {
                            tags: { $each: tags } // Tránh trùng lặp tag
                        }
                    },
                    { new: true, upsert: true }
                );

                console.log(`✅ Đã LƯU THÀNH CÔNG khách hàng vào bảng MailchimpData: ${email}`);
            } else if (actualType === 'unsubscribe') {
                console.log(`ℹ️ User unsubscribed: ${actualData.email || req.body.email}`);
            }

            res.status(200).send('OK111');
        } catch (err) {
            console.error("❌ Lỗi xử lý webhook:", err);
            res.status(500).send("Lỗi xử lý webhook");
        }
    });

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
app.listen(port, () => {
    console.log(`🚀 Server đang chạy thành công tại: http://localhost:${port}`);
    console.log(`- Môi trường: PRODUCTION`);
    console.log(`- Merchant ID: ${merchantId}`);
    console.log(`- Paygate URL: ${paygateUrl}`);
});