# Buffet Trem da Alegria

Site estático (sem build). Estrutura:

- `index.html` – página
- `css/style.css` – estilos
- `js/main.js` – menu, assistente de orçamento, WhatsApp
- `assets/favicon.svg` – ícone
- `robots.txt`

## Antes de publicar
1. WhatsApp: constante `WHATSAPP` no início de `js/main.js` (já está +55 11 98481-2294).
2. Trocar textos de exemplo no `index.html`: pacotes e preços, depoimentos, nota (4,9), endereço, horário, Instagram.
3. Trocar as ilustrações da seção "Espaço" por fotos reais (`<img loading="lazy" ...>` dentro de cada `<figure class="shot">`).
4. Ao ter o domínio: adicionar `<link rel="canonical">`, `og:url` e `og:image` no `<head>`.

## Publicar
Qualquer hospedagem estática serve: arraste a pasta inteira para Netlify Drop, Cloudflare Pages, Vercel ou GitHub Pages.
Para testar localmente: `npx serve .` (ou abra o `index.html` direto no navegador).
