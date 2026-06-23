import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, getApiErrorMessage } from '@/lib/api';
import { logout } from './authSlice';

export interface CompanyBranding {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  industry?: string | null;
}

interface CompanyState {
  branding: CompanyBranding | null;
  loading: boolean;
}

const initialState: CompanyState = {
  branding: null,
  loading: false,
};

export const fetchCompanyBranding = createAsyncThunk(
  'company/fetchBranding',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/company/branding');
      return data.data as CompanyBranding;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyBranding: (state, action) => {
      state.branding = action.payload;
    },
    clearCompanyBranding: (state) => {
      state.branding = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyBranding.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanyBranding.fulfilled, (state, action) => {
        state.loading = false;
        state.branding = action.payload;
      })
      .addCase(fetchCompanyBranding.rejected, (state) => {
        state.loading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.branding = null;
      });
  },
});

export const { setCompanyBranding, clearCompanyBranding } = companySlice.actions;
export default companySlice.reducer;
