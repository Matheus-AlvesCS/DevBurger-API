import * as yup from "yup";
import Product from "../models/Product";
import Category from "../models/Category";

class ProductController {
  async store(request, response) {
    const productSchema = yup.object({
      name: yup.string().required(),
      price: yup.number().required(),
      category_id: yup.number().required(),
    });

    try {
      productSchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { filename: path } = request.file;
    const { name, price, category_id } = request.body;

    const product = await Product.create({
      name,
      price,
      category_id,
      path,
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
}

export default new ProductController();
