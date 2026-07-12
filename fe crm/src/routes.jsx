import React, {
  Fragment,
  lazy,
  Suspense,
  useEffect,
  useState
} from 'react';

import {
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import Loader from './components/Loader/Loader';
import { CHECKSTATUS } from './config/api';
import { BASE_URL } from './config/constant';
import AdminLayout from './layouts/AdminLayout';

const logout = () => {
  localStorage.clear(); // Xóa tất cả dữ liệu trong localStorage
  window.location.href = '/login'; // Điều hướng về trang login
};

// AuthGuard component để kiểm tra token trong localStorage
const AuthGuard = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const [isValid, setIsValid] = useState(null); // Lưu trạng thái token có hợp lệ không
  // console.log(token);
  // console.log(role);
  // console.log(userId);
  useEffect(() => {
    let isMounted = true; // Biến để đảm bảo không cập nhật state khi component unmount

    const validateUserStatus = async () => {
      if (token && userId) {
        try {
          const response = await fetch(`${CHECKSTATUS}/${userId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const data = await response.json();

          if (isMounted) {
            // Kiểm tra xem component còn đang mount không
            if (data.status === 'success' && data.data.status === 'active') {
              setIsValid(true);
            } else {
              setIsValid(false);
            }
          }
        } catch (error) {
          console.error('Error fetching user status:', error);
          if (isMounted) {
            setIsValid(false);
          }
        }
      } else {
        if (isMounted) {
          setIsValid(false);
        }
      }
    };

    validateUserStatus();

    return () => {
      isMounted = false; // Cleanup, không cập nhật state nếu component đã unmount
    };
  }, [token, userId]);

  if (isValid === null) {
    // Nếu vẫn đang kiểm tra, có thể hiển thị một màn hình loader hoặc không làm gì
    return <div>Loading...</div>;
  }

  if (!isValid) {
    logout();
    // Nếu token không hợp lệ hoặc người dùng không có trạng thái "active"
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Nếu vai trò không được phép, điều hướng đến trang dashboard
    return <Navigate to="/app/dashboard/home" />;
  }

  return children;
};

// renderRoutes function để render tất cả các routes
export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        // Không áp dụng AuthGuard cho route đăng nhập
        const isLoginRoute = route.path === '/login' || route.path === '/auth/signin-1' || route.path === '/auth/signup-1' || route.path === '/eliteMastermind' || route.path === '/landing-lot-giay' || route.path === '/tra-cuu-chung-nhan';

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>
                  {route.routes ? (
                    renderRoutes(route.routes) // Recursively render nested routes
                  ) : // Nếu là route login, không cần , ngược lại cần AuthGuard
                  isLoginRoute ? (
                    <Element />
                  ) : (
                    <AuthGuard>
                      <Element />
                    </AuthGuard>
                  )}
                </Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);
const routes = [
  {
    exact: 'true',
    path: '/login',
    element: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    exact: 'true',
    path: '/auth/signin-1',
    element: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    exact: 'true',
    path: '/auth/signup-1',
    element: lazy(() => import('./views/auth/signup/SignUp1'))
  },
  {
    exact: 'true',
    path: '/eliteMastermind',
    element: lazy(() => import('./views/eliteMastermind/eliteMastermindPage'))
  },
  {
    exact: 'true',
    path: '/eliteMastermindsget',
    element: lazy(() => import('./views/eliteMastermind/getmasters'))
  },
  {
    exact: 'true',
    path: '/landing-lot-giay',
    element: lazy(() => import('./views/test/TestPage'))
  },
  {
    exact: 'true',
    path: '/tra-cuu-chung-nhan',
    element: lazy(() => import('./views/Certificate/CertificateLookup'))
  },
  {
    path: '*',
    layout: AdminLayout,
    routes: [
      {
        exact: 'true',
        path: '/app/dashboard/home',
        element: lazy(() => import('./views/workstreamPage/WorkstreamPage'))
      },
      {
        exact: 'true',
        path: '/app/dashboard/default',
        element: lazy(() => import('./views/workstreamPage/WorkstreamPage'))
      },
      {
        exact: 'true',
        path: '/basic/button',
        element: lazy(() => import('./views/ui-elements/basic/BasicButton')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/basic/salet_kit',
        element: lazy(() => import('./views/SaleKit/SaleKitForm')),
        guard: ({ children }) => (
          <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader', 'KTT User', 'KTT Partner']}>{children}</AuthGuard>
        )
      },
      {
        exact: 'true',
        path: '/basic/affiliate',
        element: lazy(() => import('./views/affiliate/affiliate')),
        guard: ({ children }) => (
          <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader', 'KTT User', 'KTT Partner']}>{children}</AuthGuard>
        )
      },
      {
        exact: 'true',
        path: '/app/congvieckpi',
        element: lazy(() => import('./views/jobkpi/UserKPIReport')),
        guard: ({ children }) => (
          <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader', 'KTT User', 'KTT Partner']}>{children}</AuthGuard>
        )
      },
      {
        exact: 'true',
        path: '/basic/badges',
        element: lazy(() => import('./views/report/reportstudent')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/basic/breadcrumb-paging',
        element: lazy(() => import('./views/ui-elements/basic/BasicBreadcrumb')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/basic/collapse',
        element: lazy(() => import('./views/ui-elements/basic/BasicCollapse')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/basic/tabs-pills',
        element: lazy(() => import('./views/ui-elements/basic/BasicTabsPills')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/get-products',
        element: lazy(() => import('./views/products/ProductList')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/basic/typography',
        element: lazy(() => import('./views/ui-elements/basic/BasicTypography')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/basic/customers',
        element: lazy(() => import('./views/custormers/Cutstomer')),
        guard: ({ children }) => (
          <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader', 'KTT User', 'KTT Partner']}>{children}</AuthGuard>
        )
      },
      {
        exact: 'true',
        path: '/basic/createorder',
        element: lazy(() => import('./views/custormers/Createorder')),
        guard: ({ children }) => (
          <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader', 'KTT User', 'KTT Partner']}>{children}</AuthGuard>
        )
      },
      {
        exact: 'true',
        path: '/basic/customerslocation',
        element: lazy(() => import('./views/report/Index')),
        guard: ({ children }) => (
          <AuthGuard
            allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader', 'Aca_Specialis', 'Cust_service', 'Hub Specialist']}
          >
            {children}
          </AuthGuard>
        )
      },
      {
        exact: 'true',
        path: '/get-userkpi',
        element: lazy(() => import('./views/userApproval/Index')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/app/portal-data',
        element: lazy(() => import('./views/portal/PortalDataView')),
        guard: ({ children }) => (
          <AuthGuard allowedRoles={['Admin', 'Aca_Specialis', 'Cust_service', 'Hub Specialist']}>{children}</AuthGuard>
        )
      },
      {
        exact: 'true',
        path: '/forms/form-basic',
        element: lazy(() => import('./views/forms/FormsElements')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/tables/bootstrap',
        element: lazy(() => import('./views/tables/BootstrapTable')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/charts/nvd3',
        element: lazy(() => import('./views/charts/nvd3-chart')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin', 'KTT Sale Manager', 'KTT Sale Team Leader']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/maps/google-map',
        element: lazy(() => import('./views/maps/GoogleMaps')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/forms/statff',
        element: lazy(() => import('./views/staff/staff')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/forms/ketoandon',
        element: lazy(() => import('./views/accountant/Accountant')),
        guard: ({ children }) => <AuthGuard allowedRoles={['Admin', 'Accountant']}>{children}</AuthGuard>
      },
      {
        exact: 'true',
        path: '/sample-page',
        element: lazy(() => import('./views/extra/SamplePage'))
      },
      {
        path: '*',
        exact: 'true',
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  }
];

export default routes;
