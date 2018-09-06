var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');

var connection = mysql.createConnection({host: "localhost", port: 3306, user: "admin", password: "password1", database: "BAMAZON"});
let sql;
let total = 0;

diplayAllProducts();

function app() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Please choose a product by Product Code',
            name: 'selectedProductCode'
        },
        {
            type: 'input',
            message: 'How many would you like',
            name: 'selectedQuantity',
            validate: function(value) {
                if (isNaN(value) === false) {
                return true;
                }
                return false;
            }
        }
    ]).then(function(userInput) {

        sql = "SELECT ID_ITEM, PRICE, STOCK, PRODUCT_SALES ";
        sql = sql + "FROM PRODUCTS ";
        sql = sql + "WHERE ID_ITEM = ?";

        connection.query(sql, userInput.selectedProductCode, function(err, result) {

            if (userInput.selectedQuantity > result[0].STOCK) {
                console.log('We are apologize. We do not have sufficient quantities to fulfill your order.');
                nextItem();
            } else {
                let productCode = parseInt(userInput.selectedProductCode);
                total = parseFloat((total + (userInput.selectedQuantity * result[0].PRICE)).toFixed(2));
                let newProductSales = result[0].PRODUCT_SALES + total
                let newStockQuantity = result[0].STOCK - userInput.selectedQuantity;
                console.log('Your current order total is: $' + total);

                //Update the stock quantity
                sql = "UPDATE PRODUCTS SET STOCK = ?, PRODUCT_SALES = ? ";
                sql = sql + "WHERE ID_ITEM = ?";
                connection.query(sql, [newStockQuantity,newProductSales,productCode],function(error, result) { 
                    if (error) throw error;

                    nextItem();
                });
            }
        });
    });
}

function nextItem() {
    inquirer.prompt([
        {
            type: 'confirm',
            message: 'Do you want to buy another item?',
            name: 'nextItem'
        }
    ]).then(function(userInput) { 
        if (userInput.nextItem) {
            if (userInput.reprint) {
                diplayAllProducts();
            } else {
                app();
            }
        } else {
            connection.end();
        }
    });
}

function diplayAllProducts() {
    sql = "SELECT ID_ITEM AS 'Product Code', PRODUCT_NAME as 'Product Name', PRICE as 'Price'";
    sql = sql + " FROM PRODUCTS";

    connection.query(sql, function(err, result) {
        for (let i = 0; i < result.length; i++) {
            result[i].Price = '$' + result[i].Price;
        }
        console.table('Bamazon Products',result);
        app();
    });
}



