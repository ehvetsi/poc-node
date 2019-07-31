import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import File from '../models/File';
import config from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email(),
      password: Yup.string()
        .required()
        .min(6)
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Campos inválidos.' });
    }

    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [
        { model: File, as: 'avatar', attributes: ['path', 'url', 'id'] }
      ]
    });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const { id, name, avatar, provider } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        avatar,
        provider
      },
      token: jwt.sign(
        {
          id
        },
        config.secret,
        { expiresIn: config.expiresIn }
      )
    });
  }
}
export default new SessionController();
