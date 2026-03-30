import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  // enables caching, invalidation, polling, etc
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export default store;
