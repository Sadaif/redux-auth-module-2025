import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../features/auth/authSlice"; 
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

const authPersistConfig = {
  key: "auth",
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ["user", "isAuthenticated"], // Never store tokens here
};

const persistedReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export const persistor = persistStore(store);
