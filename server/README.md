
### 1º Instalar todas as dependencias

```
npm install
``` 
### 2º Alterar o arquivo .env.exemple para .env e substituir os valores para que se adeque ao seu sql
### 3º Criar a database do projeto

```
npx sequelize-cli db:create
```

### 4º Executar as migrations para criar as tabelas do projeto

```
npm sequelize-cli db:migrate
```

### 5º Executar as seeds para criar os registros do projeto

```
npm sequelize-cli db:seed:all
```

