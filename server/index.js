require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        /\.vercel\.app$/
    ],
    credentials: true
}))

app.use(express.json({ limit: '10mb' }))

const reviewRoute = require('./routes/review')
app.use('/review', reviewRoute)

app.get('/', (req, res) => {
    res.json({ message: 'REVER API is running' })
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})