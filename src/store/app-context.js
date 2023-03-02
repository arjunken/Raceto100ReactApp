import { createContext, useState } from "react";

const AppContext = createContext({
  appData: new Map(),
  setData: (key, value) => {},
  removeData: (key) => {},
  clearData: () => {},
});

const AppContextProvider = (props) => {
  const [appData, setAppData] = useState(new Map());

  const setDataHandler = (key, value) => {
    setAppData((curMap) => new Map(curMap).set(key, value));
  };

  const removeDataHandler = (key) => {
    setAppData((curMap) => {
      return new Map(curMap).delete(key);
    });
  };

  const clearDataHandler = () => {
    setAppData((curMap) => new Map(curMap).clear());
  };

  const context = {
    appData: appData,
    setData: setDataHandler,
    removeData: removeDataHandler,
    clearData: clearDataHandler,
  };

  return <AppContext.Provider value={context}> {props.children}</AppContext.Provider>;
};

export { AppContextProvider, AppContext as default };
