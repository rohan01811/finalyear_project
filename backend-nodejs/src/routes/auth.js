// backend-nodejs/src/routes/auth.js
const model = require("../config.js")
const bcrypt = require("bcrypt")
const express = require("express")
const jwt = require("jsonwebtoken")
const mailer = require("nodemailer")

const dotenv = require("dotenv")
dotenv.config()

const router = express.Router();

const transporter = mailer.createTransport({
    service : "gmail",
    auth:{
        user:process.env.APP_EMAIL,
        pass:process.env.APP_PASSCODE
    }
})



const emaiBody =`
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #2E86C1;">🚀 Project Spotlight: JobReadyPro – AI-Powered Mock Interview & Resume Platform</h2>

    <p>Hello,</p>

    <p>We’re excited to introduce <strong>JobReadyPro</strong> – a full-stack platform designed to empower job seekers through intelligent interview simulation, resume analysis, and targeted job discovery.</p>

    <h3 style="color: #1F618D;">✨ Key Features:</h3>
    <ul>
      <li><strong>AI-Powered Mock Interviews:</strong> Built using <em>React</em> (frontend) with <em>FastAPI</em> and <em>Node.js</em> (backend), and powered by <strong>GPT-4o Mini</strong> via <em>LangChain</em> for real-time, dynamic question generation.</li>
      <li><strong>Emotion & Engagement Tracking:</strong> Integrated <em>OpenCV</em> and <em>DeepFace</em> to perform real-time facial and emotional analysis during interviews.</li>
      <li><strong>Resume Scoring with Gemini Flash:</strong> Leverages <em>Gemini 2.0 Flash</em> to score resumes against ATS criteria and provide actionable HR-style feedback.</li>
      <li><strong>Smart Job Search:</strong> Enables job discovery via the <em>JSearch API</em>, matched intelligently based on resume content.</li>
    </ul>

    <p style="margin-top: 20px;">JobReadyPro combines cutting-edge AI with a job-seeker-first approach to enhance confidence, skill, and employability.</p>

    <p>Thanks & Regards, <br><strong>Prajwal Dumbre</strong><br><a href="mailto:prajwaldumbre@gmail.com">prajwaldumbre@gmail.com</a></p>
  </div>
`


const sendMail = async(to)=>{
    try{
        console.log(to)
        const info = await transporter.sendMail({
            from : process.env.APP_EMAIL,
            to:to,
            subject :"Sign in at JobReadyPro",
            html:emaiBody
        })
        console.log(" Email sent:", info.response);
    }catch(err){
        console.log(err)
    }
}

router.post("/login", async (req, res) => {
    try {
        const check = await model.findOne({ "email": req.body.email })
        if (!check) {
            res.status(404).json({ "message": "User doesn't exist" })
        } else {
            if (check.email == req.body.email && check.password== req.body.password) {
                const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, { expiresIn: "1h" })
                
                return res.status(200).json({ "token": token, "username":check.name })
            }
            else {
                return res.status(401).json({ "message": "Login ID and password doesn't match" })
            }
        }
    } catch (e) {
        return res.status(500).json({ "message": "Internal server error" })
    };

})

router.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }

        const isExist = await model.findOne({ "email": data.email })
        if (isExist) {
            return res.status(400).json({ "message": "User already exist" })
        }
        else {         
            const userdata = new model(data);
            await userdata.save()
            await sendMail(req.body.email)
            return res.status(200).json({ "message": "User added successfully!" })
        }
    }
    catch (err) {
        return res.status(500).json({ "message": "Internal server error" })
    }
})

module.exports = router