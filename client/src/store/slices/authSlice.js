import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, unwrap } from "../../services/api.js";

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async () => {
  const token = localStorage.getItem("token");
  if (!token) return { user: null, student: null };
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  const data = unwrap(await api.get("/api/auth/me"));
  return data;
});

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password, roleHint }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/auth/login", { email, password, roleHint });
      const { token, user } = unwrap(res);
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      return { token, user };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/auth/register", payload);
      const { token, user } = unwrap(res);
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      return { token, user };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const registerAdminThunk = createAsyncThunk(
  "auth/registerAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/auth/register-admin", payload);
      const { token, user } = unwrap(res);
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      return { token, user };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const slice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    student: null,
    token: localStorage.getItem("token"),
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      state.user = null;
      state.student = null;
      state.token = null;
    },
    hydrateFromBootstrap(state, action) {
      state.user = action.payload?.user ?? null;
      state.student = action.payload?.student ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (s) => {
        s.loading = true;
      })
      .addCase(bootstrapAuth.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload?.user ?? null;
        s.student = a.payload?.student ?? null;
      })
      .addCase(bootstrapAuth.rejected, (s) => {
        s.loading = false;
        localStorage.removeItem("token");
        s.token = null;
      })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.token = a.payload.token;
        s.user = a.payload.user;
      })
      .addCase(registerThunk.fulfilled, (s, a) => {
        s.token = a.payload.token;
        s.user = a.payload.user;
      })
      .addCase(registerAdminThunk.fulfilled, (s, a) => {
        s.token = a.payload.token;
        s.user = a.payload.user;
      });
  },
});

export const { logout, hydrateFromBootstrap } = slice.actions;
export default slice.reducer;
