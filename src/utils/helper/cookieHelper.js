// import Cookies from 'js-cookie'; // not work in nextjs
import { cookies } from "next/headers";
import { serialize } from "cookie";

//* SET Cookies
export const setAccessToken = (res, accessToken) => {
    return res.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 15, // 15 min
    });
};

export const setRefreshToken = (res, refreshToken) => {
    return res.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

//* REMOVE
export const removeRefreshToken = (res) => {
    return res.cookies.set({
      name: "refreshToken",
      value: '',
      path: "/",
      maxAge: 0
    });
}
export const removeAccessToken = (res) => {
    return res.cookies.set({
      name: "accessToken",
      value: '',
      path: "/",
      maxAge: 0
    });
}

//! Get tokens from cookieStore
export const getAccessToken = () => {
    const cookieStore = cookies();
  return cookieStore.get('accessToken');
};

export const getRefreshToken = () => {
    const cookieStore = cookies();
  return cookieStore.get('refreshToken');
};
