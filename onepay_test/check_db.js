require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const mailchimpDataSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    tags: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});

const MailchimpData = mongoose.model('MailchimpData', mailchimpDataSchema);

async function checkDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Đã kết nối MongoDB để kiểm tra...');
        
        const data = await MailchimpData.find().sort({ createdAt: -1 }).limit(5);
        if (data.length === 0) {
            console.log('Chưa có dữ liệu nào trong bảng MailchimpData.');
        } else {
            console.log(`Tìm thấy ${data.length} bản ghi gần nhất:`);
            console.log(JSON.stringify(data, null, 2));
        }
        
        mongoose.disconnect();
    } catch (err) {
        console.error('Lỗi kiểm tra DB:', err);
    }
}

checkDB();
