import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '@/redux/slice/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth', 'Form', 'Entry', 'User', 'Stats',
    'AdminForms', 'AdminPlans', 'Settings',
    'RegistrationRequests', 'FieldTemplates', 'UserTemplates', 'MyEntries',
  ],
  endpoints: (builder) => ({

    // ── AUTH ──────────────────────────────────────────
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
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    // ── DASHBOARD ─────────────────────────────────────
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),

    // User: get assigned field templates
    getMyTemplates: builder.query({
      query: () => '/dashboard/my-templates',
      providesTags: ['UserTemplates'],
    }),

    // User: get submitted entries
    getMyEntries: builder.query({
      query: ({ page = 1, limit = 20 } = {}) =>
        `/dashboard/my-entries?page=${page}&limit=${limit}`,
      providesTags: ['MyEntries'],
    }),

    // User: export entries as xlsx
    exportMyEntries: builder.query({
      query: (formId) =>
        `/dashboard/my-entries/export${formId ? `?formId=${formId}` : ''}`,
    }),

    // ── FORMS ─────────────────────────────────────────
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

    // ── ENTRIES ───────────────────────────────────────
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
      invalidatesTags: (result, error, { formId }) => [
        { type: 'Entry', formId }, 'Stats', 'MyEntries',
      ],
    }),
    updateEntry: builder.mutation({
      query: ({ formId, entryId, data }) => ({
        url: `/forms/${formId}/entries/${entryId}`,
        method: 'PUT',
        body: { data },
      }),
      invalidatesTags: (result, error, { formId }) => [
        { type: 'Entry', formId }, 'MyEntries',
      ],
    }),
    deleteEntry: builder.mutation({
      query: ({ formId, entryId }) => ({
        url: `/forms/${formId}/entries/${entryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { formId }) => [
        { type: 'Entry', formId }, 'Stats', 'MyEntries',
      ],
    }),

    // ── ADMIN: REGISTRATION REQUESTS ──────────────────
    getRegistrationRequests: builder.query({
      query: ({ status, search = '' } = {}) => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (search) params.set('search', search);
        return `/admin/registration-requests?${params.toString()}`;
      },
      providesTags: ['RegistrationRequests'],
    }),
    approveRegistrationRequest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/registration-requests/${id}/approve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RegistrationRequests', 'User', 'Stats'],
    }),
    rejectRegistrationRequest: builder.mutation({
      query: ({ id, adminNote }) => ({
        url: `/admin/registration-requests/${id}/reject`,
        method: 'POST',
        body: { adminNote },
      }),
      invalidatesTags: ['RegistrationRequests'],
    }),
    deleteRegistrationRequest: builder.mutation({
      query: (id) => ({
        url: `/admin/registration-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RegistrationRequests'],
    }),

    // ── ADMIN: FIELD TEMPLATES ─────────────────────────
    getFieldTemplates: builder.query({
      query: () => '/admin/field-templates',
      providesTags: ['FieldTemplates'],
    }),
    getFieldTemplate: builder.query({
      query: (id) => `/admin/field-templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'FieldTemplates', id }],
    }),
    createFieldTemplate: builder.mutation({
      query: (data) => ({
        url: '/admin/field-templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FieldTemplates'],
    }),
    updateFieldTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/field-templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['FieldTemplates'],
    }),
    deleteFieldTemplate: builder.mutation({
      query: (id) => ({
        url: `/admin/field-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FieldTemplates'],
    }),
    assignFieldTemplate: builder.mutation({
      query: ({ userId, templateId }) => ({
        url: `/admin/users/${userId}/assign-template`,
        method: 'POST',
        body: { templateId },
      }),
      invalidatesTags: ['User', 'UserTemplates'],
    }),
    unassignFieldTemplate: builder.mutation({
      query: ({ userId, templateId }) => ({
        url: `/admin/users/${userId}/unassign-template/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'UserTemplates'],
    }),
    getUserTemplates: builder.query({
      query: (userId) => `/admin/users/${userId}/templates`,
      providesTags: (result, error, userId) => [{ type: 'UserTemplates', id: userId }],
    }),

    // ── ADMIN: PLANS ───────────────────────────────────
    getAdminPlans: builder.query({
      query: () => '/admin/plans',
      providesTags: ['Plan'],
    }),
    createAdminPlan: builder.mutation({
      query: (data) => ({
        url: '/admin/plans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Plan'],
    }),
    updateAdminPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/plans/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Plan'],
    }),
    deleteAdminPlan: builder.mutation({
      query: (id) => ({
        url: `/admin/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Plan'],
    }),

    // ── ADMIN: USERS ───────────────────────────────────
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

    // ── ADMIN: FORMS ───────────────────────────────────
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

    // ── ADMIN: PLANS ───────────────────────────────────
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

    // ── ADMIN: SETTINGS ────────────────────────────────
    getAnnouncement: builder.query({
      query: () => '/admin/settings/announcement',
      providesTags: ['Settings'],
    }),
    updateAnnouncement: builder.mutation({
      query: (data) => ({
        url: '/admin/settings/announcement',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings', 'Stats'],
    }),
  }),
});

export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  useGetMeQuery,
  // Dashboard
  useGetDashboardStatsQuery,
  useGetMyTemplatesQuery,
  useGetMyEntriesQuery,
  useExportMyEntriesQuery,
  // Forms
  useGetFormsQuery,
  useGetFormQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  // Entries
  useGetFormEntriesQuery,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,
  // Admin: Registration Requests
  useGetRegistrationRequestsQuery,
  useApproveRegistrationRequestMutation,
  useRejectRegistrationRequestMutation,
  useDeleteRegistrationRequestMutation,
  // Admin: Field Templates
  useGetFieldTemplatesQuery,
  useGetFieldTemplateQuery,
  useCreateFieldTemplateMutation,
  useUpdateFieldTemplateMutation,
  useDeleteFieldTemplateMutation,
  useAssignFieldTemplateMutation,
  useUnassignFieldTemplateMutation,
  useGetUserTemplatesQuery,
  // Admin: Users
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useUpdateUserDetailsMutation,
  // Admin: Forms
  useGetAdminFormsQuery,
  useDeleteAdminFormMutation,
  // Admin: Plans
  useGetAdminPlansQuery,
  useCreateAdminPlanMutation,
  useUpdateAdminPlanMutation,
  useDeleteAdminPlanMutation,
  // Admin: Settings
  useGetAnnouncementQuery,
  useUpdateAnnouncementMutation,
} = apiSlice;
