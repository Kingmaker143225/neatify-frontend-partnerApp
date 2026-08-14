// import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_URL = (
//   process.env.EXPO_PUBLIC_API_URL || ""
// ).replace(/\/$/, "");

// if (!API_URL) {
//   console.warn(
//     "EXPO_PUBLIC_API_URL is not configured."
//   );
// }


// // =========================================================
// // TOKEN STORAGE
// // =========================================================

// const ACCESS_TOKEN_KEY = "@neatify_access_token";
// const REFRESH_TOKEN_KEY = "@neatify_refresh_token";


// // =========================================================
// // TOKEN HELPERS
// // =========================================================

// export async function saveAuthTokens(
//   accessToken: string,
//   refreshToken: string,
// ) {
//   await AsyncStorage.multiSet([
//     [
//       ACCESS_TOKEN_KEY,
//       accessToken,
//     ],
//     [
//       REFRESH_TOKEN_KEY,
//       refreshToken,
//     ],
//   ]);
// }


// export async function getAccessToken() {
//   return AsyncStorage.getItem(
//     ACCESS_TOKEN_KEY
//   );
// }


// export async function getRefreshToken() {
//   return AsyncStorage.getItem(
//     REFRESH_TOKEN_KEY
//   );
// }


// export async function clearAuthTokens() {
//   await AsyncStorage.multiRemove([
//     ACCESS_TOKEN_KEY,
//     REFRESH_TOKEN_KEY,
//   ]);
// }


// // =========================================================
// // GENERIC API REQUEST
// // =========================================================

// export async function apiRequest<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {

//   const token = await getAccessToken();

//   const response = await fetch(
//     `${API_URL}${endpoint}`,
//     {
//       ...options,

//       headers: {
//         "Content-Type": "application/json",

//         ...(token
//           ? {
//               Authorization:
//                 `Bearer ${token}`,
//             }
//           : {}),

//         ...(options.headers || {}),
//       },
//     },
//   );


//   let data: any = null;

//   try {
//     data = await response.json();
//   } catch {
//     data = null;
//   }


//   if (!response.ok) {
//     throw new Error(
//       data?.detail ||
//       data?.message ||
//       `Request failed with status ${response.status}`,
//     );
//   }


//   return data as T;
// }


// // =========================================================
// // AUTH API
// // =========================================================

// export const authApi = {

//   async login(
//     email: string,
//     password: string,
//   ) {

//     const response = await fetch(
//       `${API_URL}/api/v1/auth/login`,
//       {
//         method: "POST",

//         headers: {
//           "Content-Type":
//             "application/json",
//         },

//         body: JSON.stringify({
//           email,
//           password,
//         }),
//       },
//     );


//     let data: any = null;

//     try {
//       data = await response.json();
//     } catch {
//       data = null;
//     }


//     if (!response.ok) {
//       throw new Error(
//         data?.detail ||
//         data?.message ||
//         `Login failed with status ${response.status}`,
//       );
//     }


//     const authResponse = data as {
//       access_token: string;
//       refresh_token: string;
//       token_type: string;
//     };


//     await saveAuthTokens(
//       authResponse.access_token,
//       authResponse.refresh_token,
//     );


//     return authResponse;
//   },


//   me() {
//     return apiRequest<{
//       id: string;
//       email: string;
//     }>(
//       "/api/v1/auth/me",
//     );
//   },


//   async logout() {

//     try {

//       return await apiRequest<{
//         success: boolean;
//         message: string;
//       }>(
//         "/api/v1/auth/logout",
//         {
//           method: "POST",
//         },
//       );

//     } finally {

//       await clearAuthTokens();

//     }
//   },
// };


// // =========================================================
// // PARTNER API
// // =========================================================

// export const partnerApi = {

//   profile() {
//     return apiRequest(
//       "/api/v1/partner/profile",
//     );
//   },


//   dashboard() {
//     return apiRequest(
//       "/api/v1/partner/dashboard",
//     );
//   },


//   bookings(status?: string) {

//     const query = status
//       ? `?status=${encodeURIComponent(status)}`
//       : "";

//     return apiRequest(
//       `/api/v1/partner/bookings${query}`,
//     );
//   },


//   approveBooking(
//     bookingId: string,
//   ) {

//     return apiRequest(
//       `/api/v1/partner/bookings/${bookingId}/approve`,
//       {
//         method: "POST",
//       },
//     );
//   },


//   rejectBooking(
//     bookingId: string,
//     reason: string,
//   ) {

//     return apiRequest(
//       `/api/v1/partner/bookings/${bookingId}/reject`,
//       {
//         method: "POST",

//         body: JSON.stringify({
//           reason,
//         }),
//       },
//     );
//   },


//   // =====================================================
//   // DUTY ON
//   // =====================================================

//   turnOnDuty(
//     workStartLocation?: unknown,
//   ) {

//     return apiRequest(
//       "/api/v1/partner/duty/on",
//       {
//         method: "POST",

//         body: JSON.stringify({
//           work_start_location:
//             workStartLocation ?? null,
//         }),
//       },
//     );
//   },


//   // =====================================================
//   // DUTY OFF
//   // =====================================================

//   turnOffDuty() {

//     return apiRequest(
//       "/api/v1/partner/duty/off",
//       {
//         method: "POST",
//       },
//     );
//   },
// };
















// import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_URL = (
//   process.env.EXPO_PUBLIC_API_URL || ""
// ).replace(/\/$/, "");

// if (!API_URL) {
//   console.warn(
//     "EXPO_PUBLIC_API_URL is not configured."
//   );
// }

// // =========================================================
// // TYPES
// // =========================================================

// export interface AuthUser {
//   id: string;
//   email: string;
// }

// export interface PartnerProfile {
//   id?: string;
//   name?: string;
//   full_name?: string;
//   fullName?: string;
//   phone?: string;
//   phone_number?: string;
//   mobile?: string;
//   mobile_number?: string;
//   gender?: string;
//   gender_preference?: string;
//   avatar_url?: string;
//   email?: string;
// }

// export interface DutyData {
//   is_available: boolean;
//   today_minutes: number;
//   weekly_minutes: number;
//   monthly_minutes: number;
// }

// export interface BookingsData {
//   new: number;
//   assigned: number;
//   completed: number;
//   cancelled: number;
// }

// export interface DashboardResponse {
//   success?: boolean;
//   duty: DutyData;
//   bookings: BookingsData;
//   earnings?: {
//     total: number;
//     weekly: number;
//     monthly: number;
//   };
// }

// export interface ProfileResponse {
//   success?: boolean;
//   profile?: PartnerProfile;
//   data?: PartnerProfile;
// }

// export interface DutyOnResponse {
//   success: boolean;
//   message: string;
//   is_available: boolean;
//   duty_started_at: string;
// }

// export interface DutyOffResponse {
//   success: boolean;
//   message: string;
//   is_available: boolean;
//   session_minutes: number;
// }

// // =========================================================
// // TOKEN STORAGE
// // =========================================================

// const ACCESS_TOKEN_KEY = "@neatify_access_token";
// const REFRESH_TOKEN_KEY = "@neatify_refresh_token";

// // =========================================================
// // TOKEN HELPERS
// // =========================================================

// export async function saveAuthTokens(
//   accessToken: string,
//   refreshToken: string,
// ) {
//   await AsyncStorage.multiSet([
//     [ACCESS_TOKEN_KEY, accessToken],
//     [REFRESH_TOKEN_KEY, refreshToken],
//   ]);
// }

// export async function getAccessToken() {
//   return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
// }

// export async function getRefreshToken() {
//   return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
// }

// export async function clearAuthTokens() {
//   await AsyncStorage.multiRemove([
//     ACCESS_TOKEN_KEY,
//     REFRESH_TOKEN_KEY,
//   ]);
// }

// // =========================================================
// // GENERIC API REQUEST
// // =========================================================

// export async function apiRequest<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const token = await getAccessToken();

//   const response = await fetch(
//     `${API_URL}${endpoint}`,
//     {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         ...(options.headers || {}),
//       },
//     },
//   );

//   let data: any = null;

//   try {
//     data = await response.json();
//   } catch {
//     data = null;
//   }

//   if (!response.ok) {
//     throw new Error(
//       data?.detail ||
//       data?.message ||
//       `Request failed with status ${response.status}`,
//     );
//   }

//   return data as T;
// }

// // =========================================================
// // AUTH API
// // =========================================================

// export const authApi = {
//   async login(email: string, password: string) {
//     const response = await fetch(
//       `${API_URL}/api/v1/auth/login`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       },
//     );

//     let data: any = null;

//     try {
//       data = await response.json();
//     } catch {
//       data = null;
//     }

//     if (!response.ok) {
//       throw new Error(
//         data?.detail ||
//         data?.message ||
//         `Login failed with status ${response.status}`,
//       );
//     }

//     const authResponse = data as {
//       access_token: string;
//       refresh_token: string;
//       token_type: string;
//     };

//     await saveAuthTokens(
//       authResponse.access_token,
//       authResponse.refresh_token,
//     );

//     return authResponse;
//   },

//   me(): Promise<AuthUser> {
//     return apiRequest<AuthUser>("/api/v1/auth/me");
//   },

//   async logout() {
//     try {
//       return await apiRequest<{
//         success: boolean;
//         message: string;
//       }>("/api/v1/auth/logout", {
//         method: "POST",
//       });
//     } finally {
//       await clearAuthTokens();
//     }
//   },
// };

// // =========================================================
// // PARTNER API
// // =========================================================

// export const partnerApi = {
//   profile(): Promise<ProfileResponse> {
//     return apiRequest<ProfileResponse>("/api/v1/partner/profile");
//   },

//   dashboard(): Promise<DashboardResponse> {
//     return apiRequest<DashboardResponse>("/api/v1/partner/dashboard");
//   },

//   bookings(status?: string) {
//     const query = status ? `?status=${encodeURIComponent(status)}` : "";
//     return apiRequest(`/api/v1/partner/bookings${query}`);
//   },

//   approveBooking(bookingId: string) {
//     return apiRequest(
//       `/api/v1/partner/bookings/${bookingId}/approve`,
//       { method: "POST" },
//     );
//   },

//   rejectBooking(bookingId: string, reason: string) {
//     return apiRequest(
//       `/api/v1/partner/bookings/${bookingId}/reject`,
//       {
//         method: "POST",
//         body: JSON.stringify({ reason }),
//       },
//     );
//   },

//   turnOnDuty(workStartLocation?: unknown): Promise<DutyOnResponse> {
//     return apiRequest<DutyOnResponse>("/api/v1/partner/duty/on", {
//       method: "POST",
//       body: JSON.stringify({
//         work_start_location: workStartLocation ?? null,
//       }),
//     });
//   },

//   turnOffDuty(): Promise<DutyOffResponse> {
//     return apiRequest<DutyOffResponse>("/api/v1/partner/duty/off", {
//       method: "POST",
//     });
//   },
// };

















// import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_URL = (
//   process.env.EXPO_PUBLIC_API_URL || ""
// ).replace(/\/$/, "");

// if (!API_URL) {
//   console.warn(
//     "EXPO_PUBLIC_API_URL is not configured."
//   );
// }

// // =========================================================
// // TYPES
// // =========================================================

// export interface AuthUser {
//   id: string;
//   email: string;
// }

// export interface PartnerProfile {
//   id?: string;
//   name?: string;
//   full_name?: string;
//   fullName?: string;
//   phone?: string;
//   phone_number?: string;
//   mobile?: string;
//   mobile_number?: string;
//   gender?: string;
//   gender_preference?: string;
//   avatar_url?: string;
//   email?: string;
// }

// export interface DutyData {
//   is_available: boolean;
//   today_minutes: number;
//   weekly_minutes: number;
//   monthly_minutes: number;
// }

// export interface BookingsData {
//   new: number;
//   assigned: number;
//   completed: number;
//   cancelled: number;
// }

// export interface DashboardResponse {
//   success?: boolean;
//   duty: DutyData;
//   bookings: BookingsData;
//   earnings?: {
//     total: number;
//     weekly: number;
//     monthly: number;
//   };
// }

// export interface ProfileResponse {
//   success?: boolean;
//   profile?: PartnerProfile;
//   data?: PartnerProfile;
// }

// export interface DutyOnResponse {
//   success: boolean;
//   message: string;
//   is_available: boolean;
//   duty_started_at: string;
// }

// export interface DutyOffResponse {
//   success: boolean;
//   message: string;
//   is_available: boolean;
//   session_minutes: number;
// }

// // =========================================================
// // CANCEL BOOKING RESPONSE TYPE
// // =========================================================

// export interface CancelBookingResponse {
//   success: boolean;
//   message: string;
//   booking_id: string;
//   cancellation_fee: number;
// }

// // =========================================================
// // TOKEN STORAGE
// // =========================================================

// const ACCESS_TOKEN_KEY = "@neatify_access_token";
// const REFRESH_TOKEN_KEY = "@neatify_refresh_token";

// // =========================================================
// // TOKEN HELPERS
// // =========================================================

// export async function saveAuthTokens(
//   accessToken: string,
//   refreshToken: string,
// ) {
//   await AsyncStorage.multiSet([
//     [ACCESS_TOKEN_KEY, accessToken],
//     [REFRESH_TOKEN_KEY, refreshToken],
//   ]);
// }

// export async function getAccessToken() {
//   return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
// }

// export async function getRefreshToken() {
//   return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
// }

// export async function clearAuthTokens() {
//   await AsyncStorage.multiRemove([
//     ACCESS_TOKEN_KEY,
//     REFRESH_TOKEN_KEY,
//   ]);
// }

// // =========================================================
// // GENERIC API REQUEST
// // =========================================================

// export async function apiRequest<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const token = await getAccessToken();

//   const response = await fetch(
//     `${API_URL}${endpoint}`,
//     {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         ...(options.headers || {}),
//       },
//     },
//   );

//   let data: any = null;

//   try {
//     data = await response.json();
//   } catch {
//     data = null;
//   }

//   if (!response.ok) {
//     throw new Error(
//       data?.detail ||
//       data?.message ||
//       `Request failed with status ${response.status}`,
//     );
//   }

//   return data as T;
// }

// // =========================================================
// // AUTH API
// // =========================================================

// export const authApi = {
//   async login(email: string, password: string) {
//     const response = await fetch(
//       `${API_URL}/api/v1/auth/login`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       },
//     );

//     let data: any = null;

//     try {
//       data = await response.json();
//     } catch {
//       data = null;
//     }

//     if (!response.ok) {
//       throw new Error(
//         data?.detail ||
//         data?.message ||
//         `Login failed with status ${response.status}`,
//       );
//     }

//     const authResponse = data as {
//       access_token: string;
//       refresh_token: string;
//       token_type: string;
//     };

//     await saveAuthTokens(
//       authResponse.access_token,
//       authResponse.refresh_token,
//     );

//     return authResponse;
//   },

//   me(): Promise<AuthUser> {
//     return apiRequest<AuthUser>("/api/v1/auth/me");
//   },

//   async logout() {
//     try {
//       return await apiRequest<{
//         success: boolean;
//         message: string;
//       }>("/api/v1/auth/logout", {
//         method: "POST",
//       });
//     } finally {
//       await clearAuthTokens();
//     }
//   },
// };

// // =========================================================
// // PARTNER API
// // =========================================================

// export const partnerApi = {
//   profile(): Promise<ProfileResponse> {
//     return apiRequest<ProfileResponse>("/api/v1/partner/profile");
//   },

//   dashboard(): Promise<DashboardResponse> {
//     return apiRequest<DashboardResponse>("/api/v1/partner/dashboard");
//   },

//   bookings(status?: string) {
//     const query = status ? `?status=${encodeURIComponent(status)}` : "";
//     return apiRequest(`/api/v1/partner/bookings${query}`);
//   },

//   approveBooking(bookingId: string) {
//     return apiRequest(
//       `/api/v1/partner/bookings/${bookingId}/approve`,
//       { method: "POST" },
//     );
//   },

//   rejectBooking(bookingId: string, reason: string) {
//     return apiRequest(
//       `/api/v1/partner/bookings/${bookingId}/reject`,
//       {
//         method: "POST",
//         body: JSON.stringify({ reason }),
//       },
//     );
//   },

//   // =====================================================
// // CANCEL ASSIGNED BOOKING
// // =====================================================

// cancelBooking(
//   bookingId: string,
//   reason: string,
// ) {
//   return apiRequest(
//     `/api/v1/partner/bookings/${bookingId}/cancel`,
//     {
//       method: "POST",

//       body: JSON.stringify({
//         reason,
//       }),
//     },
//   );
// },

//   // // =====================================================
//   // // CANCEL BOOKING
//   // // =====================================================

//   // cancelBooking(bookingId: string, reason: string): Promise<CancelBookingResponse> {
//   //   return apiRequest<CancelBookingResponse>(
//   //     `/api/v1/partner/bookings/${bookingId}/cancel`,
//   //     {
//   //       method: "POST",
//   //       body: JSON.stringify({ reason }),
//   //     },
//   //   );
//   // },

//   turnOnDuty(workStartLocation?: unknown): Promise<DutyOnResponse> {
//     return apiRequest<DutyOnResponse>("/api/v1/partner/duty/on", {
//       method: "POST",
//       body: JSON.stringify({
//         work_start_location: workStartLocation ?? null,
//       }),
//     });
//   },

//   turnOffDuty(): Promise<DutyOffResponse> {
//     return apiRequest<DutyOffResponse>("/api/v1/partner/duty/off", {
//       method: "POST",
//     });
//   },
// };












// import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_URL = (
//   process.env.EXPO_PUBLIC_API_URL || ""
// ).replace(/\/$/, "");

// if (!API_URL) {
//   console.warn(
//     "EXPO_PUBLIC_API_URL is not configured."
//   );
// }

// // =========================================================
// // TYPES
// // =========================================================

// export interface AuthUser {
//   id: string;
//   email: string;
// }

// export interface PartnerProfile {
//   id?: string;
//   name?: string;
//   full_name?: string;
//   fullName?: string;
//   phone?: string;
//   phone_number?: string;
//   mobile?: string;
//   mobile_number?: string;
//   gender?: string;
//   gender_preference?: string;
//   avatar_url?: string;
//   email?: string;
// }

// export interface DutyData {
//   is_available: boolean;
//   today_minutes: number;
//   weekly_minutes: number;
//   monthly_minutes: number;
// }

// export interface BookingsData {
//   new: number;
//   assigned: number;
//   completed: number;
//   cancelled: number;
// }

// export interface DashboardResponse {
//   success?: boolean;
//   duty: DutyData;
//   bookings: BookingsData;
//   earnings?: {
//     total: number;
//     weekly: number;
//     monthly: number;
//   };
// }

// export interface ProfileResponse {
//   success?: boolean;
//   profile?: PartnerProfile;
//   data?: PartnerProfile;
// }

// export interface DutyOnResponse {
//   success: boolean;
//   message: string;
//   is_available: boolean;
//   duty_started_at: string;
// }

// export interface DutyOffResponse {
//   success: boolean;
//   message: string;
//   is_available: boolean;
//   session_minutes: number;
// }

// export interface CancelBookingResponse {
//   success: boolean;
//   message: string;
//   booking_id: string;
//   cancellation_fee: number;
// }

// export interface BookingDetailsResponse {
//   success: boolean;
//   data: {
//     id: string;
//     services: Array<{
//       id: string;
//       staff_amount: number;
//       service_type: string;
//     }>;
//     work_started_at: string | null;
//     work_ended_at: string | null;
//     start_photo_url: string | null;
//     end_photo_url: string | null;
//     work_status: string;
//     startotp: string;
//     endotp: string;
//     service_uploads: {
//       before: Record<string, string>;
//       after: Record<string, string>;
//     };
//   };
// }

// export interface StartWorkResponse {
//   success: boolean;
//   message: string;
//   work_started_at: string;
// }

// export interface CompleteWorkResponse {
//   success: boolean;
//   message: string;
//   work_ended_at: string;
//   staff_earned_amount: number;
// }

// export interface UploadPhotoResponse {
//   success: boolean;
//   message: string;
//   url: string;
// }

// export interface SkipPhotoResponse {
//   success: boolean;
//   message: string;
// }

// // =========================================================
// // TOKEN STORAGE
// // =========================================================

// const ACCESS_TOKEN_KEY = "@neatify_access_token";
// const REFRESH_TOKEN_KEY = "@neatify_refresh_token";

// // =========================================================
// // TOKEN HELPERS
// // =========================================================

// export async function saveAuthTokens(
//   accessToken: string,
//   refreshToken: string,
// ) {
//   await AsyncStorage.multiSet([
//     [ACCESS_TOKEN_KEY, accessToken],
//     [REFRESH_TOKEN_KEY, refreshToken],
//   ]);
// }

// export async function getAccessToken() {
//   return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
// }

// export async function getRefreshToken() {
//   return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
// }

// export async function clearAuthTokens() {
//   await AsyncStorage.multiRemove([
//     ACCESS_TOKEN_KEY,
//     REFRESH_TOKEN_KEY,
//   ]);
// }

// // =========================================================
// // GENERIC API REQUEST
// // =========================================================

// export async function apiRequest<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const token = await getAccessToken();

//   const response = await fetch(
//     `${API_URL}${endpoint}`,
//     {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         ...(options.headers || {}),
//       },
//     },
//   );

//   let data: any = null;

//   try {
//     data = await response.json();
//   } catch {
//     data = null;
//   }

//   if (!response.ok) {
//     throw new Error(
//       data?.detail ||
//       data?.message ||
//       `Request failed with status ${response.status}`,
//     );
//   }

//   return data as T;
// }

// // =========================================================
// // AUTH API
// // =========================================================

// export const authApi = {
//   async login(email: string, password: string) {
//     const response = await fetch(
//       `${API_URL}/api/v1/auth/login`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       },
//     );

//     let data: any = null;

//     try {
//       data = await response.json();
//     } catch {
//       data = null;
//     }

//     if (!response.ok) {
//       throw new Error(
//         data?.detail ||
//         data?.message ||
//         `Login failed with status ${response.status}`,
//       );
//     }

//     const authResponse = data as {
//       access_token: string;
//       refresh_token: string;
//       token_type: string;
//     };

//     await saveAuthTokens(
//       authResponse.access_token,
//       authResponse.refresh_token,
//     );

//     return authResponse;
//   },

//   me(): Promise<AuthUser> {
//     return apiRequest<AuthUser>("/api/v1/auth/me");
//   },

//   async logout() {
//     try {
//       return await apiRequest<{
//         success: boolean;
//         message: string;
//       }>("/api/v1/auth/logout", {
//         method: "POST",
//       });
//     } finally {
//       await clearAuthTokens();
//     }
//   },
// };

// // =========================================================
// // PARTNER API
// // =========================================================

// export const partnerApi = {
//   profile(): Promise<ProfileResponse> {
//     return apiRequest<ProfileResponse>("/api/v1/partner/profile");
//   },

//   dashboard(): Promise<DashboardResponse> {
//     return apiRequest<DashboardResponse>("/api/v1/partner/dashboard");
//   },

//   bookings(status?: string) {
//     const query = status ? `?status=${encodeURIComponent(status)}` : "";
//     return apiRequest(`/api/v1/partner/bookings${query}`);
//   },

//   approveBooking(bookingId: string) {
//     return apiRequest(
//       `/api/v1/partner/bookings/${bookingId}/approve`,
//       { method: "POST" },
//     );
//   },

//   rejectBooking(bookingId: string, reason: string) {
//     return apiRequest(
//       `/api/v1/partner/bookings/${bookingId}/reject`,
//       {
//         method: "POST",
//         body: JSON.stringify({ reason }),
//       },
//     );
//   },

//   // =====================================================
//   // CANCEL BOOKING
//   // =====================================================

//   cancelBooking(bookingId: string, reason: string): Promise<CancelBookingResponse> {
//     return apiRequest<CancelBookingResponse>(
//       `/api/v1/partner/bookings/${bookingId}/cancel`,
//       {
//         method: "POST",
//         body: JSON.stringify({ reason }),
//       },
//     );
//   },

//   // =====================================================
//   // GET BOOKING DETAILS
//   // =====================================================

//   getBookingDetails(bookingId: string): Promise<BookingDetailsResponse> {
//     return apiRequest<BookingDetailsResponse>(
//       `/api/v1/partner/bookings/${bookingId}/details`,
//       { method: "GET" },
//     );
//   },

//   // =====================================================
//   // START WORK
//   // =====================================================

//   startWork(bookingId: string, startOtp: string): Promise<StartWorkResponse> {
//     return apiRequest<StartWorkResponse>(
//       `/api/v1/partner/bookings/${bookingId}/start`,
//       {
//         method: "POST",
//         body: JSON.stringify({ start_otp: startOtp }),
//       },
//     );
//   },

//   // =====================================================
//   // COMPLETE WORK
//   // =====================================================

//   completeWork(
//     bookingId: string,
//     endOtp: string,
//     workedDuration: string,
//     staffAmount: number,
//   ): Promise<CompleteWorkResponse> {
//     return apiRequest<CompleteWorkResponse>(
//       `/api/v1/partner/bookings/${bookingId}/complete`,
//       {
//         method: "POST",
//         body: JSON.stringify({
//           end_otp: endOtp,
//           worked_duration: workedDuration,
//           staff_amount: staffAmount,
//         }),
//       },
//     );
//   },

//   // =====================================================
//   // UPLOAD BOOKING PHOTO
//   // =====================================================

//   uploadBookingPhoto(bookingId: string, formData: FormData): Promise<UploadPhotoResponse> {
//     return apiRequest<UploadPhotoResponse>(
//       `/api/v1/partner/bookings/${bookingId}/photos`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         body: formData,
//       },
//     );
//   },

//   // =====================================================
//   // SKIP PHOTO
//   // =====================================================

//   skipPhoto(
//     bookingId: string,
//     stage: "before" | "after",
//     reason: string,
//   ): Promise<SkipPhotoResponse> {
//     return apiRequest<SkipPhotoResponse>(
//       `/api/v1/partner/bookings/${bookingId}/skip-photo`,
//       {
//         method: "POST",
//         body: JSON.stringify({
//           stage,
//           reason,
//         }),
//       },
//     );
//   },

//   // =====================================================
//   // DUTY ON
//   // =====================================================

//   turnOnDuty(workStartLocation?: unknown): Promise<DutyOnResponse> {
//     return apiRequest<DutyOnResponse>("/api/v1/partner/duty/on", {
//       method: "POST",
//       body: JSON.stringify({
//         work_start_location: workStartLocation ?? null,
//       }),
//     });
//   },

//   // =====================================================
//   // DUTY OFF
//   // =====================================================

//   turnOffDuty(): Promise<DutyOffResponse> {
//     return apiRequest<DutyOffResponse>("/api/v1/partner/duty/off", {
//       method: "POST",
//     });
//   },
// };















import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || ""
).replace(/\/$/, "");

if (!API_URL) {
  console.warn(
    "EXPO_PUBLIC_API_URL is not configured."
  );
}

// =========================================================
// TYPES
// =========================================================

export interface AuthUser {
  id: string;
  email: string;
}

export interface PartnerProfile {
  id?: string;
  name?: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  phone_number?: string;
  mobile?: string;
  mobile_number?: string;
  gender?: string;
  gender_preference?: string;
  avatar_url?: string;
  email?: string;
}

export interface DutyData {
  is_available: boolean;
  today_minutes: number;
  weekly_minutes: number;
  monthly_minutes: number;
}

export interface BookingsData {
  new: number;
  assigned: number;
  completed: number;
  cancelled: number;
}

export interface DashboardResponse {
  success?: boolean;
  duty: DutyData;
  bookings: BookingsData;
  earnings?: {
    total: number;
    weekly: number;
    monthly: number;
  };
}

export interface ProfileResponse {
  success?: boolean;
  profile?: PartnerProfile;
  data?: PartnerProfile;
}

export interface DutyOnResponse {
  success: boolean;
  message: string;
  is_available: boolean;
  duty_started_at: string;
}

export interface DutyOffResponse {
  success: boolean;
  message: string;
  is_available: boolean;
  session_minutes: number;
}

// =========================================================
// CANCEL BOOKING RESPONSE TYPE
// =========================================================

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  booking_id: string;
  cancellation_fee: number;
}

// =========================================================
// BOOKING DETAILS TYPES
// =========================================================

export interface BookingDetailsResponse {
  success: boolean;
  data: {
    id: string;
    services: Array<{
      id: string;
      staff_amount: number;
      service_type: string;
    }>;
    work_started_at: string | null;
    work_ended_at: string | null;
    start_photo_url: string | null;
    end_photo_url: string | null;
    work_status: string;
    startotp: string;
    endotp: string;
    service_uploads: {
      before: Record<string, string>;
      after: Record<string, string>;
    };
  };
}

export interface StartWorkResponse {
  success: boolean;
  message: string;
  work_started_at: string;
}

export interface CompleteWorkResponse {
  success: boolean;
  message: string;
  work_ended_at: string;
  staff_earned_amount: number;
}

export interface UploadPhotoResponse {
  success: boolean;
  message: string;
  url: string;
}

export interface SkipPhotoResponse {
  success: boolean;
  message: string;
}

// =========================================================
// TOKEN STORAGE
// =========================================================

const ACCESS_TOKEN_KEY = "@neatify_access_token";
const REFRESH_TOKEN_KEY = "@neatify_refresh_token";

// =========================================================
// TOKEN HELPERS
// =========================================================

export async function saveAuthTokens(
  accessToken: string,
  refreshToken: string,
) {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearAuthTokens() {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
  ]);
}

// =========================================================
// GENERIC API REQUEST
// =========================================================

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    },
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`,
    );
  }

  return data as T;
}

// =========================================================
// AUTH API
// =========================================================

export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch(
      `${API_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        `Login failed with status ${response.status}`,
      );
    }

    const authResponse = data as {
      access_token: string;
      refresh_token: string;
      token_type: string;
    };

    await saveAuthTokens(
      authResponse.access_token,
      authResponse.refresh_token,
    );

    return authResponse;
  },

  me(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/api/v1/auth/me");
  },

  async logout() {
    try {
      return await apiRequest<{
        success: boolean;
        message: string;
      }>("/api/v1/auth/logout", {
        method: "POST",
      });
    } finally {
      await clearAuthTokens();
    }
  },
};

// =========================================================
// PARTNER API
// =========================================================

export const partnerApi = {
  profile(): Promise<ProfileResponse> {
    return apiRequest<ProfileResponse>("/api/v1/partner/profile");
  },

  dashboard(): Promise<DashboardResponse> {
    return apiRequest<DashboardResponse>("/api/v1/partner/dashboard");
  },

  bookings(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest(`/api/v1/partner/bookings${query}`);
  },

  approveBooking(bookingId: string) {
    return apiRequest(
      `/api/v1/partner/bookings/${bookingId}/approve`,
      { method: "POST" },
    );
  },

  rejectBooking(bookingId: string, reason: string) {
    return apiRequest(
      `/api/v1/partner/bookings/${bookingId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );
  },

  // =====================================================
  // CANCEL ASSIGNED BOOKING
  // =====================================================

  cancelBooking(bookingId: string, reason: string): Promise<CancelBookingResponse> {
    return apiRequest<CancelBookingResponse>(
      `/api/v1/partner/bookings/${bookingId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );
  },

  // =====================================================
  // GET BOOKING DETAILS
  // =====================================================

  getBookingDetails(bookingId: string): Promise<BookingDetailsResponse> {
    return apiRequest<BookingDetailsResponse>(
      `/api/v1/partner/bookings/${bookingId}/details`,
      { method: "GET" },
    );
  },

  // =====================================================
  // START WORK
  // =====================================================

  startWork(bookingId: string, startOtp: string): Promise<StartWorkResponse> {
    return apiRequest<StartWorkResponse>(
      `/api/v1/partner/bookings/${bookingId}/start`,
      {
        method: "POST",
        body: JSON.stringify({ start_otp: startOtp }),
      },
    );
  },

  // =====================================================
  // COMPLETE WORK
  // =====================================================

  completeWork(
    bookingId: string,
    endOtp: string,
    workedDuration: string,
    staffAmount: number,
  ): Promise<CompleteWorkResponse> {
    return apiRequest<CompleteWorkResponse>(
      `/api/v1/partner/bookings/${bookingId}/complete`,
      {
        method: "POST",
        body: JSON.stringify({
          end_otp: endOtp,
          worked_duration: workedDuration,
          staff_amount: staffAmount,
        }),
      },
    );
  },

  // =====================================================
  // UPLOAD BOOKING PHOTO (Special case - FormData)
  // =====================================================

  async uploadBookingPhoto(bookingId: string, formData: FormData): Promise<UploadPhotoResponse> {
    const token = await getAccessToken();

    const response = await fetch(
      `${API_URL}/api/v1/partner/bookings/${bookingId}/photos`,
      {
        method: "POST",
        headers: {
          // DO NOT set Content-Type - let fetch handle multipart boundary
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      },
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        `Upload failed with status ${response.status}`,
      );
    }

    return data as UploadPhotoResponse;
  },

  // =====================================================
  // SKIP PHOTO
  // =====================================================

  skipPhoto(
    bookingId: string,
    stage: "before" | "after",
    reason: string,
  ): Promise<SkipPhotoResponse> {
    return apiRequest<SkipPhotoResponse>(
      `/api/v1/partner/bookings/${bookingId}/skip-photo`,
      {
        method: "POST",
        body: JSON.stringify({
          stage,
          reason,
        }),
      },
    );
  },

  // =====================================================
  // DUTY ON
  // =====================================================

  turnOnDuty(workStartLocation?: unknown): Promise<DutyOnResponse> {
    return apiRequest<DutyOnResponse>("/api/v1/partner/duty/on", {
      method: "POST",
      body: JSON.stringify({
        work_start_location: workStartLocation ?? null,
      }),
    });
  },

  // =====================================================
  // DUTY OFF
  // =====================================================

  turnOffDuty(): Promise<DutyOffResponse> {
    return apiRequest<DutyOffResponse>("/api/v1/partner/duty/off", {
      method: "POST",
    });
  },
};