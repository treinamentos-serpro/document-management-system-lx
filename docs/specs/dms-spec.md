# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem documentos, mantendo os arquivos no filesystem local e seus metadados em memória.

## 2. Escopo

### Dentro do escopo

- Upload de documentos para armazenamento local.
- Listagem dos documentos pertencentes ao usuário.
- Download de documento pelo identificador.
- Identificação simples do proprietário por requisição.

### Fora do escopo

- Autenticação, cadastro de usuários ou autorização baseada em credenciais.
- Armazenamento externo ou em nuvem.
- Persistência de metadados em banco de dados.
- Versionamento, edição ou exclusão de documentos.
- Busca avançada, pastas e compartilhamento entre usuários.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar o envio de um arquivo por requisição. |
| RF-02 | O sistema deve exigir um identificador de usuário não vazio em `X-User-Id`. |
| RF-03 | O sistema deve associar o documento enviado ao usuário da requisição. |
| RF-04 | O sistema deve gerar um identificador único para cada documento. |
| RF-05 | O sistema deve listar somente documentos pertencentes ao usuário informado. |
| RF-06 | O sistema deve permitir o download pelo identificador somente ao proprietário. |
| RF-07 | O sistema deve responder com erro apropriado quando arquivo, documento ou usuário não for válido ou não existir. |
| RF-08 | O sistema deve fornecer metadados do documento sem expor caminhos internos. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Arquivos são gravados em `backend/storage`, usando `multer` com `diskStorage`. |
| RNF-02 | Metadados ficam em memória e são perdidos quando o processo reinicia. |
| RNF-03 | O backend segue `routes -> controllers -> services -> repositories`; camadas internas não conhecem o Express. |
| RNF-04 | Configurações operacionais são fornecidas por variáveis de ambiente, incluindo `PORT` e `MAX_FILE_SIZE_BYTES`. |
| RNF-05 | O limite padrão por arquivo é 10 MiB e deve ser configurável por `MAX_FILE_SIZE_BYTES`. |
| RNF-06 | O nome físico do arquivo é gerado pelo sistema e não deriva do nome enviado pelo cliente. |
| RNF-07 | Respostas de erro não expõem stack traces ou caminhos locais. |
| RNF-08 | `X-User-Id` identifica o proprietário no MVP, mas não é autenticação segura. |

## 5. Modelo de dados

### Metadados públicos do documento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único, gerado pelo sistema (UUID). |
| `originalName` | string | Nome original enviado pelo cliente, normalizado para uso seguro. |
| `size` | number | Tamanho em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601. |
| `owner` | string | Identificador recebido em `X-User-Id`. |

### Dados internos de armazenamento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `storedName` | string | Nome gerado para localizar o arquivo em `backend/storage`. |
| `mimeType` | string | Tipo MIME recebido no upload, usado como metadado interno. |

`storedName`, `mimeType` e caminhos físicos não fazem parte das respostas de metadados. Uma reinicialização pode deixar arquivos sem metadados correspondentes.

## 6. Contratos de API

Os endpoints são relativos ao backend. O frontend os acessa com o prefixo `/api`, encaminhado pelo proxy do Vite. Todas as operações abaixo exigem `X-User-Id` não vazio.

Formato de erro:

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}
```

### `POST /upload`

- Entrada: `multipart/form-data`, campo de arquivo `file`.
- Limite: 10 MiB por padrão, configurável por `MAX_FILE_SIZE_BYTES`.
- Sucesso: `201 Created`, com os metadados públicos do documento criado.
- Erros: `400 Bad Request` para usuário inválido ou arquivo ausente; `413 Payload Too Large` para arquivo acima do limite; `500 Internal Server Error` para falha inesperada.

### `GET /documents`

- Sucesso: `200 OK`, corpo `{ "documents": [...] }`, contendo somente documentos do usuário. A lista pode estar vazia.
- Erro: `400 Bad Request` se `X-User-Id` estiver ausente ou vazio.

### `GET /documents/:id/download`

- Sucesso: `200 OK`, conteúdo binário e `Content-Disposition: attachment` com o nome original seguro.
- Erros: `400 Bad Request` para usuário inválido ou ID malformado; `404 Not Found` para documento inexistente, de outro usuário ou arquivo local ausente; `500 Internal Server Error` para falha inesperada de leitura.
- Documento inexistente e documento de outro usuário devem produzir a mesma resposta para não revelar sua existência.

## 7. Decisões arquiteturais

- Backend em Node.js e Express, módulos CommonJS; frontend em React e Vite, módulos ESM.
- `routes/` registra endpoints, valida a presença de usuário e aplica o middleware de upload.
- `multer` com `diskStorage` grava os arquivos exclusivamente em `backend/storage`.
- `controllers/` traduzem entrada/saída HTTP; `services/` coordenam regras e casos de uso; `repositories/` mantêm metadados em memória e acessam os arquivos locais.
- Dependências seguem `routes -> controllers -> services -> repositories`; camadas internas não dependem das externas.
- O frontend usa componentes funcionais, `fetch` e o proxy `/api` do Vite.
- A identificação por `X-User-Id` serve ao MVP e pode ser falsificada; não é adequada como mecanismo de autenticação em produção.

## 8. Plano de execução

1. Fechar e registrar os requisitos, limites do MVP, regras de propriedade e contratos HTTP.
2. Implementar os casos de upload e persistência local com metadados em memória, respeitando as camadas definidas.
3. Implementar listagem isolada por proprietário e download com verificação de propriedade e existência do arquivo.
4. Integrar uma interface web de upload, listagem e download pelo prefixo `/api`, incluindo estados de carregamento e erro.
5. Validar contratos, permissões, tratamento de erros, testes do backend e build do frontend; documentar as limitações de reinicialização e identidade do MVP.
