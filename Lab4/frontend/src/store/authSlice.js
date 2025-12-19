import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login as apiLogin, register as apiRegister } from '../api/authApi'
import { clearToken, getToken, setToken } from '../api/http'

export const loginThunk = createAsyncThunk('auth/login', async ({ username, password }) => {
    const data = await apiLogin(username, password)
    setToken(data.token)
    return data.token
})

export const registerThunk = createAsyncThunk('auth/register', async ({ username, password }) => {
    const data = await apiRegister(username, password)
    setToken(data.token)
    return data.token
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: getToken(),
        status: 'idle',
        error: null
    },
    reducers: {
        logout(state) {
            clearToken()
            state.token = null
            state.status = 'idle'
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.token = action.payload
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error?.message || 'Ошибка входа'
            })
            // Регистрация
            .addCase(registerThunk.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.token = action.payload
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error?.message || 'Ошибка регистрации'
            })
    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer