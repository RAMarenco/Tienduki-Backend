const debug = require("debug")("app:mongoose");
const StoreProduct = require("../model/storeProduct.model");
const ProductCollection = require("../model/productCollection.model");

const controller = {};

controller.create = async(req, res) => {
    try {
        const {
            name, description, price, visible, _id_product_collection, _id_store
        } = req.body;

        const storeProduct = new StoreProduct({
            name: name,
            description: description,
            price: price,
            visible: visible,
            _id_product_collection: _id_product_collection,
            _id_store: _id_store
        });

        const newStoreProduct = await storeProduct.save();

        let productCollection = await ProductCollection.findOne({}).where({ _id_store: _id_store });
        productCollection.product_collections = productCollection.product_collections.concat(newStoreProduct._id);
        await productCollection.save();

        if(!newStoreProduct) {
            return res.status(409).json({ error: "Ocurrió un error al agregar un producto" });
        }

        return res.status(201).json(newStoreProduct);

    } catch (error) {
        debug({error});
        return res.status(500).json({ error: "Error interno de servidor" });
    }
}

controller.findById = async (req, res) => {

    try {
        const { identifier } = req.params;

        const storeProduct = await 
            StoreProduct
                .findById( identifier )
                .populate("image_product");

        if (!storeProduct) {
            return res.status(404).json({error: "Producto de tienda no encontrado"});
        }
        return res.status(202).json(storeProduct)

    } catch (error) {
        debug({error});
        return res.status(500).json({error: "Error interno de servidor"});
    }
}

controller.findByCollection = async (req, res) => {

    try {
        const { identifier } = req.params;

        const storeProduct = await StoreProduct.find( {_id_product_collection: `${identifier}`} )
        .populate({
            path: "_id_product_collection",
        })
        .populate({
            path: "_id_store"
        })
        .populate({
            path: "image_product"
        });

        if (!storeProduct) {
            return res.status(404).json({error: "Producto de tienda no encontrado"});
        }
        return res.status(202).json(storeProduct)

    } catch (error) {
        debug({error});
        return res.status(500).json({error: "Error interno de servidor"});
    }
}

controller.findAll = async (req, res) => {

    try {

        const storeProduct = await StoreProduct.find({ hidden: false })
        .populate({
            path: "_id_product_collection",
        })
        .populate({
            path: "_id_store"
        })
        .populate({
            path: "image_product"
        });

        if (!storeProduct) {
            return res.status(404).json({error: "Productos de tienda no encontrado"});
        }
        return res.status(202).json(storeProduct)

    } catch (error) {
        debug({error});
        return res.status(500).json({error: "Error interno de servidor"});
    }
}

controller.delete = async (req, res) => {

    try {
        const { identifier } = req.params;

        const storeProduct = await StoreProduct.findByIdAndDelete( identifier );

        if (!storeProduct) {
            return res.status(404).json({error: "Producto de tienda no encontrado"});
        }
        return res.status(202).json(storeProduct)

    } catch (error) {
        debug({error});
        return res.status(500).json({error: "Error interno de servidor"});
    }
}

controller.put = async (req, res) => {

    try {
        const { identifier } = req.params;
        const data = {...req.body};

        const updatedStoreProduct = await StoreProduct.findByIdAndUpdate(identifier, data, {new: true});

        res.status(201).json(updatedStoreProduct);
        

    } catch (error) {
        debug({error});
        return res.status(500).json({error: "Error interno de servidor"});
    }

}


module.exports = controller;