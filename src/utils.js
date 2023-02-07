export const testUsername = (name) => {
  const usernamePattern = /^(?=.*[a-zA-Z]{1,})(?=.*[\d]{0,})[a-zA-Z0-9]{3,15}$/;
  //Validated user inputs
  if (!usernamePattern.test(name)) {
    return null;
  }

  return name.charAt(0).toUpperCase() + name.toLowerCase().slice(1);
};

export const testEmail = (email) => {
  const emailPattern = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
  //Validated user inputs
  if (!emailPattern.test(email)) {
    return false;
  }
  return true;
};

export const testPassword = (password) => {
  const emailPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,20}$/;
  //Validated user inputs
  if (!emailPattern.test(password)) {
    return false;
  }
  return true;
};
