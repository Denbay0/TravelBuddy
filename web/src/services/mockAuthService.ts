export type AuthPayload = {
  email: string
  password: string
  name?: string
}

function randomFail() {
  return Math.random() < 0.2
}

export const mockAuthService = {
  async login(payload: AuthPayload) {
    void payload
    await new Promise((resolve) => setTimeout(resolve, 900))

    if (randomFail()) {
      throw new Error('Не удалось войти. Проверьте данные и попробуйте снова.')
    }

    return { ok: true }
  },

  async register(payload: AuthPayload) {
    void payload
    await new Promise((resolve) => setTimeout(resolve, 1100))

    if (randomFail()) {
      throw new Error('Регистрация временно недоступна. Повторите попытку позже.')
    }

    return { ok: true }
  },
}
