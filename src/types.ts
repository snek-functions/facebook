export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface User {
  userId: string
  username: string
  passwordHash: string
  pageId: string
  pageToken: string
  isAdmin: boolean
}
