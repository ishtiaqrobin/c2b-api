import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { env } from "../../app/config/env";
import { Response } from "express";
import { cookieUtils } from "./cookie";

// Creating access token
const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload, // ✅ সেই payload যা auth.service থেকে আসছে
    env.ACCESS_TOKEN_SECRET, // ✅ secret key (.env থেকে)
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN, // ✅ expires time (.env থেকে)
    } as SignOptions,
  );

  return accessToken;
};

// Creating refresh token
const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload, // ✅ সেই payload যা auth.service থেকে আসছে
    env.REFRESH_TOKEN_SECRET, // ✅ secret key (.env থেকে)
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN, // ✅ expires time (.env থেকে)
    } as SignOptions,
  );

  return refreshToken;
};

const setAccessTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    // 1 day
    maxAge: 60 * 60 * 24 * 1000,
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    // 7 days
    maxAge: 60 * 60 * 24 * 1000 * 7,
  });
};

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    // 1 day
    maxAge: 60 * 60 * 24 * 1000,
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
