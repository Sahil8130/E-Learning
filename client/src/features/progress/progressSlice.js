import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { progressAPI } from '../../services/api';

// Async thunks
export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async ({ userId, courseId }, { rejectWithValue }) => {
    try {
      let response;
      if (courseId === 'all') {
        response = await progressAPI.getByUser(userId);
      } else {
        response = await progressAPI.get(userId, courseId);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
);

export const updateProgress = createAsyncThunk(
  'progress/updateProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      const response = await progressAPI.update(progressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update progress');
    }
  }
);

export const markLectureComplete = createAsyncThunk(
  'progress/markLectureComplete',
  async ({ courseId, lectureId, score }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const userId = state.auth.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await progressAPI.update({
        courseId,
        lectureId,
        score
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark lecture complete');
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    progress: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetProgress: (state) => {
      state.progress = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch progress
      .addCase(fetchProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.loading = false;
        const { courseId } = action.meta.arg;
        
        if (courseId === 'all') {
          // If fetching all progress, convert array to object keyed by course ID
          if (Array.isArray(action.payload)) {
            state.progress = action.payload.reduce((acc, progress) => {
              acc[progress.course] = progress;
              return acc;
            }, {});
          } else {
            state.progress = action.payload;
          }
        } else {
          // If fetching specific course progress, update that course
          state.progress[courseId] = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update progress
      .addCase(updateProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.loading = false;
        const courseId = action.payload.course;
        state.progress[courseId] = action.payload;
        state.error = null;
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark lecture complete
      .addCase(markLectureComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markLectureComplete.fulfilled, (state, action) => {
        state.loading = false;
        const courseId = action.payload.course;
        state.progress[courseId] = action.payload;
        state.error = null;
      })
      .addCase(markLectureComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetProgress } = progressSlice.actions;
export default progressSlice.reducer;