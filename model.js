const {Sequelize, DataTypes} = require("sequelize");



const sequelize = new Sequelize(process.env.DATABASE,process.env.USER,process.env.PASSWORD,{
    host: process.env.HOST,
    port: process.env.PORT,
    dialect: 'postgres'
})

// const User = sequelize.define('ton2_user', {
//     telegram_id: {
//         type: DataTypes.BIGINT,
//         allowNull: false,
//         unique: true
//     },
//     telegram_username: {
//         type: DataTypes.STRING,
//         allowNull: true
//     },
//     balance: {
//         type: DataTypes.BIGINT,
//         allowNull: true
//     },
//     referred:{
//         type: DataTypes.BIGINT,
//         allowNull: true
//     },
//     automate: {
//         type: DataTypes.BOOLEAN,
//         default: false
//     }
// },{
//     timestamps: true
// });

const User = sequelize.define('ton3_user', {
    telegram_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    telegram_username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    balance: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0
    },
    referred:{
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0
    },
    automate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
},{
    timestamps: true
});


module.exports = {
    sequelize,
    User
    
}