import * as yup from "yup";

import Order from "../schemas/Order";
import Product from "../models/Product";
import Category from "../models/Category";

class OrderController {
  async store(request, response) {
    const orderSchema = yup.object({
      products: yup
        .array()
        .required()
        .of(
          yup.object({
            id: yup.number().required(),
            quantity: yup.number().required(),
          })
        ),
    });

    try {
      orderSchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { products } = request.body;

    const productsIds = products.map((product) => product.id);

    const findProducts = await Product.findAll({
      where: {
        id: productsIds,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    const formattedProducts = findProducts.map((product) => {
      const productIndex = products.findIndex((item) => item.id === product.id);

      const newProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category.name,
        url: product.url,
        quantity: products[productIndex].quantity,
      };

      return newProduct;
    });

    const order = {
      user: {
        id: request.userId,
        name: request.userName,
      },
      products: formattedProducts,
      status: "Pedido realizado.",
    };

    const createdOrder = await Order.create(order);

    return response.status(201).json(createdOrder);
  }

  async index(request, response) {
    const orders = await Order.find();

    return response.status(200).json(orders);
  }

  async update(request, response) {
    const orderSchema = yup.object({
      status: yup.string().required(),
    });

    try {
      orderSchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { id } = request.params;
    const { status } = request.body;

    try {
      await Order.updateOne({ _id: id }, { status });
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }

    return response
      .status(200)
      .json({ message: "Status updated sucessfully." });
  }
}

export default new OrderController();
