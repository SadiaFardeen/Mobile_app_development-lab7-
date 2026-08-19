import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Dispatch, ReactNode } from "react";
import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState,
} from "react";

import { STUDENTS } from "../data/students";
import {
    StudentsAction,
    StudentsState,
    studentsReducer,
} from "./students-reducer";

interface StudentsContextValue {
  students: StudentsState;
  dispatch: Dispatch<StudentsAction>;
  isLoading: boolean;
}

const StudentsContext =
  createContext<StudentsContextValue | null>(null);

const STORAGE_KEY = "@student_directory";

export function StudentsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [students, dispatch] = useReducer(
    studentsReducer,
    STUDENTS
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as StudentsState;

          dispatch({
            type: "LOAD",
            payload: saved,
          });
        }
      })
      .catch((err) =>
        console.error(
          "AsyncStorage load error:",
          err
        )
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  
  useEffect(() => {
    if (isLoading) return;

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(students)
    ).catch((err) =>
      console.error(
        "AsyncStorage save error:",
        err
      )
    );
  }, [students]);

  return (
    <StudentsContext.Provider
      value={{
        students,
        dispatch,
        isLoading,
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents(): StudentsContextValue {
  const ctx = useContext(StudentsContext);

  if (!ctx) {
    throw new Error(
      "useStudents must be inside StudentsProvider"
    );
  }

  return ctx;
}