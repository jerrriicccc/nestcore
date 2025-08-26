import { createSlice, configureStore } from "@reduxjs/toolkit";

const defaultLayoutState = { toggleMenu: "d-flex" };
const layoutSlice = createSlice({
  name: "layout",
  initialState: defaultLayoutState,
  reducers: {
    toggle(state) {
      state.toggleMenu = state.toggleMenu === "d-flex" ? "d-flex toggled" : "d-flex";
    },
  },
});

// Add this interface
interface FormState {
  [key: string]: any;
}
const defaultFormState: FormState = {};

const formSlice = createSlice({
  name: "form",
  initialState: defaultFormState,
  reducers: {
    setInitialFormData(state, action) {
      // This is fine, but note it won't mutate the original state object
      return action.payload;
    },
    loadFormData(state, action) {
      state[action.payload.model] = action.payload.data;
    },
  },
});

// Use .reducer, not the slice itself
const store = configureStore({ reducer: { layout: layoutSlice.reducer, form: formSlice.reducer } });

export const layoutActions = layoutSlice.actions;
export const formActions = formSlice.actions;
export default store;
