# Projeto CrossTime – Sistema de Reservas de Aula

# Curso de Férias – Escola de TI
Aluno: Lucas Leal

Descrição do Projeto

O projeto CrossTime consiste em um sistema para gerenciamento de reservas de aulas de CrossFit.
O objetivo é permitir que alunos realizem check-in (reserva) em sessões de aula, desde que possuam uma assinatura ativa.

O sistema foi desenvolvido como uma API REST, utilizando boas práticas de organização e modelagem de dados.

Tecnologias Utilizadas

Node.js

NestJS

TypeScript

PostgreSQL

Prisma ORM

Postman (documentação das rotas)

Funcionalidades Implementadas

Cadastro e modelagem de usuários (aluno/admin)

Planos e assinaturas

Controle de pagamentos (PIX mockado)

WOD do dia

Sessões de aula com controle de capacidade

Check-in e cancelamento de reserva

Validação de assinatura ativa para reserva

Documentação das rotas via Postman

Estrutura do Projeto

Banco de dados: modelado em PostgreSQL com Prisma e migrations

API: organizada em módulos (health, WOD, sessões, check-in e pagamentos)

Postman: collection com exemplos de requisições da API

Entrega

Sprint 1 – Back-end (API REST)

Inclui:

Banco de dados modelado e versionado

API REST funcional

Regras de negócio principais implementadas

Collection do Postman com as rotas da API

Repositório com branch específica do backend