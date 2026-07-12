import axios from 'axios';

const API_BASE_URL = 'https://www.system.crmkhitam.com/api/v1';

class PortalService {
  // Lấy dữ liệu portal theo ngày contact
  static async getPortalsByContactDate(params) {
    try {
      const requestParams = {
        userId: params.userId,
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page || 1,
        limit: params.limit || 20
      };

      // Thêm source parameter nếu có
      if (params.source) {
        requestParams.source = params.source;
      }

      // Thêm search parameter nếu có
      if (params.search) {
        requestParams.search = params.search;
      }

      const response = await axios.get(`${API_BASE_URL}/portal/portals-by-contact-date`, {
        params: requestParams
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê tổng quan
  static async getPortalStats(params) {
    try {
      const requestParams = {
        userId: params.userId,
        startDate: params.startDate,
        endDate: params.endDate,
        page: 1,
        limit: 1000 // Lấy tất cả để thống kê
      };

      // Thêm search parameter nếu có
      if (params.search) {
        requestParams.search = params.search;
      }

      const response = await axios.get(`${API_BASE_URL}/portal/portals-by-contact-date`, {
        params: requestParams
      });

      const data = response.data.data || [];

      // Tính toán thống kê
      let totalCount = 0;
      let hubPortalCount = 0;
      let academyPortalCount = 0;
      let totalRevenue = 0;

      data.forEach((item) => {
        if (item.products && item.products.length > 0) {
          // Nếu có products array
          item.products.forEach((product) => {
            totalCount++;
            if (product.source === 'HubPortal') {
              hubPortalCount++;
            } else if (product.source === 'AcademyPortal') {
              academyPortalCount++;
            }
          });
        } else {
          // Nếu không có products array
          totalCount++;
          if (item.source === 'HubPortal') {
            hubPortalCount++;
          } else if (item.source === 'AcademyPortal') {
            academyPortalCount++;
          }
        }
      });

      const stats = {
        total: totalCount,
        hubPortal: hubPortalCount,
        academyPortal: academyPortalCount,
        totalRevenue: totalRevenue
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }
}

export default PortalService;
