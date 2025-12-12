// import Cookies from 'js-cookie'; // not work in nextjs
import { cookies } from "next/headers";
import { serialize } from "cookie";

const domain = process.env.COOKIE_DOMAIN || "localhost";
const secure = process.env.COOKIE_SECURE === "true";
const httpOnly = process.env.COOKIE_SECURE_HTTP || "true";

//* SET Cookies
export const setCookie = (res, {name, value, maxAgeSec  }) => {
    return res.cookies.set({
      name: name,
      value: value,
      httpOnly: httpOnly,
      secure: secure, // for production : true
      sameSite: "lax", //or  "lax"
      // sameSite: "Strict", //or  "lax"
      path: "/",
      domain: domain,
      maxAge: maxAgeSec
    });
};

//* REMOVE / CLEAR
export const clearCookie = (res, name = "access_token") => {
  return res.cookies.set({
    name,
    value: '',
    httpOnly: httpOnly,
    secure,
    sameSite: "lax",
    path: "/",
    domain,
    maxAge: 0,
  })
}

//* Get tokens from cookieStore
export const getAccessToken = async () => {
    const cookieStore = await cookies();
    const c = cookieStore.get('access_token');
    return c?.value;
  };
  
  export const getRefreshToken = async () => {
    const cookieStore = await cookies();
    const c =  cookieStore.get('refresh_token');
    return c?.value;
};
