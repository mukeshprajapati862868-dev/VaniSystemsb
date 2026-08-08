const User = require("../models/User");


// Create Default Admin
exports.createAdmin = async (req, res) => {

    try {

        const adminEmail = "admin@vanisystems.com";
        const adminPassword = "Vani2003";


        const existingAdmin = await User.findOne({
            email: adminEmail
        });


        if(existingAdmin){

            return res.status(200).json({
                success:true,
                message:"Admin already exists"
            });

        }


        const admin = await User.create({

            name:"Vani Systems Admin",

            email:adminEmail,

            password:adminPassword,

            phone:"9999999999",

            location:"",

            address:"",

            role:"admin",

            isActive:true,

            isBlocked:false

        });



        res.status(201).json({

            success:true,

            message:"Admin created successfully",

            admin:{
                name:admin.name,
                email:admin.email,
                role:admin.role
            }

        });



    } catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

};