export type ApiErrorPayload = {
  detail?: string | { msg?: string }[]
}

export type ApiUser = {
  id: number
  username: string
  email: string
  handle: string
  avatar_url: string
  created_at: string
}

export type LoginRequest = {
  username_or_email: string
  password: string
}

export type LoginResponse = {
  message: string
  csrf_token: string
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
  repeat_password: string
}

export type RegisterResponse = {
  message: string
  user: ApiUser
}

export type LogoutResponse = {
  message: string
}

export type CsrfResponse = {
  csrf_token: string
}
