import knex from 'knex';

// Documentação knex: knexjs.org -> migrations -> migration API
// comando para criar tabela: yarn knex:migrate

export async function up(knex: knex) {
  return knex.schema.createTable('classes', (table) => {
    table.increments('id').primary();
    table.string('subject').notNullable();
    table.decimal('cost').notNullable();

    // Relacionamento com a tabela usuarios
    // cascade: VAI DELETAR/UPDATE TUDO RELACIONADO AO PROFESSOR
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: knex) {
  return knex.schema.dropTable('classes');
}
