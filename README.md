**The University of Melbourne**

# INFO30005 Web Information Technologies Project

Welcome!

## Table of contents

- [INFO30005 – Web Information Technologies](#info30005--web-information-technologies-project)
  - [Table of contents](#table-of-contents)
  - [Team Members](#team-members)
  - [General info](#general-info)
  - [Live Link](#live-link)
  - [Technologies](#technologies)
  - [Adding Images](#adding-images)
  - [Postman Requests](#postman-requests)
  - [Access Details to Database](#access-details-to-database)
  - [Login Details to Website](#login-details-to-website)
  - [Tasks](#tasks)

## Team Members

|     Name      |                    Task                     |  Status   |
| :-----------: | :-----------------------------------------: | :-------: |
| Jun Cheng Woo |   Front-End, Back-End, Database, Postman    | Completed |
| Xinyue Zhang  |   Front-End, Database, Heroku Connection    | Completed |
| Zihang Zhang  |   Front-End, Database, Heroku Connection    | Completed |
|   Lilian Ly   | Front-End, Database, README Format, Postman | Completed |
|  Xinhui Chen  |             Back-End, Database              | Completed |

## General info

This project is built by Team Generator, a group of students in INFO30005 2021 Semester 1, based on the business requirements from Snacks in a Van, a startup company in Melbourne managing a fleet of mobile food trucks that operate as cafes. This operation involves the creation of a web app for customers and vendors to use, viewable through vertical mobile devices and horizontal tablets.

## Live Link

~~This project is hosted on Heroku. The live link can be accessed here:~~

~~https://project-t10-generator.herokuapp.com/~~

This project has now been migrated to and hosted on Render instead. The live link can be accessed below:

https://snack-in-a-van.onrender.com/

## Technologies

Project is created with:

- NodeJS (15.14.0)
- NPM (7.7.6)
- Express
- Handlebars
- MongoDB
- Mongoose

## Adding Images

Image values contained in MongoDB are Strings. They point to images that are hosted on https://unsplash.com/. To open up the image, append the String to https://source.unsplash.com/.

For example, to access "Cappuccino" photos from menu that has String "T-kJRC_xqFI" in images, visit https://source.unsplash.com/T-kJRC_xqFI

## Postman Requests

The following information explains how the Postman requests are to be performed. The file containing the requests can be located in the repository.

For all POST requests, navigate to the the "Headers" section and under "Keys", input "Content-Type" with a corresponding value of "application/json".

**Customer Features**

|       Feature        |                                                                                                                                                Description                                                                                                                                                 |                                                                   Access Link                                                                   |                                                                                                                          Request Type & Sample Data (If Applicable)                                                                                                                           |
| :------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  View customer menu  |                                                                 This shows a list of the menu items available, including the prices and the ID for the unsplash.com image. See above in [Adding Images](#adding-images) for more details.                                                                  |              ~~https://project-t10-generator.herokuapp.com/customer/menu~~ <br/> https://snack-in-a-van.onrender.com/customer/menu              |                                                                                                                                          GET Request                                                                                                                                          |
|  View Snack Details  |                        When entering the snack name, the snack details of that particular snack are displayed. The details include name, price, image and description. The access link to the right shows an example of what would be displayed when "small cake" snack is visited                         | ~~https://project-t10-generator.herokuapp.com/customer/menu/small%20cake~~ <br/> https://snack-in-a-van.onrender.com/customer/menu/small%20cake |                                                                                                                                          GET Request                                                                                                                                          |
| Start Customer Order | This request allows a customer to add an order. In the Postman file, the example shows a customer creating an order of 2 big cake. The orders begin from the page that contains the snack. In this instance, the user is required to first browse to the big cake's page, and then select a quantity of 2. |   ~~https://project-t10-generator.herokuapp.com/customer/menu/big%20cake~~ <br/> https://snack-in-a-van.onrender.com/customer/menu/big%20cake   | POST Request. Under body, input a "quantity" of 2. In the headers section, under key, input "customerID" with value of "2". When the website is implemented, the headers will already contain appropriate values and the only inputted values necessary by the customer will be the quantity. |

<br/><br/>

**Vendor Requests**

|         Feature         |                                                                                                                                          Description                                                                                                                                          |                                                                                                              Access Link                                                                                                              |                                                                                                                                                                  Request Type & Sample Data (if applicable)                                                                                                                                                                   |
| :---------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|   Setting Van Status    | This section demonstrates two requests types. The first is changing the status of the van to be online and therefore ready to accept orders. The second request allows the van send information about its most recent changed location. These features can be updated separately or together. | ~~https://project-t10-generator.herokuapp.com/vendor/Jhan~~ <br/> https://snack-in-a-van.onrender.com/vendor/Jhan <br/> Jhan refers to the name of a van, this can be changed, but for the purpose of this example, will be retained. | POST Request. In this request, the user will need to supply "isOnline" to the Boolean value of true. This will update the status of the van to online. For the second section, to send location, insert desired values for "latitude" and "longitude" as Number values. The test here has used 53.648874264916492 for the latitude and -75.227364723224930 for the longitude. |
| Show Outstanding Orders |                                                                    Orders that have the status "Cooking" will be shown when queried with the van's ID/name. This will show all outstanding orders for that particular van.                                                                    |                                               ~~https://project-t10-generator.herokuapp.com/vendor/Gogu/outstanding~~ <br/> https://snack-in-a-van.onrender.com/vendor/Gogu/outstanding                                               |                                                                                                                                                                                  GET Request                                                                                                                                                                                  |
|  Mark Fulfilled Orders  |                                                                                     This request allows for the van to mark an order as "Fulfilled" after it has been cooked and is available for pickup.                                                                                     |                                                       ~~https://project-t10-generator.herokuapp.com/vendor/orders/1~~ <br/> https://snack-in-a-van.onrender.com/vendor/orders/1                                                       |                                                                                                                                                        POST Request. In body, set the "status" to String "Fulfilled".                                                                                                                                                         |

<br/><br/>

## Access Details to Database

This project uses MongoDB as the database. The access details are as follows:

CONNECTION_STRING = "mongodb+srv://&lt;username&gt;:&lt;password&gt;@snack-in-a-van.cyw7xjo.mongodb.net/?retryWrites=true&w=majority"

<br/><br/>

## Login Details to Website

The login details for sample customer and vendor will be given here. The login details are as follows:

| Account Type | Username |       Email        |  Password   |
| :----------: | :------: | :----------------: | :---------: |
|   Customer   |    /     | customer@gmail.com | customer123 |
|    Vendor    |  Vendor  |         /          |  vendor123  |

<br/><br/>

## Tasks

**Now Get ready to complete all the tasks:**

- [x] Read the Project handouts carefully
- [x] User Interface (UI) Mockup
- [x] App Server Mockup
- [x] Front-End + Back-End (One Feature)
- [x] Complete System + Source Code
- [x] Report (+Test 1 Feature)

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
