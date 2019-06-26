import User from "../models/User";

class UserController {
  async store(req, res) {
    const usuarioExistente = await User.findOne({
      where: { email: req.body.email }
    });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Usuário já cadastrado." });
    }
    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    console.log(req.userId);
    return res.json(true);
  }
}
export default new UserController();
