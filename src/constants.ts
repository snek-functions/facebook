import {url} from './factory'

export const USER_PATH = process.env.USER_PATH || '/var/duckdb/_user_fb.parquet'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ciscocisco'

export const FACEBOOK_TOKEN = process.env.FACEBOOK_TOKEN || ''
export const BLOCKLIST_PATH =
  process.env.BLOCKLIST_PATH || '/var/duckdb/_blacklist.parquet'

export const SHARED_SECRET = process.env.SECRET_KEY || 'ciscocisco'
export const TOKEN_COOKIE_NAME = 'T'
export const REFRESH_TOKEN_COOKIE_NAME = 'RT'
export const USER_DATA_TOKEN_NAME = 'U'

export const LOGIN_COOKIE_SECURE = true
export const LOGIN_COOKIE_SAME_SITE = 'none'
export const LOGIN_COOKIE_PATH = '/'
export const LOGIN_COOKIE_DOMAIN = new URL(url).hostname
export const LOGIN_COOKIE_HTTP_ONLY = true

export const LOGIN_TOKEN_COOKIE_MAX_AGE = 60 * 15 // 15 minutes
export const LOGIN_REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const COOKIE_OPTIONS: {
  httpOnly: boolean
  secure: boolean
  sameSite: boolean | 'strict' | 'lax' | 'none' | undefined
  path: string
  domain: string
} = {
  httpOnly: LOGIN_COOKIE_HTTP_ONLY,
  secure: LOGIN_COOKIE_SECURE,
  sameSite: LOGIN_COOKIE_SAME_SITE,
  path: LOGIN_COOKIE_PATH,
  domain: LOGIN_COOKIE_DOMAIN
}
