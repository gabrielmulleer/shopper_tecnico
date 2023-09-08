# Teste Tecnico Shopper
## Instructions
### CLIENT 
___
1)  `cd client`   
2)  `npm install`   
3)  `npm run dev`  

## SERVER - Deployed over Amazon EC2 Linux Machine Image (Mumbai) 
___
1) `cd server`
2) `npm install`   
3) Alterar o arquivo .env.exemple para .env e substituir os valores para que se adeque ao seu sql  
4) `npx sequelize-cli db:create` para criar a database do projeto
5) `npm sequelize-cli db:migrate` para executar as migrations e criar as tabelas que serão usadas
6) `npm sequelize-cli db:seed:all` para executar as seeds e inserir os registros na tabela
