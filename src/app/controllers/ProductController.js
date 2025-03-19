import * as yup from "yup";
import Product from "../models/Product";
import Category from "../models/Category";
import User from "../models/User";

class ProductController {
  async store(request, response) {
    const productSchema = yup.object({
      name: yup.string().required(),
      price: yup.number().required(),
      category_id: yup.number().required(),
      offer: yup.boolean(),
    });

    try {
      productSchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { admin: isAdmin } = await User.findByPk(request.userId);

    if (!isAdmin) {
      return response.status(401).json({ message: "Not authorized." });
    }

    const { filename: path } = request.file;
    const { name, price, category_id, offer } = request.body;

    const product = await Product.create({
      name,
      price,
      category_id,
      path,
      offer,
    });

    return response.status(201).json(product);
  }

  async index(request, response) {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    return response.json(products);
  }

  async update(request, response) {
    const productSchema = yup.object({
      name: yup.string(),
      price: yup.number(),
      category_id: yup.number(),
      offer: yup.boolean(),
    });

    try {
      productSchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { admin: isAdmin } = await User.findByPk(request.userId);

    if (!isAdmin) {
      return response.status(401).json({ message: "Not authorized." });
    }

    const { id } = request.params;

    const findProduct = await Product.findByPk(id);

    if (!findProduct) {
      return response.status(400).json({ error: "Product not found." });
    }

    let path;
    if (request.file) {
      path = request.file.filename;
    }

    const { name, price, category_id, offer } = request.body;

    await Product.update(
      {
        name,
        price,
        category_id,
        path,
        offer,
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

export default new ProductController();
