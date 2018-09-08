var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');

var connection = mysql.createConnection({host: "localhost", port: 3306, user: "admin", password: "password1", database: "BAMAZON"});
var sql;

app();

function app() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Please select an option',
            name: 'managerOptions',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product','Quit']
        }
    ]).then(function(managerInput) {

        switch (managerInput.managerOptions) {
            case 'View Products for Sale':
                diplayAllProducts() 
                break;
            case 'View Low Inventory':
                diplayLowInventory()
                break;
            case 'Add to Inventory':
                addItemStock();
                break;
            case 'Add New Product':
                addNewItem()
                break;
            case 'Quit':
                quit();
                break;                
        }
    });
}

function addItemStock() { 
    inquirer.prompt([
        {
            type: 'input',
            message: 'Product Code to update: ',
            name: 'itemCode'
        },
        {
            type: 'input',
            message: 'Quantity of stock to add to inventory: ',
            name: 'updateItemCodeStock'
        }
    ]).then(function(managerInput) {

        let selectSql = "SELECT STOCK FROM PRODUCTS WHERE ID_ITEM = ?";

        let itemCode = managerInput.itemCode
        let updateItemCodeStock = parseInt(managerInput.updateItemCodeStock)

        connection.query(selectSql, [itemCode],function(error, result) { 
            if (error) throw error;
            
            let itemCodeStock = parseInt(result[0].STOCK);

            console.log('Current stock is ' + itemCodeStock);
            itemCodeStockNew = itemCodeStock + updateItemCodeStock;
            console.log('New stock is ' + itemCodeStockNew);

            let updateSql = "UPDATE PRODUCTS SET STOCK = ? ";
            updateSql = updateSql + "WHERE ID_ITEM = ?";
    
            connection.query(updateSql, [itemCodeStockNew, itemCode],function(error, result) { 
                if (error) throw error;
    
                app();
            });
        });
    });
}

function addNewItem() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Department number: ',
            name: 'departmentNumber'
        },
        {
            type: 'input',
            message: 'Product Name: ',
            name: 'productName'
        },
        {
            type: 'input',
            message: 'Price: ',
            name: 'price'
        },
        {
            type: 'input',
            message: 'Stock: ',
            name: 'stock'
        }
    ]).then(function(managerInput) {

        let departmentNumber = parseInt(managerInput.departmentNumber);
        let productName = managerInput.productName;
        let price = parseFloat(managerInput.price);
        let stock = parseInt(managerInput.stock);

        let insertSql = "INSERT INTO PRODUCTS (ID_DEPARTMENT, PRODUCT_NAME, PRICE, STOCK, PRODUCT_SALES) VALUES(?,?,?,?,?)";

        connection.query(insertSql, [departmentNumber,productName,price,stock,0],function(error, result) { 
            if (error) throw error;
            
            selectSql = "SELECT ID_ITEM AS 'Product Code', PRODUCT_NAME as 'Product Name', PRICE as 'Price', ";
            selectSql += "STOCK as 'Stock', PRODUCT_SALES as 'Sales Totals' ";
            selectSql += "FROM PRODUCTS WHERE ID_ITEM = (SELECT MAX(ID_ITEM) FROM PRODUCTS)";
    
            connection.query(selectSql,function(error, result) { 
                if (error) throw error;
                console.table('*** New Product Added ***', result);
                app();
            });
        });
    });
}

function diplayProduct(itemCode) {
    sql = "SELECT ID_ITEM AS 'Product Code', PRODUCT_NAME as 'Product Name', PRICE as 'Price', ";
    sql += "STOCK as 'Stock', PRODUCT_SALES as 'Sales Totals' ";
    sql += "FROM PRODUCTS WHERE ID_ITEM = ?";

    connection.query(sql, [itemCodeStock] ,function(error, result) {
        if (error) throw error;
        for (let i = 0; i < result.length; i++) {
            result[i].Price = '$' + result[i].Price;
        }
        console.table(result);
    });
}

function diplayAllProducts() {
    sql = "SELECT ID_ITEM AS 'Product Code', PRODUCT_NAME as 'Product Name', PRICE as 'Price', ";
    sql += "STOCK as 'Stock', PRODUCT_SALES as 'Sales Totals' FROM PRODUCTS";

    connection.query(sql, function(error, result) {
        if (error) throw error;
        for (let i = 0; i < result.length; i++) {
            result[i].Price = '$' + result[i].Price;
        }
        console.table('*** All Products ***',result);
        app();
    });
}

function diplayLowInventory() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'View low stock items below quantity: ',
            name: 'lowStockThreshhold'
        }
    ]).then(function(managerInput) {

        threshhold = managerInput.lowStockThreshhold;

        sql = "SELECT ID_ITEM AS 'Product Code', PRODUCT_NAME as 'Product Name', PRICE as 'Price', ";
        sql = sql + "STOCK as 'Stock', PRODUCT_SALES as 'Sales Totals' ";
        sql = sql + "FROM PRODUCTS WHERE STOCK <= " + threshhold;

        connection.query(sql, function(error, result) {
            if (error) throw error;
            // for (let i = 0; i < result.length; i++) {
            //     result[i].Price = '$' + result[i].Price;
            // }
            console.table('*** Low Inventory Products ***',result);
            app();
        });
    });
}

function quit() {
    inquirer.prompt([
        {
            type: 'confirm',
            message: 'Are you sure you want to quit?',
            name: 'quit'
        }
    ]).then(function(managerInput) { 
        if (!managerInput.quit) {
            app();
        } else {
            connection.end();
        }
    });
}


