const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// localhost: 3000

app.get('/', (req,res)=> {
    res.status(200).json({ scucess: "true", message: "Hello World" })
})

app.listen(port, () => {
    console.log('Example app listening at http://localhost:${port}')
})