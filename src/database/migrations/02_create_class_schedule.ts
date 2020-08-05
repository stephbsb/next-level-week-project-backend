import knex from 'knex';

// Documentação knex: knexjs.org -> migrations -> migration API
// comando para criar tabela: yarn knex:migrate

export async function up(knex: knex) {
  return knex.schema.createTable('class_schedule', (table) => {
    table.increments('id').primary();
    table.integer('week_day').notNullable();
    table.integer('from').notNullable();
    table.integer('to').notNullable();

    // Relacionamento com a tabela classes
    // cascade: VAI DELETAR/UPDATE TUDO RELACIONADO AO PROFESSOR
    table
      .integer('class_id')
      .notNullable()
      .references('id')
      .inTable('classes')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: knex) {
  return knex.schema.dropTable('class_schedule');
}
