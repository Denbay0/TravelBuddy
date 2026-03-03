export type ApiErrorPayload = {
  detail?: string | { msg?: string }[]
}

export type ApiUser = {
  id: number
  name: string
  email: string
  handle: string
  avatarUrl: string
  createdAt: string
}

export type LoginRequest = {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginResponse = {
  message: string
  user: ApiUser
  csrfToken: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type RegisterResponse = {
  message: string
  user: ApiUser
  csrfToken: string
}

export type LogoutResponse = {
  message: string
}

export type CsrfResponse = {
  csrfToken: string
}
