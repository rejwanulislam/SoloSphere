// require('crypto').randomBytes(64)
// require('crypto').randomBytes(64).toString('hex')

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const app = express()

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const veryfyToken = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).send({ message: 'unauthhorize' })
  }
  jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: 'error unauthhorize' })
    }
    req.user = decoded
    console.log(token)
    next()
  })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0xslwlb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const jobscollection = client.db("SoloSphere").collection("jobs")
    const bidsscollection = client.db("SoloSphere").collection("bids")



    //////////////jwt


    app.post('/jwt', async (req, res) => {
      const email = req.body
      //creact token
      const token = jwt.sign(email, process.env.SECRET_KEY, { expiresIn: '365d' })
      // console.log(token)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      }

      ).send({ success: true })
    })

    //clear cookie from browger
    app.get('/logout', async (req, res) => {
      res.clearCookie('token',
        {
          maxAge: 0,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        }).send({ success: true, message: 'Clear Cookie' })


    })



    app.post('/addjob', async (req, res) => {
      const jobdata = req.body
      const result = await jobscollection.insertOne(jobdata)
      console.log(result)
      res.send(result)
    })

    app.get('/jobs', async (req, res) => {
      const result = await jobscollection.find().toArray()
      res.send(result)
    })

    //get all job posted for specific user
    app.get('/jobs/:email', async (req, res) => {
      const email = req.params.email
      const quary = { 'bayer.email': email }
      const result = await jobscollection.find(quary).toArray()
      res.send(result)
    })
    //delet posted job
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id
      const quary = { _id: new ObjectId(id) }
      const result = await jobscollection.deleteOne(quary)
      res.send(result)
    })

    //get a single data
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id
      const quary = { _id: new ObjectId(id) }
      const result = await jobscollection.findOne(quary)
      res.send(result)
    })
    //update job data
    app.put('/updatejob/:id', async (req, res) => {
      const jobdata = req.body
      const id = req.params.id
      const updatedoc = {
        $set: jobdata
      }
      const quary = { _id: new ObjectId(id) }

      const result = await jobscollection.updateOne(quary, updatedoc)
      res.send(result)
    })


    //get all jobs   

    app.get('/alljobs', async (req, res) => {
      const filter = req.query.filter
      const search = req.query.search
      const sort = req.query.sort
      let option = {}
      if (sort) option = { sort: { dedline: sort == 'asc' ? 1 : -1 } }
      let quary = {
        job_title: {
          $regex: search,
          $options: 'i'
        }
      }
      if (filter) quary.category = filter
      const result = await jobscollection.find(quary, option).toArray()
      res.send(result)
    })

    //did data

    app.post('/addbid', async (req, res) => {

      const biddata = req.body

      //2. if a user allrady bids in a job is valideshion
      const quary = { email: biddata.email, JobId: biddata.JobId }
      const allradyExist = await bidsscollection.findOne(quary)
      if (allradyExist) return res.status(401).send('you allradu bids in this job')

      //1. save data in bidsscollection
      const result = await bidsscollection.insertOne(biddata)
      console.log(result)



      //3. increase bid countt in jobcollection
      const filter = { _id: new ObjectId(biddata.JobId) }
      const update = {
        $inc: { bid_count: 1 }
      }
      const updateBidcount = await jobscollection.updateOne(filter, update)


      res.send(result)
    })

    //get all data for bids in a spacick user
    app.get('/bids/:email', veryfyToken, async (req, res) => {
      const decodedEmail = req.user?.email

      console.log(decodedEmail)
      const email = req.params.email
      if (decodedEmail !== email) {
        return res.status(401).send({ message: 'error unauthhorize' })

      }
      //ki আর ভ্যালু যদি এক হয় তাহলে শুধু ki লিখলেই হয়
      const isBayer = req.query.bayer
      console.log(isBayer)
      let quary = {}
      if (isBayer) {
        quary.bayer = email
        console.log('11111')
      } else {
        quary.email = email
        console.log('222222')
      }
      console.log(quary)

      const result = await bidsscollection.find(quary).toArray()
      res.send(result)


    })

    //get all data for bids in a job
    app.get('/bidrequest/:email', async (req, res) => {
      const email = req.params.email

      const quary = { bayer: email }
      const result = await bidsscollection.find(quary).toArray()
      res.send(result)


    })
    //status update
    app.patch('/bidstatusupdate/:id', async (req, res) => {
      const id = req.params.id
      const { status } = req.body
      const filter = { _id: new ObjectId(id) }
      const update = {
        $set: { status }
      }
      const result = await bidsscollection.updateOne(filter, update)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
