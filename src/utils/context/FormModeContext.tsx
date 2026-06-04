import { createContext, useContext } from "react";

export type FormMode = "add" | "edit";

export const FormModeContext = createContext<FormMode>("add");

export const useFormMode = () => useContext(FormModeContext);
