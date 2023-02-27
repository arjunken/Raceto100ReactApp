import { createContext, useState } from "react";

const CurrentUserDataContext = createContext({
  currentUserData: null,
  setCurrentUserData: (userData) => {},
  removeCurrentUserData: () => {},
});

const CurrentUserDataContextProvider = (props) => {
  const [currentUserData, setCurrentUserData] = useState(null);

  const setCurrentUserDataHandler = (userData) => {
    setCurrentUserData(userData);
  };

  const removeCurrentUserDataHandler = () => {
    setCurrentUserData(null);
  };

  const context = {
    currentUserData: currentUserData,
    setCurrentUserData: setCurrentUserDataHandler,
    removeCurrentUserData: removeCurrentUserDataHandler,
  };

  return <CurrentUserDataContext.Provider value={context}> {props.children}</CurrentUserDataContext.Provider>;
};

// export { CurrentUserDataContextProvider, CurrentUserDataContext as default };
