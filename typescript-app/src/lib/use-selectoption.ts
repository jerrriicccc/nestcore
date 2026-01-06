import { useEffect, useMemo } from "react";
import { simpleDataReducer } from "./functions";
import { useGet } from "./use-crud";

interface SelectOption {
  path: string;
  endPoint: string;
}

const useSelectOption = ({ path, endPoint }: SelectOption) => {
  const defaultState = { data: [], meta: {} };
  const config = { read: endPoint };

  return useGet(path, defaultState, config, simpleDataReducer);
};

interface SelectOptionAuto {
  path: string;
  endPoint: string;
  dependencies?: any[];
  criteria?: Record<string, any>;
}

export const useSelectOptionAuto = ({ path, endPoint, dependencies = [], criteria = {} }: SelectOptionAuto) => {
  const defaultState = { data: [], meta: {} };
  const config = { read: endPoint };

  const [dataState, getMethod] = useGet(path, defaultState, config, simpleDataReducer);
  const stringifiedCriteria = useMemo(() => JSON.stringify(criteria), [criteria]);
  //   console.log("stringifiedCriteria", stringifiedCriteria);

  useEffect(() => {
    const data = Object.keys(criteria).length > 0 ? { requestData: criteria } : {};
    getMethod(data);
  }, [stringifiedCriteria, ...dependencies]);
  return [dataState];
};

export default useSelectOption;
