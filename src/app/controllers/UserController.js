import { v4 } from "uuid";
import * as yup from "yup";

import User from "../models/User";

class UserController {
  async store(request, response) {
    const userSchema = yup.object({
      name: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().min(6).required(),
      admin: yup.boolean(),
    });

    try {
      userSchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { name, email, password, admin } = request.body;

    const alreadyExists = await User.findOne({
      where: {
        email,
      },
    });

    if (alreadyExists) {
      return response.status(401).json({ error: "Email already exists." });
    }

    const user = await User.create({
      id: v4(),
      name,
      email,
      password,
      admin,
    });

    return response.status(201).json({
      id: user.id,
      name,
      email,
      admin,
    });
  }
}

export default new UserController();
