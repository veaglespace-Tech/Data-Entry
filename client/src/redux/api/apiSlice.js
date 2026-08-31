import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '@/redux/slice/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = getState().auth.token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If 401 Unauthorized, automatically log out
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Form', 'Entry', 'User', 'Stats', 'AdminForms', 'AdminTransactions', 'AdminPlans'],
  endpoints: (builder) => ({
    // Endpoints will be injected from other files, but we can define some here as well.
    
    // -- AUTH ENDPOINTS --
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: userData,
      }),
    }),

    // -- DASHBOARD ENDPOINTS --
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),

    // -- FORMS ENDPOINTS --
    getForms: builder.query({
      query: () => '/forms',
      providesTags: ['Form'],
    }),
    getForm: builder.query({
      query: (id) => `/forms/${id}`,
      providesTags: (result, error, id) => [{ type: 'Form', id }],
    }),
    createForm: builder.mutation({
      query: (formData) => ({
        url: '/forms',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Form', 'Stats'],
    }),
    updateForm: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `/forms/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Form', id }, 'Form'],
    }),
    deleteForm: builder.mutation({
      query: (id) => ({
        url: `/forms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Form', 'Stats'],
    }),

    // -- ENTRIES ENDPOINTS --
    getFormEntries: builder.query({
      query: ({ formId, page = 1, search = '' }) => 
        `/forms/${formId}/entries?page=${page}&limit=10${search ? `&search=${search}` : ''}`,
      providesTags: (result, error, { formId }) => [{ type: 'Entry', formId }],
    }),
    createEntry: builder.mutation({
      query: ({ formId, data }) => ({
        url: `/forms/${formId}/entries`,
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: (result, error, { formId }) => [{ type: 'Entry', formId }, 'Stats'],
    }),
    updateEntry: builder.mutation({
      query: ({ formId, entryId, data }) => ({
        url: `/forms/${formId}/entries/${entryId}`,
        method: 'PUT',
        body: { data },
      }),
      invalidatesTags: (result, error, { formId }) => [{ type: 'Entry', formId }],
    }),
    deleteEntry: builder.mutation({
      query: ({ formId, entryId }) => ({
        url: `/forms/${formId}/entries/${entryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { formId }) => [{ type: 'Entry', formId }, 'Stats'],
    }),

    // -- ADMIN USER ENDPOINTS --
    getUsers: builder.query({
      query: (search = '') => `/admin/users${search ? `?search=${search}` : ''}`,
      providesTags: ['User'],
    }),
    getUserDetails: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    updateUserDetails: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // -- PAYMENT ENDPOINTS --
    initiatePayment: builder.mutation({
      query: (paymentData) => ({
        url: '/payment/hash',
        method: 'POST',
        body: paymentData,
      }),
    }),
    activateFreePlan: builder.mutation({
      query: (data) => ({
        url: '/payment/free',
        method: 'POST',
        body: data,
      }),
    }),
    
    // -- PLAN ENDPOINTS --
    getPlans: builder.query({
      query: () => '/plans',
    }),
    getPlan: builder.query({
      query: (id) => `/plans/${id}`,
    }),

    // -- NEW ADMIN ENDPOINTS --
    getAdminForms: builder.query({
      query: (search = '') => `/admin/forms?search=${search}`,
      providesTags: ['AdminForms'],
    }),
    deleteAdminForm: builder.mutation({
      query: (id) => ({
        url: `/admin/forms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminForms', 'Stats'],
    }),
    getAdminTransactions: builder.query({
      query: () => '/admin/transactions',
      providesTags: ['AdminTransactions'],
    }),
    getAdminPlans: builder.query({
      query: () => '/admin/plans',
      providesTags: ['AdminPlans'],
    }),
    createAdminPlan: builder.mutation({
      query: (data) => ({
        url: '/admin/plans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdminPlans'],
    }),
    updateAdminPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/plans/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AdminPlans'],
    }),
    deleteAdminPlan: builder.mutation({
      query: (id) => ({
        url: `/admin/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminPlans'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  useGetDashboardStatsQuery,
  useGetFormsQuery,
  useGetFormQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  useGetFormEntriesQuery,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useUpdateUserDetailsMutation,
  useInitiatePaymentMutation,
  useActivateFreePlanMutation,
  useGetPlansQuery,
  useGetPlanQuery,
  useGetAdminFormsQuery,
  useDeleteAdminFormMutation,
  useGetAdminTransactionsQuery,
  useGetAdminPlansQuery,
  useCreateAdminPlanMutation,
  useUpdateAdminPlanMutation,
  useDeleteAdminPlanMutation,
} = apiSlice;
