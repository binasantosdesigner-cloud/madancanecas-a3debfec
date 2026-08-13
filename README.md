# Madan Canecas

Crie um e-commerce completo e responsivo para a empresa "Madan Canecas & Personalizados", uma loja especializada em produtos personalizados e presentes (canecas, camisetas, copos, canetas e outros). O site deve ser focado em conversão, com design moderno, limpo, sofisticado e atraente. A stack deve usar React, Tailwind CSS e Supabase para o banco de dados e autenticação.

### 1. FLUXO DE VENDAS (INTEGRAÇÃO WHATSAPP)

- Não haverá checkout de pagamento tradicional no site. 

- O cliente adiciona os produtos ao carrinho (seja um modelo pronto ou um personalizado com suas especificações).

- Ao clicar em "Finalizar Pedido", o site deve gerar uma mensagem formatada e enviar o cliente diretamente para o WhatsApp da Madan Canecas & Personalizados com: Nome do cliente, Lista de produtos (Nome, Qtd, Preço), Especificações da personalização (se houver), Tipo de entrega/retirada e Total do pedido.

- O pedido deve ser salvo no banco de dados com o status "Pendente" antes do redirecionamento.

### 2. ESTRUTURA DA HOME (PÁGINA PRINCIPAL)

- **Header:** Logo/Nome da marca (Madan Canecas & Personalizados), Menu de Categorias, Barra de Busca, Ícone de Carrinho (com badge de quantidade) e Botão de Login/Minha Conta.

- **Primeira Dobra:** Banner central rotativo (Carrossel) de alta qualidade destacando os produtos personalizáveis e chamadas para ação (CTA) marcantes como "Crie seu Personalizado" ou "Ver Modelos Prontos".

- **Seção 1: Categorias em Destaque:** Cards visuais e interativos (Canecas, Camisetas, Copos, Canetas).

- **Seção 2: Vitrine de Produtos Prontos:** Grid de produtos com foto, título, preço e botão direto "Adicionar ao Carrinho".

- **Seção 3: Banner Intercalado:** Banner estático com foto ambientada de alta qualidade focada em "Presentes Corporativos" ou "Datas Comemorativas" com CTA para orçamento.

- **Seção 4: Vitrine de Personalizados:** Produtos base onde o cliente clica para abrir a página de personalização.

- **Footer:** Informações institucionais da Madan Canecas & Personalizados, links para redes sociais e informações de contato.

### 3. PÁGINA DE PRODUTO & PERSONALIZAÇÃO

- Para produtos prontos: Foto com zoom, descrição, preço e botão de compra.

- Para produtos personalizados: Campo de texto para o cliente digitar o que deseja escrever (ex: "Nome ou frase para a caneca") e um botão de upload de arquivo/imagem para a estampa, além de seleção de variações (cor, tamanho, material).

### 4. ÁREA DO CLIENTE (AUTENTICAÇÃO SUPABASE)

- Tela de Login / Cadastro personalizada com a identidade visual da Madan.

- Dashboard do Cliente: Listagem de histórico de pedidos e o status atual de cada um (Pendente, Em Produção, Enviado, Concluído).

### 5. ÁREA DO ADMINISTRADOR (/admin)

Área protegida por regra de role do Supabase (apenas admin acessa):

- **Dashboard/Relatórios:** Gráficos simples de pedidos por dia, produtos mais vendidos e faturamento estimado.

- **Gestão de Produtos (CRUD):** Tela para cadastrar, editar e excluir produtos (Título, Preço, Categoria, Imagem, se é Personalizável ou Pronto).

- **Gestão de Pedidos:** Listagem de todos os pedidos feitos, detalhes dos produtos escolhidos (incluindo os textos/links das imagens de personalização que o cliente enviou) e alteração do status do pedido.

- **Configurações:** Campo para o admin alterar o número do WhatsApp que recebe as vendas da Madan.

Por favor, crie uma interface bonita, com animações suaves de transição, estados de loading nos botões e um design focado na experiência do usuário. Use componentes do Shadcn/ui para garantir a consistência visual.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://madancanecas.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/da58ec83-7f1f-4c56-8319-14cc37b713b6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
