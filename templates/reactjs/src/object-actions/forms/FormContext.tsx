import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

interface FormState {
  [key: string]: any; // Define your state structure here
}

const initialState: FormState = {
  // Initialize your state here
};

// Define your action types
type Action =
  | { type: 'addFieldWidget', payload: any }
  | { type: 'changeFieldVal', payload: any }
  | { type: 'submitForm', payload: any }
  | { type: 'setNodeEntries', payload: any }
  // Add other action types as appropriate
  ;

const formReducer = (state: FormState, action: Action): FormState => {
  switch (action.type) {
    case 'addFieldWidget':
      // Add your logic here
      return { ...state, /* new state */ };
    case 'changeFieldVal':
      // Add your logic here
      return { ...state, /* new state */ };
    case 'submitForm':
      // Add your logic here
      return { ...state, /* new state */ };
    case 'setNodeEntries':
      // Add your logic here
      return { ...state, /* new state */ };
    default:
      return state;
  }
};

const FormContext = createContext<{ state: FormState, dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => undefined
});

export const useFormContext = () => useContext(FormContext);

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  );
};