
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(process.env.STATIC_FOLDER));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function getCategory(productName) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Please provide the category for the product ${productName}. Only provide the category name, such as "phone", "laptop", "headphones", etc.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().toLowerCase(); // Normalize category name
}

app.post('/compare', async (req, res) => {
    try {
        let inp1 = req.body.p1;
        let inp2 = req.body.p2;

        const category1 = await getCategory(inp1);
        const category2 = await getCategory(inp2);

        if (category1 !== category2) {
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Category Mismatch</title>
                </head>
                <body>
                    <h1>Products do not belong to the same category!</h1>
                    <p>${inp1} belongs to category: ${category1}</p>
                    <p>${inp2} belongs to category: ${category2}</p>
                </body>
                </html>
            `);
            return;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `PLEASE COMPARE 15 SPECIFICATION OF THE PRODUCT ${inp1} and ${inp2} IN TABLE FORMAT. Please include a "Winner" column. The last row should display the price in Rs. Do not provide any error, only the table format is needed without any text.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Convert Gemini API response string into HTML table format
        const specificationText = text.replace(/\| (.+) \| (.+) \| (.+) \| (.+) \|/g, '<tr><th>$1</th><td>$2</td><td>$3</td><td>$4</td></tr>')
                                      .replace(/\|---\|---\|---\|---\|/g, '')
                                      .replaceAll('**', '');
        const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Comparison</title>
            
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
            <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');


            *{
                margin:0;
                padding:0;
                box-sizing:border-box;
                font-family: "Poppins", sans-serif;
            }
            
            body{
                padding: 30px;
                width:100%;
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
                background-image: url('./img/img6.png');;
                
                background-size:cover;
                background-repeat: no-repeat;
            }
            .spacer {
                height: 450px; /* adjust the height as needed */
            }
            .table-wrapper{
                border-radius: 20px;
                overflow:hidden;
                width:80%;
                height:80%;
                background-color:rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(5px);
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;

            }
            .table-wrapper>h2{
                background-color: rgba(170,170,170,0.2);
                backdrop-filter: blur(8px);
                width:100%;
                padding:20px 10px;
                text-align:center;
            }
            table {
                text-align:center;
                border-radius:20px;
                border:1px solid #000;
                border-collapse: collapse;
                width: 75%;
                background-color:#EEEEEE;
                overflow:hidden;
                margin:40px;
            }
            table tr:nth-child(2n){
                background-color:#DDDDDD;
            }
            table tr:hover{
                background-color:#CCCCCC;
                transition: 0.2s all;
            }
            th, td {
                padding: 12px 20px;
                text-align: left;
            }
            th {
                padding:8px 30px;
                font-weight: 700;
                color: #000;
            }

            .container{
                position: relative;
                width: 900px;
                display: flex;
                justify-content: space-around;
                margin-top:90px;
            }

            .text{
                position: relative;
                color : #777;
                margin-top: 20px;
                font-weight: 700;
                font-size: 18px;
                letter-spacing: 1px;
                text-transform: uppercase;
                transition: 0.5s;

            }
            .logo-container {
                position: absolute;
                top: -25px;
                left: -2px;
            }
            .logo {
                width: 250px;/* set logo size */
                height: auto;
                transition: transform 0.2s ease-in-out;
            }
            .logo:hover {
                transform: scale(0.9); /* increase the size of the logo on hover */
            }
            
            nav {
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 60px;
            }

            nav ul {
                list-style-type: none;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            nav ul li {
                margin: 0 25px; /* Adjust the gap between items */
            }

            nav ul li a {
                display: block;
                background: linear-gradient(to top, black,white,white); /* Gradient color from white to black */
                -webkit-background-clip: text; /* Clip the text to the background color */
                -webkit-text-fill-color: transparent; /* Make the text transparent */
                text-align: center;
                padding: 14px 16px;
                text-decoration: none;
                border-radius: 10px;
                font-family: 'Roboto', sans-serif;
                font-size: 18px;
                font-weight: 500;
                transition: background-color 0.3s ease;
            }

            nav ul li a:hover {
                background: linear-gradient(to bottom , #ffa915, #ffa915,#ffa915,rgb(40, 40, 40),rgb(40, 40, 40));
                -webkit-background-clip: text;
                -webkit-text-fill-color: text;
            }
            nav ul li a:active {
                transform: scale(0.95); /* Apply scale transformation when the link is actively being clicked */
            }

            .move{
                position: absolute;
                top: -275px; /* Change this to adjust the distance from the top */
                left: 850px;
            }
            .animated-button {
                position: absolute;
                background-color: #1c182f; 
                top: 310px; /* Change this to adjust the distance from the top */
                left: 490px;/* Change this to your desired color */
                border: none;
                border-radius: 50px; /* Change this to adjust the roundness of the edges */
                color: white;
                cursor: pointer;
                font-size: 16px; /* Change this to adjust the size of the text */
                padding: 0px 35px; /* Change this to adjust the size of the button */
                text-align: center;
                text-decoration: none;
                display: inline-block;
                transition: all 0.3s; 
                width: 164px;
                height: 41px;
                z-index: 1;
            }

            .animated-button:hover {
                background-color: #231d3b; /* Change this to your desired hover color */
            }

            .animated-button:active {
                transform: scale(0.95); /* Change this to adjust the size of the button when clicked */
            }
            .btnstroke {
                width: 170px;
                height: 47px;
                background: -webkit-linear-gradient(left, #FF007A, #4563FF);
                border-radius: 30px;
                position: absolute;
                top: 307px;
                left: 487px;
                box-shadow: 10px 0px 20px rgba(0, 0, 0, 0.2);
            }

            .sign-in {
                position: absolute;
                background-color: #c6bbff00; 
                top: 33px; /* Change this to adjust the distance from the top */
                left: 1150px;/* Change this to your desired color */
                border: none;
                border-radius: 50px; /* Change this to adjust the roundness of the edges */
                color: white;
                cursor: pointer;
                font-size: 16px; /* Change this to adjust the size of the text */
                padding: 5px 25px; /* Change this to adjust the size of the button */
                text-align: center;
                transition: all 0.3s; 
                width: 170px;
                height: 47px;
            }
            .sign-in:hover {
                background-image: linear-gradient(to bottom, #ffa915, #ffa915, #000000); /* Specify the gradient direction and colors */
                -webkit-background-clip: text; /* Clip the text to the background color */
                -webkit-text-fill-color: transparent; /* Make the text transparent */
            }

            .sign-in:active {
                transform: scale(0.90); /* Change this to adjust the size of the button when clicked */
            }

            .midtext {
                position: absolute;
                top: 100px;
                left: 0px;
                text-align: center;
                font-size: 30px;
                margin-top: 100px;
            }

            .gradient-text {
                background: -webkit-linear-gradient(left, #FF007A, #4563FF);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .white-text {
                color: white;
            }

            .midtext p {
                font-size: 14px; /* Change the font size as needed */
                color: #ffffff; /* Change the color as needed */
                text-align: center; /* Center align the text */
                margin-top: -50px; /* Add some space between the heading and the paragraph */
                padding: 60px 280px;
                line-height: 2.5;
            }
            </style>
        </head>
        <body>
            <nav>
                <ul>
                <li data-aos="fade-down" data-aos-delay="100"><a href="./UI_FRONT_DESIGN/ux.html">Home</a></li>
                <li data-aos="fade-down" data-aos-delay="200"><a href="#categories">Categories</a></li>
                <li data-aos="fade-down" data-aos-delay="300"><a href="#contact">Contact</a></li>
                <li data-aos="fade-down" data-aos-delay="400"><a href="#about">About</a></li>
                </ul>
            </nav>
            <div class="midtext">
                <h1 data-aos="zoom-out">
                <span class="gradient-text">Simply Better</span>
                <span class="white-text">Every <br>Day</span>
                </h1>
                <p data-aos="zoom-out">Say goodbye to endless searches and hello to seamless comparisons – because choosing the perfect
                    product has never been easier! From smartphones to laptops, we've got you covered with comprehensive tables showcasing every 
                    feature and spec imaginable. Unveil the champion in each category with our intuitive 'Winner' column, guiding you to the ultimate
                    choice.</p>
            </div>
            <div class="spacer"></div>

            <div class="logo-container" data-aos="fade-right">
                <img src="./img/logo.png" alt="Logo" class="logo">
            </div>

            <div class='table-wrapper'>
                <h2>Comparison Table</h2>
                <table>
                    ${specificationText}
                </table>
            </div>
            <div class="move">
                <button class="animated-button">Compare</button>
                <div class="btnstroke"></div>
            </div>
            <button class="sign-in">Sign in</button>
            <script>
                AOS.init({
                    offset: 1,
                    duration: 600,
                });
                document.addEventListener('DOMContentLoaded', function() {
                    AOS.refresh();
                });
                window.addEventListener('load', AOS.refresh);
            </script>
        </body>
        </html>
        `;
        res.send(htmlResponse);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    console.log('Server started on port', port);
});
