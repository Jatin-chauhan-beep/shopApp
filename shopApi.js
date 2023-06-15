let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header(
"Access-Control-Allow-Methods",
"GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
);
res.header(
"Access-Control-Allow-Headers",
"Origin, X-Requested-With, Content-Type, Accept"
);
next();
});
const port = process.env.PORT||2410;
app.listen(port, () => console.log(`Listening on port ${port}!`));

let {shopsData}=require("./shopsData");
let {shops,products,purchases}=shopsData;
let fs=require("fs");
let fname="shop.json";

/*app.get("/resetData",function(req,res){
    let shopsArr=JSON.stringify(shopsData);
    fs.writeFile(fname,shopsArr,(err)=>{
        if(err) res.status(404).send(err);
        else res.send("data in files is reset");
    });
});*/

app.get("/shops",function(req,res){
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            res.send(shopsArr.shops);
        }
    });
});

app.post("/shops",function(req,res){
    let body=req.body;
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            let maxid=shopsArr.shops.reduce((acc,curr)=>curr.shopId>acc ? curr.shopId : acc,0);
            let id=maxid+1;
            shopsArr.shops.push({shopId : id,...body});
            let data1=JSON.stringify(shopsArr);
            fs.writeFile(fname,data1,(err)=>{
                if(err) res.status(404).send(err);
                else 
                res.send(body);
            });
        }
    });
});

app.get("/products",function(req,res){
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            res.send(shopsArr.products);
        }
    });
});

app.post("/products",function(req,res){
    let body=req.body;
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            let maxid=shopsArr.products.reduce((acc,curr)=>curr.productId>acc ? curr.productId : acc,0);
            let id=maxid+1;
            shopsArr.products.push({productId : id,...body});
            let data1=JSON.stringify(shopsArr);
            fs.writeFile(fname,data1,(err)=>{
                if(err) res.status(404).send(err);
                else 
                res.send(body);
            });
        }
    });
});

app.put("/products/:id",function(req,res){
    let body=req.body;
    let id=+req.params.id;
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
           let index=shopsArr.products.findIndex(f=>f.productId===id);
           if(index>=0){
            let Updatedproduct={...shopsArr.products[index],...body};
            shopsArr.products[index]=Updatedproduct;
           
            let data1=JSON.stringify(shopsArr);
            fs.writeFile(fname,data1,(err)=>{
                if(err) res.status(404).send(err);
                else 
                res.send(Updatedproduct);
            });
        }
        else res.status(404).send("no product Found");
        }
    });
});

app.get("/purchases",function(req,res){
    let shop=+req.query.shop;
    let product=req.query.product;
    let sort=req.query.sort;
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            let arr1=shopsArr.purchases;
            if (product) {
                let productList = product.split(",");
                arr1 = arr1.filter(f => productList.includes(f.productid.toString()));
              }
            if(shop){
                arr1=arr1.filter(f=>f.shopId==shop);
            }
            if(sort=="QtyAsc"){
                arr1=arr1.sort((p1,p2)=>p1.quantity-p2.quantity);
            }
            if(sort=="QtyDesc"){
                arr1=arr1.sort((p1,p2)=>p2.quantity-p1.quantity);
            }
            if(sort=="ValueAsc"){
                arr1=arr1.sort((p1,p2)=>(p1.quantity*p1.price)-(p2.quantity*p2.price));
            }
            if(sort=="ValueDesc"){
                arr1=arr1.sort((p1,p2)=>(p2.quantity*p2.price)-(p1.quantity*p1.price));
            }
            res.send(arr1);
        }
    });
});

app.get("/purchases/shops/:id",function(req,res){
    let id=+req.params.id;
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            let arr1=shopsArr.purchases.filter(f=>f.shopId==id);
            res.send(arr1);
        }
    });
});

app.get("/purchases/products/:id",function(req,res){
    let id=+req.params.id;
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            let arr1=shopsArr.purchases.filter(f=>f.productid==id);
            res.send(arr1);
        }
    });
});

app.get("/totalPurchase/shop/:id",function(req,res){
    let id=+req.params.id;
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            const productTotals = shopsArr.purchases
  .filter(purchase => purchase.shopId === id)
  .map(purchase => {
    const product = shopsArr.products.find(product => product.productId === purchase.productid);
    return {
        productId:product.productId,
      productName: product.productName,
      category: product.category,
      description: product.description,
      totalPurchase: purchase.quantity * purchase.price
    };
  });
            res.send(productTotals);
        }
    });
});

app.get("/totalPurchase/product/:id", function(req, res) {
    let productId = +req.params.id;
    fs.readFile(fname, "utf8", (err, data) => {
      if (err) {
        res.status(404).send(err);
      } else {
        let shopsArr = JSON.parse(data);
        const productTotals = shopsArr.purchases
          .filter(purchase => purchase.productid === productId)
          .map(purchase => {
            const shop = shopsArr.shops.find(shop => shop.shopId === purchase.shopId);
            return {
              shopId: shop.shopId,
              name: shop.name,
              rent:shop.rent,
              totalPurchase: purchase.quantity * purchase.price
            };
          });
        res.send(productTotals);
      }
    });
  });

  app.post("/purchases",function(req,res){
    let body=req.body;
    fs.readFile(fname,"utf8",(err,data)=>{
        if(err) res.status(404).send(err);
        else{
            let shopsArr=JSON.parse(data);
            let maxid=shopsArr.purchases.reduce((acc,curr)=>curr.purchaseId>acc ? curr.purchaseId : acc,0);
            let id=maxid+1;
            shopsArr.purchases.push({purchaseId : id,...body});
            let data1=JSON.stringify(shopsArr);
            fs.writeFile(fname,data1,(err)=>{
                if(err) res.status(404).send(err);
                else 
                res.send(body);
            });
        }
    });
});

  
