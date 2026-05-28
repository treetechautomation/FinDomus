# Guia de Configuração: Firebase Admin SDK (Service Account)

Para que o `adminDb` funcione localmente e em produção, você precisa de credenciais de serviço (Service Account). Siga exatamente estes passos para gerá-las e configurá-las.

## Passo 1: Gerar a Chave no Console do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Abra o projeto **FinDomus** (`findomus-50712`).
3. No menu lateral esquerdo, clique no ícone de engrenagem (⚙️) ao lado de **Visão geral do projeto** e selecione **Configurações do projeto**.
4. Acesse a aba **Contas de serviço** (Service accounts).
5. Certifique-se de que a opção **Node.js** esteja selecionada.
6. Clique no botão azul **Gerar nova chave privada** (Generate new private key).
7. Confirme clicando em **Gerar chave**.
8. Um arquivo JSON será baixado automaticamente para a sua máquina (ex: `findomus-50712-firebase-adminsdk-xxxxx-xxxxxxx.json`).

> [!WARNING]
> **NUNCA** faça commit desse arquivo JSON no GitHub ou coloque na pasta pública. Ele dá acesso total e irrestrito (root) a todo o seu banco de dados.

## Passo 2: Extrair os Campos do JSON

Abra o arquivo JSON que você acabou de baixar em um editor de texto ou no próprio VSCode. Você precisará copiar exatamente 3 valores dele. O arquivo se parecerá com isso:

```json
{
  "type": "service_account",
  "project_id": "findomus-50712",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\nxYqO0Q==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@findomus-50712.iam.gserviceaccount.com",
  "client_id": "111111111111111",
  ...
}
```

## Passo 3: Montar o arquivo `.env.local`

Na raiz do seu projeto (mesma pasta do `.env`), crie um arquivo chamado `.env.local`. Ele não será commitado (o Next.js o ignora por padrão).

Cole as seguintes variáveis e substitua os valores copiados do JSON:

```env
FIREBASE_PROJECT_ID="findomus-50712"
FIREBASE_CLIENT_EMAIL="COPIE_O_VALOR_DE_client_email_AQUI"

# IMPORTANTE: Copie a chave com as aspas duplas, exatamente como está no JSON
# Ela deve começar com "-----BEGIN PRIVATE KEY-----\n" e terminar com "\n-----END PRIVATE KEY-----\n"
# Mantenha tudo em uma ÚNICA LINHA no .env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

> [!IMPORTANT]
> **Como escapar a FIREBASE_PRIVATE_KEY:** 
> Você **NÃO** deve quebrar linhas no arquivo `.env`. Copie o valor com os literais `\n` presentes na string do JSON e mantenha as aspas duplas envolta de toda a string. O nosso código `replace(/\\n/g, '\n')` no arquivo `src/lib/firebase-admin.ts` já se encarregará de transformar os caracteres `\n` em quebras de linha reais durante a execução do Node.js.

Após salvar o `.env.local`, **reinicie o servidor de desenvolvimento do Next.js** (`npm run dev`) para que ele leia as novas variáveis.

## Passo 4: Como Validar o `adminDb` Localmente sem Alterar Dados

Para validar que o Admin SDK está conseguindo se conectar e ler o banco, você pode fazer um teste rápido e seguro via terminal ou criando uma API de teste temporária sem alterar nada no código da sua aplicação principal.

### Método Rápido (Criando um script de teste Node):

1. Na pasta raiz, crie um arquivo `test-admin.js`:
```javascript
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

async function test() {
  try {
    const db = admin.firestore();
    // Tenta apenas ler 1 documento, sem alterar nada.
    const snapshot = await db.collection('categories').limit(1).get();
    if (!snapshot.empty) {
      console.log('✅ SUCESSO! Conexão Admin SDK validada. Categoria encontrada:', snapshot.docs[0].id);
    } else {
      console.log('✅ SUCESSO! Conexão validada, mas coleção está vazia.');
    }
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  } finally {
    process.exit(0);
  }
}

test();
```

2. Execute o script no terminal:
`node test-admin.js`

Se aparecer "✅ SUCESSO", significa que sua Service Account está perfeitamente configurada e podemos prosseguir com o Patch 2! (Você pode apagar o `test-admin.js` depois disso).
