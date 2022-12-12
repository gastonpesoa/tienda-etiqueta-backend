const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const orderCheckService = () => {
    console.log('Initialized order checking service');
    setInterval(async () => {
        const actualDate = new Date();
        const weekAgoDate = new Date(actualDate.setDate(actualDate.getDate() - 7));
        const orders = await Order.find({ 
            $and : [ 
                { "date": { $lt : weekAgoDate } }, 
                { "delivery_method": "Retiro en local" }, 
                { "payment_method": "Pago en el local" }, 
                { "state": "LISTA_PARA_RETIRAR" } 
            ] 
        })

        orders.forEach(async order => {
            let ord = await Order.findById(order._id)
            ord.items.forEach(async (item) => {
                let product = await Product.findById(item.product._id)
                for (article of product.articles) {
                    if (article.size == item.product.articles[0].size) {
                        article.stock += item.units;
                        product.save();
                        console.log(`Se incrementó el stock de ${product.title} (talle ${article.size}) en ${item.units} unidad/es`);
                    }
                }
            });

            let user = await User.findById(ord.user._id);
            if (user.warnings === undefined) {
                user.warnings = 1;
            } else {
                user.warnings += 1;
            }
            user.save();

            console.log(`Se canceló la orden de ${ord.user.name} ${ord.user.last_name}`);
            ord.state = "CANCELADA";
            ord.save();
        });
    }, 60000); // Llamado cada 1 minuto
}

module.exports = orderCheckService