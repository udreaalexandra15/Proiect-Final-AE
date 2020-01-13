var express = require("express")
var Sequelize = require("sequelize")
var sequelizeErd = require("sequelize-erd")
var fs = require("file-system")

//connect to mysql database
//baza de date, username, password
var sequelize = new Sequelize('catalog', 'username', 'password', {
    dialect:'mysql',
    host:'localhost',
     username:'root@localhost',
    password:'Password',
    operatorsAliases: false
})

sequelize.authenticate().then(function(){
    console.log('Success')
}).catch( function(err) {
    console.log(err)
})

//define a new Model
var Categories = sequelize.define('categories', {
    name: Sequelize.STRING,
    description: Sequelize.STRING
})

var Products = sequelize.define('products', {
    name: Sequelize.STRING,
    category_id: Sequelize.INTEGER,
    description: Sequelize.STRING,
    price: Sequelize.INTEGER,
    image: Sequelize.STRING
})

var Reviews = sequelize.define('reviews', {
    product_id: Sequelize.INTEGER,
    name: Sequelize.STRING,
    content: Sequelize.STRING,
    score: Sequelize.INTEGER
})

Products.belongsTo(Categories, {foreignKey: 'category_id', targetKey: 'id'})
Products.hasMany(Reviews, {foreignKey: 'product_id'});


sequelizeErd({ source: sequelize }).then(function(svg) {
    fs.writeFileSync('./img/erd.svg', svg);
})


var app = express()

//access static files
app.use(express.static('admin'))
app.use('/admin', express.static('admin'))
app.use('/nodeadmin', express.static('nodeadmin'))
app.use('/img', express.static('img'))



app.use(express.urlencoded({extended: true})); 
app.use(express.json());  // to support URL-encoded bodies

app.get('/createdb', (request, response) => {
    sequelize.sync({force: true}).then(() => {
        response.status(200).send('tables created')
    }).catch((err) => {
        response.status(500).send('could not create tables')
    })
})

app.get('/createdata', (req, res) => {
    //TODO add some test data here
})

async function getCategories(request, response) {
    try {
        let categories = await Categories.findAll();
        response.status(200).json(categories)
    } catch(err) {
        response.status(500).send('something bad happened')
    }
}

// get a list of categories
app.get('/categories', getCategories)

// get one category by id
app.get('/categories/:id', function(request, response) {
    Categories.findOne({where: {id:request.params.id}}).then(function(category) {
        if(category) {
            response.status(200).send(category)
         
        } else {
            response.status(404).send()
        }
    })
})

//create a new category
app.post('/categories', function(request, response) {
    Categories.create(request.body).then(function(category) {
        response.status(201).send(category)
        response.redirect('/categories')
    })
})

app.put('/categories/:id', function(request, response) {
    Categories.findById(request.params.id).then(function(category) {
        if(category) {
            category.update(request.body).then(function(category){
                response.status(201).send(category)
            }).catch(function(error) {
                response.status(200).send(error)
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.delete('/categories/:id', function(request, response) {
    Categories.findById(request.params.id).then(function(category) {
        if(category) {
            category.destroy().then(function(){
                response.status(204).send()
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.get('/products', function(request, response) {
    Products.findAll(
        {
            include: [{
                model: Categories,
                where: { id: Sequelize.col('products.category_id') }
            }, {
                model: Reviews,
                where: { id: Sequelize.col('products.id')},
                required: false
            }]
        }
        
        ).then(
            function(products) {
                response.status(200).send(products)
                
            }
        )
      
})

app.get('/products/:id', function(request, response) {
    Products.findById(request.params.id, {
            include: [{
                model: Categories,
                where: { id: Sequelize.col('products.category_id') }
            }, {
                model: Reviews,
                where: { id: Sequelize.col('products.id')},
                required: false
            }]
        }).then(
            function(product) {
                response.status(200).send(product)
            }
        )
})

app.post('/products', function(request, response) {
    Products.create(request.body).then(function(product) {
        response.status(201).send(product)
       
    })
})

app.put('/products/:id', function(request, response) {
    Products.findById(request.params.id).then(function(product) {
        if(product) {
            product.update(request.body).then(function(product){
                response.status(201).send(product)
            }).catch(function(error) {
                response.status(200).send(error)
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.delete('/products/:id', function(request, response) {
    Products.findById(request.params.id).then(function(product) {
        if(product) {
            product.destroy().then(function(){
                response.status(204).send()
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.get('/categories/:id/products', function(request, response) {
    Products.findAll({
            where:{category_id: request.params.id},
            
            include: [{
                model: Categories,
                where: { id: Sequelize.col('products.category_id') }
            }, {
                model: Reviews,
                where: { id: Sequelize.col('products.id')},
                required: false
            }]
        }
            ).then(
            function(products) {
                response.status(200).send(products)
            }
        )
})



// app.get('/reviews', function(request, response) {
//     Reviews.findAll(
//         {
//             include: [{
//                 model: Products,
//                 where: { id: Sequelize.col('Reviews.product_id') }
//             }]
//         }
        
//         ).then(
//             function(reviews) {
//                 response.status(200).send(reviews)
                
//             }
//         )
      
// })


app.get('/reviews', function(request, response) {
    Reviews.findAll().then(function(reviews){
        response.status(200).send(reviews)
    })
})

app.get('/reviews/:id', function(request, response) {
     Reviews.findById(request.params.id, {
            include: [{
                model: Reviews,
                where: { id: Sequelize.col('reviews.product_id') }
            }, {
                model: Reviews,
                where: { id: Sequelize.col('reviews.id')},
                required: false
            }]
        }).then(
            function(reviews) {
                response.status(200).send(reviews)
            }
        )
})

app.post('/reviews', function(request, response) {
    Reviews.create(request.body).then(function(review) {
        response.status(201).send(review)
    })
})

app.put('/reviews/:id', function(request, response) {
    
})

app.delete('/reviews/:id', function(request, response) {
    
})

app.listen(8080)
