import * as Yup from "yup";
import { startOfHour, parseISO, isBefore, format } from "date-fns";
import pt from "date-fns/locale/pt-BR";
import Appointment from "../models/Appointment";
import User from "../models/User";
import File from "../models/File";
import Notification from "../schemas/Notification";

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ["date"],
      attributes: ["id", "date"],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["id", "name"],
          include: [
            {
              model: File,
              as: "avatar",
              attributes: ["id", "path", "url"]
            }
          ]
        }
      ]
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Campos inválidos" });
    }

    const { provider_id, date } = req.body;

    /**
     * Verificar se provider_id é um fornecedor
     */

    const isProvider = await User.findOne({ where: { id: provider_id } });
    if (!isProvider) {
      return res.status(401).json({ error: "Provider não permitido" });
    }

    if (provider_id === req.userId) {
      return res
        .status(400)
        .json({ error: "Não é permitido agendar serviços para si mesmo" });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: "A data deve ser posterior a data atual" });
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: "Prestador de serviço não disponível." });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    });

    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      {
        locale: pt
      }
    );
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
