# Petition to #protectpubliclands

The #protectpubliclands petition is a responsive, full stack application that gathers signatures and other user data in support of protecting public lands in Montana.

View online **[here](https://protect-public-lands.herokuapp.com)**

## Technologies
* **Frontend**: Handlebars.js
* **Backend**: Node.js, Express.js, PostgreSQL

## Description
I built this application in a week during my 12-week JavaScript-focused web development course at Spiced Academy. Right now, it's hosted on [Heroku](https://nbit-network.herokuapp.com/welcome#/).

From the landing page, users can view details about the petition and either register or login. Next, they are prompted to add more optional information to their profile.

![Petition  Preview 1](https://github.com/kaylarobertson3/public-lands-petition/blob/master/preview1.gif
 "Petition Preview 1")


Then, users can sign by drawing on the Canvas. The unique signature is encrypted and stored in the database.

![Petition  Preview 2](https://github.com/kaylarobertson3/public-lands-petition/blob/master/preview2.gif
 "Petition Preview 2")

Next, users are directer to a thank you page, which lets them delete their signature, edit their profile information, or view all signatures.

## Works in progress
* Mobile touch events for canvas (everything is responsive except for canvas signature)
* Redis
* CSURF
