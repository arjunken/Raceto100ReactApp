import { createContext } from "react";

const LocalStorageContext = createContext({
  setData: (locationKey, key, value) => {},
  getData: (locationKey, key) => {},
  getAllData: (locationKey) => {},
  removeData: (locationKey, key) => {},
  clearData: (locationKey) => {},
});

const LocalStorageContextProvider = (props) => {
  const setDataHandler = (locationKey, key, value) => {
    const data = JSON.parse(localStorage.getItem(locationKey));
    if (data) {
      data[key] = value;
      localStorage.setItem(locationKey, JSON.stringify(data));
    } else {
      localStorage.setItem(locationKey, JSON.stringify({ [key]: value }));
    }
  };

  const getDataHandler = (locationKey, key) => {
    const data = JSON.parse(localStorage.getItem(locationKey));
    if (data) {
      return data[key];
    }
  };

  const getAllDataHandler = (locationKey) => {
    const data = JSON.parse(localStorage.getItem(locationKey));
    if (data) {
      return data;
    }
  };

  const removeDataHandler = (locationKey, key) => {
    const data = JSON.parse(localStorage.getItem(locationKey));
    if (data) {
      delete data[key];
      localStorage.setItem(locationKey, JSON.stringify(data));
    }
  };

  const clearDataHandler = (locationKey) => {
    localStorage.removeItem(locationKey);
  };

  const context = {
    setData: setDataHandler,
    getData: getDataHandler,
    getAllData: getAllDataHandler,
    removeData: removeDataHandler,
    clearData: clearDataHandler,
  };

  return <LocalStorageContext.Provider value={context}> {props.children}</LocalStorageContext.Provider>;
};

export { LocalStorageContextProvider, LocalStorageContext as default };
