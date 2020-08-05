import knex from 'knex';

// Documentação knex: knexjs.org -> migrations -> migration API
// comando para criar tabela: yarn knex:migrate

export async function up(knex: knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('avatar').notNullable();
    table.string('whatsapp').notNullable();
    table.string('bio').notNullable();
  });
}

export async function down(knex: knex) {
  return knex.schema.dropTable('users');
}
