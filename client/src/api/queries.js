import { useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';

export const queryKeys = {
  dashboard: ['dashboard'],
  weeklySteps: ['weeklySteps'],
  activePlan: ['activePlan'],
  pastPlans: ['pastPlans'],
  recommendedPlans: ['recommendedPlans'],
  todaysWorkouts: (date) => ['todaysWorkouts', date],
  workoutHistory: (date) => ['workoutHistory', date],
  dailySteps: (date) => ['dailySteps', date],
  profile: ['profile'],
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/user/dashboard');
      return data;
    },
  });
};

export const useWeeklySteps = () => {
  return useQuery({
    queryKey: queryKeys.weeklySteps,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/user/steps/weekly');
      return data;
    },
  });
};

export const useActivePlan = () => {
  return useQuery({
    queryKey: queryKeys.activePlan,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/user/active-plan');
      return data.success ? data.plan : null;
    },
  });
};

export const usePastPlans = () => {
  return useQuery({
    queryKey: queryKeys.pastPlans,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/user/past-plans');
      return data.plans || [];
    },
  });
};

export const useRecommendedPlans = () => {
  return useQuery({
    queryKey: queryKeys.recommendedPlans,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/user/recommended-plans');
      return data.plans || [];
    },
  });
};

export const useTodaysWorkouts = (date = '') => {
  return useQuery({
    queryKey: queryKeys.todaysWorkouts(date),
    queryFn: async () => {
      // API expects YYYY-MM-DD or defaults to today if not provided
      const url = date ? `/user/workout?date=${date}` : '/user/workout';
      const { data } = await axiosInstance.get(url);
      return data.todaysWorkouts || [];
    },
  });
};

export const useWorkoutHistory = (date = '') => {
  return useQuery({
    queryKey: queryKeys.workoutHistory(date),
    queryFn: async () => {
      const url = date ? `/user/workout-history?date=${date}` : '/user/workout-history';
      const { data } = await axiosInstance.get(url);
      return data.history || [];
    },
  });
};

export const useDailySteps = (date = '') => {
  return useQuery({
    queryKey: queryKeys.dailySteps(date),
    queryFn: async () => {
      // Support date parameter, fallback to today if not provided
      let url = '/user/steps';
      if (date) {
        url += `?date=${date}`;
      } else {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        url += `?date=${yyyy}-${mm}-${dd}`;
      }
      const { data } = await axiosInstance.get(url);
      return data.steps || 0;
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/user/profile');
      return data.user;
    },
  });
};
