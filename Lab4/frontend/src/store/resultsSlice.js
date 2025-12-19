import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { checkPoint, fetchResults } from '../api/resultsApi'

export const fetchResultsThunk = createAsyncThunk('results/fetchAll', async () => {
    return await fetchResults()
})

export const checkPointThunk = createAsyncThunk('results/check', async ({ x, y, r }) => {
    return await checkPoint(x, y, r)
})

const resultsSlice = createSlice({
    name: 'results',
    initialState: {
        items: [],
        status: 'idle',
        error: null
    },
    reducers: {
        clearResultsState(state) {
            state.items = []
            state.status = 'idle'
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchResultsThunk.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchResultsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload
            })
            .addCase(fetchResultsThunk.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error?.message || 'Failed to load results'
            })

            .addCase(checkPointThunk.fulfilled, (state, action) => {
                // сервер возвращает один результат; добавляем наверх
                state.items = [action.payload, ...state.items]
            })
            .addCase(checkPointThunk.rejected, (state, action) => {
                state.error = action.error?.message || 'Check failed'
            })
    }
})

export const { clearResultsState } = resultsSlice.actions
export default resultsSlice.reducer