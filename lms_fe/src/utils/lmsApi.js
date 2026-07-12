import api from './api';

// --- Courses ---
export const getCourses = () => api.get('/lms/courses');
export const getCourseDetails = (id) => api.get(`/lms/courses/${id}`);
export const getActivity = (id) => api.get(`/lms/activities/${id}`);

// --- Enrollment & Progress ---
export const enrollCourse = (courseId) => api.post('/lms/enroll', { courseId });
export const getMyEnrollments = () => api.get('/lms/my-courses');
export const getProgress = (courseId) => api.get(`/lms/progress/${courseId}`);
export const markComplete = (courseId, activityId) =>
  api.post('/lms/progress/complete', { courseId, activityId });
export const saveVideoProgress = (courseId, activityId, watchTime, duration) => api.post('/lms/progress/video', { courseId, activityId, watchTime, duration });

// --- Zoom / Daily ---
export const getZoomSignature = (meetingNumber, role = 0) =>
  api.post('/lms/zoom/signature', { meetingNumber, role });
export const getZoomMeetings = () => api.get('/lms/zoom/meetings');
export const getMeetingByRoomName = (roomName) => api.get(`/lms/zoom/meetings/details/${roomName}`);
export const createZoomMeeting = (data) => api.post('/lms/admin/zoom-meetings', data);
export const deleteZoomMeeting = (id) => api.delete(`/lms/admin/zoom-meetings/${id}`);

// --- Recordings ---
export const getRecordings = (params) => api.get('/lms/recordings', { params });

// ==================== NEW APIs ====================

// Auth
export const register = (data) => api.post('/lms/auth/register', data);
export const forgotPassword = (email) => api.post('/lms/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/lms/auth/reset-password', data);
export const updateProfile = (data) => api.put('/lms/auth/profile', data);
export const changePassword = (data) => api.put('/lms/auth/change-password', data);

// Public
export const getCategories = () => api.get('/lms/categories');
export const getBanners = () => api.get('/lms/banners');
export const searchCourses = (params) => api.get('/lms/courses', { params });
export const validateCoupon = (data) => api.post('/lms/coupons/validate', data);

// Student
export const createOrder = (data) => api.post('/lms/orders', data);
export const getMyOrders = () => api.get('/lms/orders');
export const getWishlist = () => api.get('/lms/wishlist');
export const addToWishlist = (courseId) => api.post('/lms/wishlist', { courseId });
export const removeFromWishlist = (courseId) => api.delete(`/lms/wishlist/${courseId}`);
export const getQA = (params) => api.get('/lms/qa', { params });
export const createQuestion = (data) => api.post('/lms/qa', data);
export const addAnswer = (id, data) => api.post(`/lms/qa/${id}/answer`, data);
export const upvoteQuestion = (id) => api.put(`/lms/qa/${id}/upvote`);
export const getNotes = (params) => api.get('/lms/notes', { params });
export const createNote = (data) => api.post('/lms/notes', data);
export const updateNote = (id, data) => api.put(`/lms/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/lms/notes/${id}`);
export const getReviews = (courseId) => api.get('/lms/reviews', { params: { courseId } });
export const addReview = (data) => api.post('/lms/reviews', data);
export const getCertificate = (courseId) => api.get(`/lms/certificate/${courseId}`);
export const getNotifications = () => api.get('/lms/notifications');
export const markNotificationRead = (id) => api.put(`/lms/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/lms/notifications/read-all');
export const getQuiz = (activityId) => api.get(`/lms/quiz/${activityId}`);
export const startQuizAttempt = (activityId) => api.post(`/lms/quiz/${activityId}/attempt`);
export const submitQuizAttempt = (attemptId, data) => api.post(`/lms/quiz/attempt/${attemptId}/submit`, data);
export const getMyAttempts = (activityId) => api.get(`/lms/quiz/${activityId}/attempts`);

// Instructor
export const getInstructorStats = () => api.get('/lms/instructor/stats');
export const getInstructorEnrollments = (params) => api.get('/lms/instructor/enrollments', { params });
export const getCourseAnalytics = (courseId) => api.get(`/lms/instructor/courses/${courseId}/analytics`);
export const uploadVideo = (formData, onProgress) => api.post('/lms/instructor/upload-video', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: onProgress
});
export const uploadDocument = (formData, onProgress) => api.post('/lms/instructor/upload-document', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: onProgress
});

// Instructor Course Management
export const getInstructorCourses = () => api.get('/lms/admin/courses');
export const createCourse = (data) => api.post('/lms/admin/courses', data);
export const updateCourse = (id, data) => api.put(`/lms/admin/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/lms/admin/courses/${id}`);
export const submitCourseForApproval = (id) => api.put(`/lms/admin/courses/${id}/approve`);
export const createSection = (courseId, data) => api.post(`/lms/admin/sections`, { course: courseId, ...data });
export const updateSection = (sectionId, data) => api.put(`/lms/admin/sections/${sectionId}`, data);
export const deleteSection = (sectionId) => api.delete(`/lms/admin/sections/${sectionId}`);
export const createActivity = (sectionId, data) => api.post(`/lms/admin/activities`, { section: sectionId, ...data });
export const updateActivity = (activityId, data) => api.put(`/lms/admin/activities/${activityId}`, data);
export const deleteActivity = (activityId) => api.delete(`/lms/admin/activities/${activityId}`);

// Admin
export const adminGetUsers = (params) => api.get('/lms/admin/users', { params });
export const adminUpdateUser = (id, data) => api.put(`/lms/admin/users/${id}`, data);
export const adminDeleteUser = (id) => api.delete(`/lms/admin/users/${id}`);
export const adminGetAllCourses = (params) => api.get('/lms/admin/courses', { params });
export const adminApproveCourse = (id) => api.put(`/lms/admin/courses/${id}/approve`);
export const adminRejectCourse = (id, data) => api.put(`/lms/admin/courses/${id}/reject`, data);
export const adminGetCategories = () => api.get('/lms/admin/categories');
export const adminCreateCategory = (data) => api.post('/lms/admin/categories', data);
export const adminUpdateCategory = (id, data) => api.put(`/lms/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/lms/admin/categories/${id}`);
export const adminGetCoupons = () => api.get('/lms/admin/coupons');
export const adminCreateCoupon = (data) => api.post('/lms/admin/coupons', data);
export const adminUpdateCoupon = (id, data) => api.put(`/lms/admin/coupons/${id}`, data);
export const adminDeleteCoupon = (id) => api.delete(`/lms/admin/coupons/${id}`);
export const adminGetOrders = (params) => api.get('/lms/admin/orders', { params });
export const adminRefundOrder = (id) => api.put(`/lms/admin/orders/${id}/refund`);
export const adminGetBanners = () => api.get('/lms/admin/banners');
export const adminCreateBanner = (data) => api.post('/lms/admin/banners', data);
export const adminUpdateBanner = (id, data) => api.put(`/lms/admin/banners/${id}`, data);
export const adminDeleteBanner = (id) => api.delete(`/lms/admin/banners/${id}`);
export const adminGetStats = () => api.get('/lms/admin/stats');
export const adminGetCertificates = () => api.get('/lms/admin/certificates');
export const adminCreateQuiz = (data) => api.post('/lms/admin/quizzes', data);
export const adminUpdateQuiz = (id, data) => api.put(`/lms/admin/quizzes/${id}`, data);
export const adminGetQuiz = (id) => api.get(`/lms/admin/quizzes/${id}`);
