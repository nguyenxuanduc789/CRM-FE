// Function to generate menu items based on language translation (t)
export const getMenuItems = (t) => {
  return {
    items: [
      {
        id: 'navigation',
        title: 'DASHBOARD',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'dashboard',
            title: t.dashboard ? t.dashboard.toUpperCase() : 'DASHBOARD',
            type: 'item',
            icon: 'feather icon-home',
            url: '/app/dashboard/home'
          }
        ]
      },
      {
        id: 'customers_report',
        title: 'BÁO CÁO',
        type: 'group',
        icon: 'icon-ui',
        children: [
          {
            id: 'component',
            title: t.reports || 'Báo cáo',
            type: 'collapse',
            icon: 'feather icon-box',
            children: [
              {
                id: 'button',
                title: t.reportSummary || 'Báo cáo tổng',
                type: 'item',
                url: '/basic/customerslocation'
              },
              {
                id: 'badges',
                title: t.customerReport || 'Báo cáo khách hàng',
                type: 'item',
                url: '/basic/badges'
              }
            ]
          }
        ]
      },
      {
        id: 'cus-tomers',
        title: 'ĐƠN HÀNG & KHÁCH HÀNG',
        type: 'group',
        icon: 'icon-ui',
        children: [
          {
            id: 'pineline',
            title: t.orderList || 'Đơn hàng',
            type: 'item',
            icon: 'icon-ui',
            url: '/basic/createorder'
          },
          {
            id: 'customers',
            title: t.customerList || 'Khách hàng',
            type: 'item',
            icon: 'icon-ui',
            url: '/basic/customers'
          },
          {
            id: 'sale_kit',
            title: t.salesPipeline || 'Tài liệu sale',
            type: 'item',
            icon: 'icon-ui',
            url: '/basic/salet_kit'
          },
          {
            id: 'affiliate',
            title: t.affiliate || 'Affiliate',
            type: 'item',
            icon: 'icon-ui',
            url: '/basic/affiliate'
          }
        ]
      },
      {
        id: 'quantri_hethong_group',
        title: 'QUẢN TRỊ HỆ THỐNG',
        type: 'group',
        icon: 'icon-group',
        children: [
          {
            id: 'cvkpi',
            title: t.workAndKPI || 'Công việc & KPI',
            type: 'item',
            icon: 'feather icon-check-square',
            url: '/app/congvieckpi'
          },
          {
            id: 'taichinh',
            title: t.accountingManagement || 'Tài chính kế toán',
            type: 'collapse',
            icon: 'feather icon-credit-card',
            children: [
              {
                id: 'email-marketing',
                title: 'Xác nhận đơn hàng', 
                type: 'item',
                icon: 'feather icon-file-text',
                url: '/forms/ketoandon'
              },
              {
                id: 'sms-marketing-finance',
                title: 'Báo cáo phiếu thu & phiếu chi', 
                type: 'item',
                icon: 'feather icon-file-text',
                url: '/sms-marketing'
              }
            ]
          },
          {
            id: 'quantrihethong',
            title: t.systemManagement || 'Quản trị hệ thống',
            type: 'collapse',
            icon: 'feather icon-users',
            children: [
              {
                id: 'menu-level-2.2',
                title: t.userApproval || 'Quản lý Team',
                type: 'item',
                icon: 'feather icon-file-text',
                url: '/get-userkpi'
              },
              {
                id: 'sms-marketing-system',
                title: 'Quản lý sản phẩm',
                type: 'item',
                icon: 'feather icon-file-text',
                url: '/get-products'
              }
            ]
          },
          {
            id: 'portaldata',
            title: t.portalData || 'DATA PORTAL',
            type: 'item',
            icon: 'feather icon-database',
            url: '/app/portal-data'
          }
        ]
      }
    ]
  };
};

// Vẫn export default menuItems rỗng để các trang chưa được sửa vẫn chạy bình thường (fallback)
const menuItems = { items: [] };
export default menuItems;
