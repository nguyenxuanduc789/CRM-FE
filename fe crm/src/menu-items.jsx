const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Trang Chủ',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'DASHBOARD',
          type: 'item',
          icon: 'feather icon-home',
          url: '/app/dashboard/home'
        }
      ]
    },
    {
      id: 'congvieckpi',
      title: 'Công việc & KPI',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'cvkpi',
          title: 'Công việc & KPI',
          type: 'item',
          icon: 'feather icon-home',
          url: '/app/congvieckpi'
        }
      ]
    },
    {
      id: 'portaldata',
      title: 'Portal Data ',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'portaldata',
          title: 'Portal Data ',
          type: 'item',
          icon: 'feather icon-database',
          url: '/app/portal-data'
        }
      ]
    },
    {
      id: 'cus-tomers',
      title: 'Danh mục Khách Hàng',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'pineline',
          title: ' Đơn hàng ',
          type: 'item',
          icon: 'icon-ui',
          url: '/basic/createorder'
        },
        {
          id: 'customers',
          title: 'Khách hàng',
          type: 'item',
          icon: 'icon-ui',
          url: '/basic/customers'
        },
        {
          id: 'sale_kit',
          title: 'Tài liệu sale',
          type: 'item',
          icon: 'icon-ui',
          url: '/basic/salet_kit'
        },
        {
          id: 'affiliate',
          title: 'Affiliate',
          type: 'item',
          icon: 'icon-ui',
          url: '/basic/affiliate'
        }
      ]
    },
    {
      id: 'customers',
      title: 'Báo cáo',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'component',
          title: 'Báo cáo',
          type: 'collapse',
          icon: 'feather icon-box',
          children: [
            {
              id: 'button',
              title: 'Báo cáo tổng',
              type: 'item',
              url: '/basic/customerslocation'
            },
            // {
            //   id: 'breadcrumb',
            //   title: 'Báo cáo doanh số ',
            //   type: 'item',
            //   url: '/basic/breadcrumb-paging'
            // },
            {
              id: 'badges',
              title: 'Báo cáo  khách hàng',
              type: 'item',
              url: '/basic/badges'
            }
            // {
            //   id: 'breadcrumb',
            //   title: 'Quản lý Team',
            //   type: 'item',
            //   url: '/basic/breadcrumb-paging'
            // },
            // {
            //   id: 'collapse',
            //   title: 'KTT Sale Team Leader',
            //   type: 'item',
            //   url: '/basic/collapse'
            // },
            // {
            //   id: 'tabs-pills',
            //   title: 'Đối tác',
            //   type: 'item',
            //   url: '/basic/tabs-pills'
            // },
            // {
            //   id: 'tabs-pills',
            //   title: 'KPI',
            //   type: 'item',
            //   url: '/basic/tabs-pills'
            // },
            // {
            //   id: 'typography',
            //   title: 'Quản lý dịch vụ, sản phẩm, khoá học',
            //   type: 'item',
            //   url: '/basic/typography'
            // }
          ]
        }
      ]
    },
    {
      id: 'taichinh',
      title: 'Tài chính kế toán',
      type: 'group',
      icon: 'icon-group',
      children: [
        {
          id: 'taichinh',
          title: 'Tài chính',
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
              id: 'sms-marketing',
              title: 'Báo cáo phiếu thu & phiếu chi',
              type: 'item',
              icon: 'feather icon-file-text',
              url: '/sms-marketing'
            }
          ]
        }
      ]
    },
    {
      id: 'quantrihethong',
      title: 'Quản trị hệ thống',
      type: 'group',
      icon: 'icon-group',
      children: [
        {
          id: 'quantrihethong',
          title: 'Quản trị hệ thống',
          type: 'collapse',
          icon: 'feather icon-users',
          children: [
            {
              id: 'menu-level-2.2',
              title: 'Quản lý Team',
              type: 'item',
              icon: 'feather icon-file-text',
              url: '/get-userkpi'
            },
            {
              id: 'sms-marketing',
              title: 'Quản lý sản phẩm ',
              type: 'item',
              icon: 'feather icon-file-text',
              url: '/get-products'
            }
          ]
        }
      ]
    },
    // {
    //   id: 'quanlinhanvien',
    //   title: 'Quản lý nhân viên & chấm công',
    //   type: 'group',
    //   icon: 'icon-group',
    //   children: [
    //     {
    //       id: 'quanlinhanvien',
    //       title: 'Quản lý nhân viên ',
    //       type: 'collapse',
    //       icon: 'feather icon-users',
    //       children: [
    //         {
    //           id: 'email-marketing',
    //           title: 'Quản lý nhân viên',
    //           type: 'item',
    //           icon: 'feather icon-file-text',
    //           url: '/forms/statff'
    //         },
    //         {
    //           id: 'charts',
    //           title: 'Công việc & KPI',
    //           type: 'item',
    //           url: '/charts/nvd3'
    //         },
    //         {
    //           id: 'sms-marketing',
    //           title: 'Chấm công',
    //           type: 'item',
    //           icon: 'feather icon-file-text',
    //           url: '/sms-marketing'
    //         }
    //       ]
    //     }
    //   ]
    // },
    {
      id: 'booking-calendar',
      title: 'Quản lý lịch hẹn & booking',
      type: 'group',
      icon: 'icon-calendar',
      children: [
        {
          id: 'booking-calendar',
          title: 'Booking Calendar',
          type: 'collapse',
          icon: 'feather icon-users',
          children: [
            {
              id: 'calendar',
              title: 'Calendar',
              type: 'item',
              url: '/booking/calendar'
            },
            {
              id: 'booking-list',
              title: 'Booking List',
              type: 'item',
              url: '/booking/list'
            },
            {
              id: 'work-schedule',
              title: 'Work Schedule',
              type: 'item',
              url: '/booking/work-schedule'
            }
          ]
        }
      ]
    },
    {
      id: 'ui-forms',
      title: 'CSKH',
      type: 'group',
      icon: 'icon-group',
      children: [
        {
          id: 'customer care',
          title: 'Chăm sóc khách hàng',
          type: 'collapse',
          icon: 'feather icon-users',
          children: [
            {
              id: 'email-marketing',
              title: 'Email Marketing',
              type: 'item',
              icon: 'feather icon-mail',
              url: '/forms/email-marketing'
            },
            {
              id: 'sms-marketing',
              title: 'SMS Marketing',
              type: 'item',
              icon: 'feather icon-message-circle',
              url: '/sms-marketing'
            }
          ]
        }
      ]
    }
    // {
    //   id: 'pages',
    //   title: 'Pages',
    //   type: 'group',
    //   icon: 'icon-pages',
    //   children: [
    //     {
    //       id: 'auth',
    //       title: 'Authentication',
    //       type: 'collapse',
    //       icon: 'feather icon-lock',
    //       badge: {
    //         title: 'New',
    //         type: 'label-danger'
    //       },
    //       children: [
    //         {
    //           id: 'signup-1',
    //           title: 'Sign up',
    //           type: 'item',
    //           url: '/auth/signup-1',
    //           target: true,
    //           breadcrumbs: false
    //         },
    //         {
    //           id: 'signin-1',
    //           title: 'Sign in',
    //           type: 'item',
    //           url: '/auth/signin-1',
    //           target: true,
    //           breadcrumbs: false
    //         }
    //       ]
    //     },
    //     {
    //       id: 'sample-page',
    //       title: 'Sample Page',
    //       type: 'item',
    //       url: '/sample-page',
    //       classes: 'nav-item',
    //       icon: 'feather icon-sidebar'
    //     },
    //     {
    //       id: 'documentation',
    //       title: 'Documentation',
    //       type: 'item',
    //       icon: 'feather icon-book',
    //       classes: 'nav-item',
    //       url: 'https://codedthemes.gitbook.io/datta/',
    //       target: true,
    //       external: true
    //     },
    //     {
    //       id: 'menu-level',
    //       title: 'Menu Levels',
    //       type: 'collapse',
    //       icon: 'feather icon-menu',
    //       children: [
    //         {
    //           id: 'menu-level-1.1',
    //           title: 'Menu Level 1.1',
    //           type: 'item',
    //           url: '#!'
    //         },
    //         {
    //           id: 'menu-level-1.2',
    //           title: 'Menu Level 2.2',
    //           type: 'collapse',
    //           children: [
    //             {
    //               id: 'menu-level-2.1',
    //               title: 'Menu Level 2.1',
    //               type: 'item',
    //               url: '#'
    //             },
    //             {
    //               id: 'menu-level-2.2',
    //               title: 'Menu Level 2.2',
    //               type: 'collapse',
    //               children: [
    //                 {
    //                   id: 'menu-level-3.1',
    //                   title: 'Menu Level 3.1',
    //                   type: 'item',
    //                   url: '#'
    //                 },
    //                 {
    //                   id: 'menu-level-3.2',
    //                   title: 'Menu Level 3.2',
    //                   type: 'item',
    //                   url: '#'
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       id: 'disabled-menu',
    //       title: 'Disabled Menu',
    //       type: 'item',
    //       url: '#',
    //       classes: 'nav-item disabled',
    //       icon: 'feather icon-power'
    //     }
    //   ]
    // }
  ]
};

export default menuItems;
