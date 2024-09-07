# My Pinterest Clone Project

#### Video Demo: [https://youtu.be/N_FHQOo48Qg]

#### Description:

I created a Pinterest clone with custom features and professional approach. The project utilizes MongoDB to store user information and posts. Each post is linked to the user's ID, allowing us to track who posted it. Users can like, delete posts, and set their profile pictures.

For image storage, I used Cloudinary. This approach reduces server load by storing images externally, leading to a smoother user experience and better performance of the web application.

#### Files:

- **public/**: it contains all static files including stylesheets (CSS), images, and JavaScript files.
- **routes/**:
  - `index.js`: Handles GET and POST requests, it renders all the pages called via certain urls.
  - `multer.js`: Manages file uploads with `multer`, i made changes for it to upload file to cloudinary(cloud-based-server)..
  Cloudinary stores the image in its original format and send the image to required requests and as a result images not being stored in server itself make web-application efficient
  - `posts.js`: Defines the schema for post data.
  - `users.js`: Defines the schema for user data.
- **views/**: Contains EJS templates like `feed.ejs`, `login.ejs`, etc.
- **app.js**: Manages middleware, imports libraries like Passport for authentication, and handles session management.
- **package.json**: Manages project dependencies and scripts.
- **other JSON files**: Configuration files or data files that support project functionality.

#### Design Choices:

- **Professional Appearance:** Focused on creating a clean, professional look for the application to enhance user experience.
- **Efficient:** Implemented Cloudinary for image storage to reduce server load and improve application performance.
- **Robust Data Management:** Used MongoDB to manage user and post data efficiently and offer scalability.

#### Build:

- Build & Run section added to specify how to start the server and build CSS using npm start and npm run build.
                                                        
