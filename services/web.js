/* global server:writable, create:writable */
/* global db, account:writeable */

server = global.server
create = global.create

const CryptoJS = require('crypto-js')

server.app.get('/', (req, res) => {
  res.send('World of Cars API service.')
})

function verifyAuthorization (token) {
  return token === process.env.API_TOKEN
}

function generateRandomNumber () {
  return Math.floor(Math.random() * 101)
}

function generateToken (username) {
  const password = process.env.PASS
  const salt = process.env.SALT

  const iterations = 128

  const bytes = CryptoJS.PBKDF2(password, salt, { keySize: 48, iterations })
  const iv = CryptoJS.enc.Hex.parse(bytes.toString().slice(0, 32))
  const key = CryptoJS.enc.Hex.parse(bytes.toString().slice(32, 96))

  const data = {
    user: username,
    expiry: Math.floor(new Date().getTime() / 1000) + 10 * 60
  }

  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv })

  return ciphertext.toString()
}

async function handleWhoAmIRequest (req, res) {
  const ses = req.session

  let success = false
  let accountId = -1
  let userName = ''

  if (ses.success) {
    success = true
  }

  const root = create().ele('WhoAmIResponse')
  // root.ele('puppet_id').txt(101) // Mater Puppet

  const item = root.ele('success')
  item.txt(success)

  const status = root.ele('status')
  const user = root.ele('username')

  if (ses.logged && ses.username && ses.userId) {
    status.txt('logged_in_player')
    user.txt(ses.username)

    accountId = ses.userId
    userName = ses.username
  } else {
    status.txt('not_logged_in')
  }

  account = root.ele('account', { account_id: accountId })
  account.ele('first_name')
  account.ele('dname').txt(userName)
  account.ele('age').txt(0)
  account.ele('touAccepted').txt('basic')
  account.ele('access').txt('true')
  account.ele('speed_chat_prompt').txt('false')

  root.ele('userTestAccessAllowed').txt('false')
  root.ele('testUser').txt('false')

  const xml = root.end({ prettyPrint: true })
  res.setHeader('content-type', 'text/xml')
  res.send(xml)
}

server.app.get('/carsds/api/WhoAmIRequest', async (req, res) => {
  await handleWhoAmIRequest(req, res)
})

server.app.post('/carsds/api/WhoAmIRequest', async (req, res) => {
  await handleWhoAmIRequest(req, res)
})

server.app.get('/dxd/flashAPI/login', async (req, res) => {
  await db.handleFlashLogin(req, res)
})

server.app.post('/dxd/flashAPI/login', async (req, res) => {
  await db.handleFlashLogin(req, res)
})

server.app.post('/dxd/flashAPI/checkUsernameAvailability', async (req, res) => {
  const username = req.body.username
  const status = await db.isUsernameAvailable(username)

  const root = create().ele('response')
  root.ele('success').txt(status)

  if (!status) {
    // Specified username is taken, give some suggestions to choose from.
    const results = root.ele('results')

    const words = [
      'Amazing',
      'Cool',
      'Super',
      'Fantastic'
    ]

    const randomIndex = Math.floor(Math.random() * words.length)

    results.ele('suggestedUsername1').txt(`${username}${generateRandomNumber()}`)
    results.ele('suggestedUsername2').txt(`${username}${generateRandomNumber()}`)
    results.ele('suggestedUsername3').txt(`${words[randomIndex]}${username}`)
  }

  const xml = root.end({ prettyPrint: true })
  res.setHeader('content-type', 'text/xml')
  res.send(xml)
})

server.app.post('/dxd/flashAPI/createAccount', async (req, res) => {
  const status = await db.createAccount(req.body.username.toLowerCase(), req.body.password)
  const accountId = await db.getAccountIdFromUser(req.body.username)

  const root = create().ele('response')
  root.ele('success').txt(status)

  const results = root.ele('results')
  results.ele('userId').txt(accountId)

  const xml = root.end({ prettyPrint: true })
  res.setHeader('content-type', 'text/xml')
  res.send(xml)
})

server.app.post('/carsds/api/AccountLoginRequest', async (req, res) => {
  await db.handleAccountLogin(req, res)
})

server.app.get('/carsds/api/AccountLoginRequest', async (req, res) => {
  await db.handleAccountLogin(req, res)
})

server.app.get('/carsds/api/GameEntranceRequest', (req, res) => {
  const root = create().ele('GameEntranceRequestResponse')
  const item = root.ele('success')
  item.txt('true')

  const queue = root.ele('queue')
  const canEnter = queue.ele('can_enter_game')
  canEnter.txt('true')

  const xml = root.end({ prettyPrint: true })
  res.setHeader('content-type', 'text/xml')
  res.send(xml)
})

server.app.get('/carsds/api/GenerateTokenRequest', (req, res) => {
  const root = create().ele('GenerateTokenRequestResponse')

  const ses = req.session

  const item = root.ele('success')
  item.txt(ses ? 'true' : 'false')

  if (ses.username) {
    const token = root.ele('token')
    token.txt(process.env.LOCALHOST_INSTANCE === 'true' ? ses.username : generateToken(ses.username))
  }

  const xml = root.end({ prettyPrint: true })
  res.setHeader('content-type', 'text/xml')
  res.send(xml)
})

server.app.post('/carsds/api/internal/setCarData', async (req, res) => {
  if (!verifyAuthorization(req.headers.authorization)) {
    return res.status(401).send('Authorization failed.')
  }

  const data = req.body

  if (data.playToken && data.fieldData) {
    const car = await db.retrieveCar(data.playToken)
    Object.assign(car, data.fieldData)
    car.save()
    return res.status(200).send({ success: true, message: 'Success.' })
  }

  return res.status(501).send({ success: false, message: 'Something went wrong.' })
})

server.app.get('/carsds/api/internal/retrieveCar', async (req, res) => {
  if (!verifyAuthorization(req.headers.authorization)) {
    return res.status(401).send('Authorization failed.')
  }

  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(
    await db.retrieveCarFromUser(req.query.playToken),
    null,
    3)
  )
})
