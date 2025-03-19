import * as yup from "yup";
import Category from "../models/Category";
import User from "../models/User";

class CategoryController {
  async store(request, response) {
    const categorySchema = yup.object({
      name: yup.string().required(),
    });

    try {
      categorySchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { admin: isAdmin } = await User.findByPk(request.userId);

    if (!isAdmin) {
      return response.status(401).json({ message: "Not authorized." });
    }

    const { filename: path } = request.file;
    const { name } = request.body;

    const alreadyExists = await Category.findOne({
      where: {
        name,
      },
    });

    if (alreadyExists) {
      return response.status(400).json({ error: "Category already exists." });
    }

    const category = await Category.create({
      name,
      path,
    });

    return response.status(201).json({ id: category.id, name: category.name });
  }

  async index(request, response) {
    const categories = await Category.findAll();

    return response.json(categories);
  }

  async update(request, response) {
    const categorySchema = yup.object({
      name: yup.string(),
    });

    try {
      categorySchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { admin: isAdmin } = await User.findByPk(request.userId);

    if (!isAdmin) {
      return response.status(401).json({ message: "Not authorized." });
    }

    const { id } = request.params;

    const findCategory = await Category.findByPk(id);

    if (!findCategory) {
      return response.status(400).json({ error: "Category not found." });
    }

    let path;
    if (request.file) {
      path = request.file.filename;
    }
    const { name } = request.body;

    if (name) {
      const alreadyExists = await Category.findOne({
        where: {
          name,
        },
      });

      if (alreadyExists && alreadyExists.id !== +id) {
        return response.status(400).json({ error: "Category already exists." });
      }
    }

    await Category.update(
      {
        name,
        path,
      },
      {
        where: {
          id,
        },
      }
    );

    return response.status(200).json();
  }
}

export default new CategoryController();
