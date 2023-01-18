export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface User {
  user_id: string
  username: string
  password_hash: string
  page_id: string
  page_token: string
  is_admin: boolean
}
