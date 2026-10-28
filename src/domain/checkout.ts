import type { Delivery } from './types'
export interface CheckoutForm {
  nickname: string
  email: string
  city: string
  delivery: Delivery
  agreed: boolean
}
export type FormErrors = Partial<Record<keyof CheckoutForm, string>>
export function validateCheckout(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {}
  if (form.nickname.trim().length < 2 || form.nickname.length > 60)
    errors.nickname = 'Use um apelido fictício entre 2 e 60 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.email.length > 120)
    errors.email = 'Informe um e-mail fictício válido, como demo@example.com.'
  if (form.city.trim().length < 2 || form.city.length > 80)
    errors.city = 'Informe uma cidade fictícia entre 2 e 80 caracteres.'
  if (!['standard', 'pickup'].includes(form.delivery)) errors.delivery = 'Escolha uma modalidade.'
  if (!form.agreed) errors.agreed = 'Confirme que entende que esta é uma simulação.'
  return errors
}
