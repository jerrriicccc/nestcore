import { query } from 'express';

export const simpleDataReducer = (state: any, action: any) => {
  if (action.type === 'read') {
    return action.response;
  } else {
    return state;
  }
};

export const cardDataReducer = (state: any, action: any) => {
  if (action.type === 'updateField') {
    const newData = {
      ...state.data,
      [action.response.name]: action.response.value,
    };
    return { ...state, data: newData };
  } else {
    return simpleDataReducer(state, action);
  }
};

export const listDataReducer = (state: any, action: any) => {
  if (action.type === 'deleteByIndex') {
    let newData = [...state.data];
    newData.splice(action.index, 1);
    return { ...state, data: newData };
  } else {
    return simpleDataReducer(state, action);
  }
};

export const getQueryData = <T = any>(
  query: Record<string, any>,
  field: string = '*',
  defaultValue: T = '' as T,
): T | Record<string, any> => {
  if (field === '*') {
    return query;
  } else {
    return query[field] !== undefined ? query[field] : defaultValue;
  }
};
