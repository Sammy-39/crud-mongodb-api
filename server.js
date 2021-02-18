const express = require("express")
const cors = require("cors")
const mongodb = require("mongodb")

const port = process.env.PORT || 5000

const mongoClient = mongodb.MongoClient
const dbURL = `mongodb://sammy:sammydb@cluster0-shard-00-00.pvarl.mongodb.net:27017,cluster0-shard-00-01.pvarl.mongodb.net:27017,cluster0-shard-00-02.pvarl.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-wb3j6y-shard-0&authSource=admin&retryWrites=true&w=majority`

const app = express()

app.use(express.json())
app.use(cors())

app.get("/students",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{ useNewUrlParser: true, useUnifiedTopology: true })
        let db = client.db("studentsdb")
        let students = await db.collection("student").find().toArray()
        client.close()
        res.status(200).json(students)
    }
    catch(err){
        res.status(400).json({ message: err.message })
    }
})

app.get("/student/:id",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL)
        let db = client.db("studentsdb")
        let student = await db.collection("student").findOne({_id:mongodb.ObjectId(req.params.id)})
        client.close()
        if(!student){
            throw new Error("Id not found")
        }
        res.status(200).json(student)
    }
    catch(err){
        res.status(400).json({ message: err.message })
    }
})

app.post("/student", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL)
        let db = client.db("studentsdb")
        await db.collection("student").insertOne(req.body)
        client.close()
        res.status(200).json({
            message: "One document inserted"
        })
    }
    catch(err){
        res.status(400).json({ message: err.message })
    } 
})

app.put("/student/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL)
        let db = client.db("studentsdb")
        let stud = await db.collection("student").findOne({_id:mongodb.ObjectId(req.params.id)})
        if(stud)
        {
            await db.collection("student").updateOne({_id:mongodb.ObjectId(req.params.id)},{$set: req.body})
            client.close()
            res.status(200).json({
                message: "One document updated"
            })
        }
        else{
            await db.collection("student").insertOne(req.body)
            client.close()
            res.status(200).json({
                message: "Id not found. One document inserted"
            })
        }
    }
    catch(err){
        res.status(400).json({ message: err.message })
    } 
})

app.delete("/student/:id",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL)
        let db = client.db("studentsdb") 
        let deleteRes = await db.collection("student").deleteOne({_id:mongodb.ObjectId(req.params.id)})
        client.close()
        if(deleteRes.deletedCount===0){
            throw new Error("Id not found")
        }
        res.status(200).json({
            message : "Delete Success"
        })
    }
    catch(err){
        res.status(400).json({ message: err.message })
    } 
})
        
app.listen(port,()=>{
    console.log("Server running on http://localhost:"+port)
})
