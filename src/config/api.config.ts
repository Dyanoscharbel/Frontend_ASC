export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/request-otp',
    },
  users: {
    profile: '/users/profile',
    password: '/users/password',
    transactions: {
      list: '/users/transactions',
      detail: (id: string) => `/users/transactions/${id}`,
      summary: '/users/transactions/summary',
      monthlyGains: '/users/transactions/monthly-gains',
    },
  },
  sponsorship: {
    levels: '/sponsorship/levels',
    updateLevel: '/sponsorship/update-level',
  },
  tournaments: {
    list: '/tournaments',
    detail: (id: string) => `/tournaments/${id}`,
    register: (id: string) => `/tournaments/${id}/register`,
    userTournaments: '/tournaments/user/tournaments',
  },
  admin: {
    users: '/admin/users',
    tournaments: '/admin/tournaments',
    communications: {
      list: '/admin/communications',
      detail: (id: string) => `/admin/communications/${id}`,
      create: '/admin/communications',
      update: (id: string) => `/admin/communications/${id}`,
      delete: (id: string) => `/admin/communications/${id}`,
      send: (id: string) => `/admin/communications/${id}/send`,
    }
  },
}; 