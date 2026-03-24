# Upgraded ActiveVista Implementation Plan: Dashboard, Workout, & Profile

This plan outlines the architecture, functionality, and synchronization strategies for upgrading the Dashboard, Workout, and Profile modules in ActiveVista. The goal is to move from the current legacy event-dispatch system to a robust, scalable, and modern frontend-backend interaction model.

## User Review Required
> [!IMPORTANT]  
> Please review the **Recommended State Management & Sync** section. Shifting from `window.dispatchEvent` to **React Query (or RTK Query)** will drastically improve syncing and cache invalidation. Let me know if you approve this architectural shift before execution.

## 1. Overall Architecture & Connectivity

### Current State
* **API:** Axios instance `axiosInstance.js` handles REST requests.
* **Sync:** Components use `window.dispatchEvent(new CustomEvent('...'))` to notify other pages of changes (e.g., `steps:saved`, `plan:activated`, `workout:completed`).
* **State Management:** Local React state (`useState`) leading to repetitive API calls and loading states across [Dashboard.jsx](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Dashboard.jsx), [Workout.jsx](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Workout.jsx), and [Profile.jsx](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Profile.jsx).

### Upgraded Architecture (Proposed)
* **Data Fetching & Caching Strategy:** Implement **TanStack Query (React Query)** to handle remote data. 
  * Why? React Query will centralize the caching of [dashboardData](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Dashboard.jsx#43-73), `userProfile`, `todaysWorkouts`, and `dailySteps`. When a workout is completed or steps are updated, we simply invalidate the query cache, and all components (Dashboard, Profile, Workout) instantly re-render with fresh data without needing manual event listeners.
* **Global UI State:** Use **Zustand** or **React Context** for purely client-side global state (e.g., theme, sidebar toggles, user auth state details).
* **API Connectivity:** 
  * Keep `axiosInstance.js` but strictly map it to React Query hooks instances (e.g., `useDashboardData()`, `useUserProfile()`).
  * Introduce **WebSocket (Socket.io)** if real-time syncing across multiple devices is required in the future (optional for now, but scalable).

---

## 2. Functionality & Module Implementations

### A. Dashboard ([Dashboard.jsx](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Dashboard.jsx))
**Role:** The command center. Shows aggregates, recommended plans, and quick actions.
**Improvements:**
* **Data Aggregation:** Provide a unified endpoint `/api/dashboard/summary` to minimize multiple round trips (currently fetches dashboard, weekly steps, active plan, past plans, and today's workouts separately).
* **Components:** 
  * `CountsCard`, `WeeklyStatCard`, `CategoryChart`: These component props will be driven directly off the unified React Query cache.
  * `AddWorkout`: Transform into a global floating action or a modal so it can be invoked from any page, not just the Dashboard.
* **Offline Support:** Cache dashboard statistics so the app loads instantly on return visits while fetching in the background.

### B. Workout ([Workout.jsx](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Workout.jsx))
**Role:** Manage daily workouts, 30-day plans, steps, and calendar history.
**Improvements:**
* **Plan Synchronization:** Abstract the "Active Plan" logic. Currently, `plan:activated` is used to refresh. With React Query, calling `useMutation` on `switchPlan` will automatically invalidate the active plan queries globally.
* **Calendar & Date Selection:** Make the date picker context-aware. If the user changes the date on the Workout page, it should fetch historical data via a parameterized query: `useQuery(['workouts', selectedDate])`.
* **Workout Completion:** Shift completion logic to atomic API calls. Use optimistic UI updates (mark workout completed instantly on UI, revert if API fails) to make the app feel incredibly fast.

### C. Profile ([Profile.jsx](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Profile.jsx))
**Role:** User settings, body metrics, goal tracking, and basic snapshot.
**Improvements:**
* **Form State Management:** Shift the massive local `formData` state object to a manageable form library like **React Hook Form** combined with **Zod** for schema validation. This prevents unnecessary re-renders when typing into form fields.
* **Security:** Keep password change flows separated visually and programmatically to ensure secure UX.
* **Metrics Sync:** When weight, height, or goals are updated on the Profile, it should instantly recalculate BMI/BMR metrics which might be used in the Dashboard/Workout plans.

---

## 3. Synchronization & Methods (The Core Upgrade)

To ensure seamless connectivity without a web of `useEffect` event listeners, we will implement the following synchronization plan:

### Method 1: React Query Invalidation (Primary)
Instead of:
```javascript
// Old Way
window.dispatchEvent(new CustomEvent('workout:completed'));

// In Dashboard.jsx
window.addEventListener('workout:completed', fetchDashboardData);
```

We do:
```javascript
// New Way (Upgraded)
const queryClient = useQueryClient();

const completeWorkoutMutation = useMutation(apiCompleteWorkout, {
  onSuccess: () => {
    // Instantly refreshes Dashboard, Workout, and Profile if they are mounted
    queryClient.invalidateQueries(['dashboard']);
    queryClient.invalidateQueries(['todaysWorkouts']);
    queryClient.invalidateQueries(['activePlan']);
  }
});
```

### Method 2: Optimistic Updates
For actions like Incrementing Steps, where speed is crucial for UX:
* The user clicks "+100 steps".
* The UI instantly reflects the new step count.
* In the background, an API request goes to `/user/steps`.
* If it fails, an error toast appears and steps revert. If it succeeds, the cache is finalized.

### Method 3: Centralized Auth & Axios Interceptors
* Ensure `axiosInstance` handles 401 Unauthorized globally. If a token expires, intercept it, optionally attempt a refresh token if applicable, or cleanly redirect to `/signin` and clear global state.

---

## 4. Verification Plan

### Automated/Unit Testing Approaches
* **Test Tools:** Jest + React Testing Library.
* **Component Testing:** Render [Dashboard](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Dashboard.jsx#25-574) with mocked React Query data to ensure stats cards display properly without making real HTTP calls.
* **Integration Testing:** Test the workflow of completing a workout on the [Workout](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Workout.jsx#21-1078) page and verifying that the React Query mocked cache invalidates and updates the [Profile](file:///h:/Aniket/CodeClause/ActiveVista/client/pages/Profile.jsx#44-931) page's recent workout list correctly.

### Manual Verification Steps
Once implemented, the USER can verify via local testing:
1. **Sync Test:** Open the Dashboard in one tab/view and complete a workout on the Workout page. The Dashboard's calories and total workouts should increment automatically without a manual page refresh.
2. **Steps UI Test:** Quickly click "+100" steps multiple times. Ensure the UI feels instant (optimistic UI) and the backend database correctly reflects the final debounced/batched total.
3. **Form Validation Test:** Go to Profile. Try setting weight to an invalid number or letters. React Hook Form + Zod should instantly display a validation error without crashing the component.

Let me know if you'd like to adjust any of this architecture, specifically the adoption of React Query/React Hook Form for the modernization process.
