import { createContext, useState } from "react";

const AuthContext = createContext({
  currentUser: null,
  setCurrentUser: (user) => {},
  removeCurrentUser: () => {},
});

const AuthContextProvider = (props) => {
  const [currentUser, setCurrentUser] = useState(null);

  const setCurrentUserHandler = (user) => {
    setCurrentUser(user);
  };

  const removeCurrentUserHandler = (user) => {
    setCurrentUser(null);
  };

  const context = {
    currentUser: currentUser,
    setCurrentUser: setCurrentUserHandler,
    removeCurrentUser: removeCurrentUserHandler,
  };

  return <AuthContext.Provider value={context}> {props.children}</AuthContext.Provider>;
};

// export { AuthContextProvider, AuthContext as default };
