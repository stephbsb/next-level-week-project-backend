import { Request, Response } from 'express';
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async index(req: Request, res: Response) {
    const filters = req.query;

    if (!filters.week_day || !filters.subject || !filters.time) {
      return res
        .status(400)
        .json({ error: 'Filtros incompletos para a pesquisa.' });
    }

    const week_day = filters.week_day as string;
    const subject = filters.subject as string;
    const time = filters.time as string;

    const timeInMinutes = convertHourToMinutes(time as string);

    const classes = await db('classes')
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_achedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = `??`', [Number(week_day)])
          .whereRaw('`class_schedule`.`from` <= `??`', [timeInMinutes])
          .whereRaw('`class_schedule`.`to` > `??`', [timeInMinutes]);
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '*', 'users.id')
      .select(['classes.*', 'users.*']);
  }

  async create(req: Request, res: Response) {
    const { name, avatar, whatsapp, subject, bio, cost, schedule } = req.body;

    // transaction - caso ocorra um erro em alguma das transações, todas serão desfeitas.
    const trx = await db.transaction();

    try {
      const UsersId = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const user_id = UsersId[0];

      const classesId = await trx('classes').insert({
        subject,
        cost,
        user_id,
      });

      const class_id = classesId[0];

      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        const from = convertHourToMinutes(scheduleItem.from);

        const to = convertHourToMinutes(scheduleItem.to);

        return { class_id, week_day: scheduleItem.week_day, from, to };
      });

      await trx('class_schedule').insert(classSchedule);

      await trx.commit();

      return res.status(201).send();
    } catch (error) {
      // desfazer transações feitas antes do erro.
      await trx.rollback();
      return res
        .status(400)
        .json({ error: 'Erro inesperado ao criar uma nova classe.' });
    }
  }
}
