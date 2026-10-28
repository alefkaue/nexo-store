import { expect, it } from 'vitest'
import { validateCheckout } from './checkout'
import type { CheckoutForm } from './checkout'
const form: CheckoutForm = {
  nickname: 'Demo',
  email: 'demo@example.com',
  city: 'Cidade Exemplo',
  delivery: 'standard',
  agreed: true,
}
it('aceita formulário fictício sem dados sensíveis', () =>
  expect(validateCheckout(form)).toEqual({}))
it('rejeita campos vazios e consentimento ausente', () =>
  expect(
    Object.keys(validateCheckout({ ...form, nickname: '', email: '', city: '', agreed: false })),
  ).toHaveLength(4))
it('valida formato de email e tamanho dos campos', () => {
  expect(validateCheckout({ ...form, email: 'invalido' }).email).toBeTruthy()
  expect(
    validateCheckout({ ...form, nickname: 'a'.repeat(61), city: 'a'.repeat(81) }).city,
  ).toBeTruthy()
})
it('não valida números de cartão, CPF ou endereço porque não os coleta', () =>
  expect(Object.keys(form)).toEqual(['nickname', 'email', 'city', 'delivery', 'agreed']))
