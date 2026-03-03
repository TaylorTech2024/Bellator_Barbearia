# Bellator Barbearia (Front-end)

Projeto front-end em **HTML + CSS + JavaScript (ES Modules)**, com navegação SPA via `hash` e um **mock de back-end** usando `localStorage`.

## Rodar localmente
- Opção 1: abrir `index.html` direto no navegador (a maioria funciona).
- Opção 2 (recomendado): servir com um servidor local:

```bash
# usando python
python -m http.server 5173
# abra http://localhost:5173
```

## Contas demo
- Cliente: `cliente@bellator.com` / `123456`
- Admin: `admin@bellator.com` / `123456`
- Barbeiro: `carlos@bellator.com` / `123456`

## Observações
- O mock implementa **RF02, RF03, RF04, RF05, RF06, RF07, RF08 (parcial)**.
- Segurança (NF01/NF05/NF04) é apenas demonstrativa no front. Em produção, use back-end com autenticação e hashing/salt no servidor.
- WhatsApp integrado via botão flutuante com `wa.me`.
