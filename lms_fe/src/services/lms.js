import api from '../utils/api';

const LMS_BASE = '/lms';

export const lmsApi = {
  getCourses: () => api.get(`${LMS_BASE}/courses`),
  getCourse: (id) => api.get(`${LMS_BASE}/courses/${id}`),
  getActivity: (id) => api.get(`${LMS_BASE}/activities/${id}`),
  getMyCourses: () => api.get(`${LMS_BASE}/my-courses`),
  getCourseProgress: (courseId) => api.get(`${LMS_BASE}/progress/${courseId}`),
  enrollCourse: (courseId) => api.post(`${LMS_BASE}/enroll/${courseId}`),
  updateActivityProgress: (courseId, activityId, payload) =>
    api.post(`${LMS_BASE}/progress/${courseId}/activities/${activityId}`, payload),
  getUpcomingMeetings: () => api.get(`${LMS_BASE}/zoom/meetings`),
  getMeeting: (id) => api.get(`${LMS_BASE}/zoom/meetings/${id}`),
  getZoomSignature: (meetingNumber, role = 0) =>
    api.post(`${LMS_BASE}/zoom/signature`, { meetingNumber, role }),
};

export const formatInstructorName = (instructor) => {
  if (!instructor) return 'Instructor';
  if (instructor.fullName) return instructor.fullName;
  return [instructor.firstname, instructor.lastname].filter(Boolean).join(' ') || 'Instructor';
};

export const formatPrice = (price) => {
  if (!price) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const flattenActivities = (sections = []) => {
  const items = [];
  sections.forEach((section) => {
    (section.activities || []).forEach((activity) => {
      items.push({ ...activity, sectionTitle: section.title });
    });
  });
  return items;
};

export const isActivityCompleted = (progress, activityId) => {
  if (!progress?.completedActivities) return false;
  return progress.completedActivities.some((id) => id.toString() === activityId.toString());
};

export const formatMeetingTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < -60) return 'Đã diễn ra';
  if (diffMin < 0) return 'Đang diễn ra';
  if (diffMin < 60) return `Bắt đầu sau ${diffMin} phút`;
  if (diffMin < 1440) return `Bắt đầu sau ${Math.round(diffMin / 60)} giờ`;
  return date.toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
