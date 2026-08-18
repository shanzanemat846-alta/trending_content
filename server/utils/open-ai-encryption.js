const CryptoJS = require("crypto-js");

const SECRET_KEY = process.env.HASHING_SECRET_KEY;

const GetEncodedOpenAIKey = (value) => {
  if (!value) return value;
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

const GetDecodedOpenAIKey = (encryptedValue) => {
  if (!encryptedValue) return encryptedValue;
  const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { GetEncodedOpenAIKey, GetDecodedOpenAIKey };
