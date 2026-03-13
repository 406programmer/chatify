import express from 'express'

const router = express.Router()
router.get('/send',(req,res)=>{
    res.send("send route")
})

export default router