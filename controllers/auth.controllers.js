const {Users} = require("../model/user.model");
const debug = require("debug")("app:auth-controller");
const Rol = require("../model/rol.model");
const StoreCategory = require("../model/storeCategory.model");

const controller = {};

controller.registerVentor = async (req, res) => {
  try {
    const { username, lastname, name, datebirth, gender, email, password, category, id_rol } = req.body;

    const user = await Users.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (user) {
      return res.status(409).json({ error: "Este usuario ya existe" });
    }

    const newUser = new Users({
      username: username,
      name: name,
      lastname: lastname,
      datebirth: datebirth,
      gender: gender,
      email: email,
      password: password,
      id_rol: id_rol
    });

    
    const guardar = await newUser.save();

    if(id_rol === "637d209f43311e1bfa18b7b2"){
       let storecategory = await StoreCategory.findOne({}).where({category: category});
       storecategory.stores = storecategory.stores.concat(newUser._id);
       await storecategory.save();
    }

    if (!guardar) {
       return res.status(409).json({ error: "Ocurrio un error al registrar el usuario" });
    }
       return res.status(201).json(guardar);

  } catch (error) {
    debug({ error });
    return res.status(500).json({ error: "Error Inesperado" });
  }
};

controller.registerClient = async (req, res) => {
  try {
    const { username, lastname, name, datebirth, gender, email, password } = req.body;

    const user = await Users.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (user) {
      return res.status(409).json({ error: "Este usuario ya existe" });
    }

    const newUser = new Users({
      username: username,
      name: name,
      lastname: lastname,
      datebirth: datebirth,
      gender: gender,
      email: email,
      password: password,
    });
    
    const guardar = await newUser.save();

    if (!guardar) {
       return res.status(409).json({ error: "Ocurrio un error al registrar el usuario" });
    }
    return res.status(200).json({ status: "ok" });

  } catch (error) {
    debug({ error });
    return res.status(500).json({ error: "Error Inesperado" });
  }
};


controller.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await Users.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(404).json({ error: "El usuario no existe" });
    }

    if (!user.comparePassword(password)) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const { _id, username, email, id_rol } = user;
    const rolName = await Rol.findById( id_rol )

    return res.status(200).json({status: "ok", data: {
          user: { _id, username, email },
          role: rolName.rol,
        },
      });

  } catch (error) {
    debug({ error });
    return res.status(500).json({ error: "Error Inesperado" });
  }
};

controller.verifyPassword = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await Users.findOne( {_id:identifier} );

    if (!user.comparePassword(password)) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }    

    return res.status(200).json({status: "ok"});

  } catch (error) {
    debug({ error });
    return res.status(500).json({ error: "Error Inesperado" });
  }
};

module.exports = controller;