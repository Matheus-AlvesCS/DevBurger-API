import * as yup from "yup";
import jwt from "jsonwebtoken";

import authConfig from "../../config/auth";

import User from "../models/User";

class SessionController {
  async store(request, response) {
    const schema = yup.object({
      email: yup.string().email().required(),
      password: yup.string().min(6).required(),
    });

    const isValid = await schema.isValid(request.body);

    const cantAcces = () => {
      response
        .status(400)
        .json({ error: "Make sure your email and password are correct." });
    };

    if (!isValid) {
      return cantAcces();
    }

    const { email, password } = request.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return cantAcces();
    }

    const isSamePassword = await user.checkPassword(password);

    if (!isSamePassword) {
      return cantAcces();
    }

    return response.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      admin: user.admin,
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
