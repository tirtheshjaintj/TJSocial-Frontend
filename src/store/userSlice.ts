import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../types";

const initialState: User | null = null;

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        addUser(_state, action) {
            return action.payload;
        }
    }
});


export const { addUser } = userSlice.actions;
export default userSlice.reducer;