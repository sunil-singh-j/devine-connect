const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;
const multer = require("multer");
const upload = multer({ dest: "../public/uploads/" }); // Destination folder for uploaded images
app.use("../src/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
const nodemailer = require('nodemailer');
mongoose.connect(
 
  //mongodburl 
  
  ,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
app.use(express.json()); // Middleware to parse JSON bodies

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to the database");
  // Initialize any necessary data or functions here
});

// Define schemas and models
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  age:String,
  gender:String,
  phoneNO:Number,
  password: String,
  

  bookings: [
    {
      temple_name:String,
      event_name:String,
      event_description:String,
      booking_id: String,
      temple_id: mongoose.Schema.Types.ObjectId,
      booking_date: Date,
      booking_time: String, // Assuming time is stored as a string
    },
  ],
  token: String,
});

const User = mongoose.model("User", userSchema);
// middle weres


// Middleware to check if user already exists
const checkUserExists = async (req, res, next) => {
  try {
    console.log("form checkuserExists");
    const { email, username } = req.body;

    // Check if user with the provided email exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.log("User with this email already exists");
      return res
        .status(400)
        .send({ message: "User with this email already exists" });
    }

    // Check if user with the provided username exists
    // If user does not exist, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};



const transporter = nodemailer.createTransport({
  service: 'Gmail', // Specify your email service provider
  auth: {
    user: 'sunil.singh.p9000@gmail.com', // Your email address
    pass: 'fxrz wqts dbdy kcei' // Your email password (or app password for Gmail)
  }
});

// Route to send OTP to the user's email
app.post('/send-otp',checkUserExists, async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Send email with OTP
    await transporter.sendMail({
      from: 'sunil.singh.p9000@gmail.com', // Sender's email address
      to: email, // Recipient's email address
      subject: 'OTP Verification', // Email subject
      text: `Your OTP for registration is: ${otp}` // Email body
    });

    res.status(200).send({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send({ error: 'Failed to send OTP.' });
  }
});

// Token Verification Middleware
function verifyToken(req, res, next) {
   

  const tokenHeader = req.header("Authorization");
  

  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .send({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = tokenHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, "your_secret_key");
   
    req.userId = decoded.userId;
   
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).send({ error: "Unauthorized: Invalid token" });
  }
}


// User Registration
app.post("/users", checkUserExists, async (req, res) => {
  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user object with the hashed password
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      age: req.body.age,
      gender: req.body.gender,
      phoneNO: req.body.phoneNO,
      bookings: req.body.bookings,
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).send(newUser);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({ error: "Bad Request" });
  }
});


// User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "1h",
    });
    res.cookie("token", token); 
    user.token = token;
    res.cookie("tokens", token);
    await user.save();
    res.send({ message: "Login successful" });
    console.log("token " + token);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Protected route 
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -token');
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});



const templeSchema = new mongoose.Schema({
  name: String,
  address:String,
  location: {
    type: { type: String },
    coordinates: [],
  },
  images: [String], // Store image IDs in the document
  about: String,
  username: String,
  password: String,
  token: String,
  last_booking_id: { type: Number, default: 2024 },
  bookings: [
    { 
      booking_id:String,
      user_id: String,
      index: Number,
      event_id: String,
      enabled: { type: Boolean, default: true }, // New field to enable/disable booking
    },
  ],
  booking_management: [
    {
      start_date: Date, // Start date of the range
      end_date: Date, // End date of the range
      start_time: String, // Start time of the range
      end_time: String, // End time of the range
      event_name: String, // New field for event name
      event_description: String, // New field for event description
      slots: { type: Number, default: 1 }, // Number of slots available within this range
      enabled: { type: Boolean, default: true }, // Enable/disable bookings within this range
    },
  ],
});

templeSchema.index({ location: "2dsphere" }); // Indexing for geospatial queries

const Temple = mongoose.model("Temple", templeSchema);

// Middleware to check if temple authority exists
const checkTempleAuthorityExists = async (req, res, next) => {
  try {
    const { username } = req.body;

    const existingTemple = await Temple.findOne({ username });
    console.log("from chekTempleAuthority");
    console.log("existing temple = " + existingTemple);
    if (existingTemple) {
      console.log("Temple authority with this username already exists");
      return res
        .status(400)
        .send({
          message: "Temple authority with this username already exists",
        });
    }

    // If temple authority does not exist, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
// Temple Authority Registration

app.post("/temples/register", upload.array("image", 5), checkTempleAuthorityExists, async (req, res) => {
  try {
      console.log("from register route");
      console.log("Body:", req.body);

      const { name,address, about, username, password, location, latitude, longitude } = req.body;
      const images = req.files; // Get uploaded images

      const hashedPassword = await bcrypt.hash(password, 10);

      const newTemple = new Temple({
          name,
          address,
          location: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          about,
          username,
          password: hashedPassword,
          token: "",
      });

      // Save the temple to the database to get its ID
      await newTemple.save();

      // Create a directory with the temple's ID as the name within the public/uploads folder
      const parentDir = path.resolve(__dirname, ".."); // Get the parent directory
      const siblingDir = path.join(parentDir, "public"); // Get the "public" directory as a sibling
      const uploadsDir = path.join(siblingDir, "uploads"); // Path to the "uploads" directory
      
      // Create a directory for the temple's images
      const templeDir = path.join(uploadsDir, `${newTemple._id}`);
      fs.mkdirSync(templeDir, { recursive: true }); // Create the temple's directory if it doesn't exist

      // Move the uploaded images to the created directory
      images.forEach((image, index) => {
          const ext = image.originalname.split(".").pop(); // Get file extension
          const imageName = `${index + 1}.${ext}`; // Sequential image name
          const imagePath = path.join(templeDir, imageName); // Path to save the image
          fs.renameSync(image.path, imagePath); // Move the image to the new path
          console.log("File stored at:", imagePath);
          newTemple.images.push(imageName); // Add image name to temple's images array
      });

      // Save the temple with updated images array
      await newTemple.save();

      res.status(201).send({ message: "Temple authority registered successfully" });
  } catch (error) {
      console.error("Error:", error);
      res.status(400).send({ error: "Bad Request" });
  }
});
// Temple Login Endpoint

app.post("/temples/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log();
    const temple = await Temple.findOne({ username });
    if (!temple) {
      return res.status(404).send({ message: "Temple authority not found" });
    }
    const isMatch = await bcrypt.compare(password, temple.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ templeId: temple._id }, "your_secret_key", {
      expiresIn: "1h",
    });
    res.cookie("templetoken", token); // Set the token in the cookie
    res.send({ message: "Login successful", templeToken: token }); // Send the token in the response body
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});


// Route for listing temples
app.get("/temples", async (req, res) => {
  try {
    const temples = await Temple.find({});
    res.send(temples);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Middleware for verifying temple authority token
const verifyTempleToken = async (req, res, next) => {
  try {
    console.log("from verifyTempleToken");
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .send({ error: "Unauthorized: Missing or invalid token" });
    }
    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, "your_secret_key");

    const temple = await Temple.findOne({ _id: decoded.templeId });

    if (!temple) {
      throw new Error();
    }

    // Attach temple and token to request object for further use
    req.temple = temple;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).send({ error: "Unauthorized: Invalid token" });
  }
};

app.post("/temples/bookings/update", verifyTempleToken, async (req, res) => {
  try {
    console.log("from booking update");
    const {
      start_date,
      end_date,
      start_time,
      end_time,
      enabled,
      slots,
      event_name,
      event_description,
    } = req.body;

    console.log("Received Parameters:", {
      start_date,
      end_date,
      start_time,
      end_time,
      enabled,
      slots,
      event_name,
      event_description,
    });

    // Check for overlapping entries in booking_management
    const overlappingEntries = req.temple.booking_management.filter((entry) => {
      const entryStartDate = new Date(entry.start_date);
      const entryEndDate = new Date(entry.end_date);
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      console.log(startDate);
      return (
        entry.event_name === event_name &&
        ((startDate >= entryStartDate && startDate <= entryEndDate) ||
          (endDate >= entryStartDate && endDate <= entryEndDate) ||
          (startDate <= entryStartDate && endDate >= entryEndDate))
      );
    });

    if (overlappingEntries.length > 0) {
      // Update existing overlapping entries
      overlappingEntries.forEach((entry) => {
        entry.enabled = enabled;
        entry.slots = slots;
        entry.event_name = event_name; // Update event name
        entry.event_description = event_description; // Update event description
      });
    } else {
      // Create a new entry
      req.temple.booking_management.push({
        start_date,
        end_date,
        start_time,
        end_time,
        enabled,
        slots,
        event_name,
        event_description,
      });
    }

    console.log("Updated Booking Management:", req.temple.booking_management);

    // Save the updated temple
    await req.temple.save();

    res
      .status(200)
      .send({ message: "Booking management updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get("/temples/:templeId/available-bookings", async (req, res) => {
  const templeId = req.params.templeId;

  try {
    // Attempt to find a temple document by its ID
    const temple = await Temple.findById(templeId);
    
    // If no temple is found, send a 404 response with an error message
    if (!temple) {
      return res.status(404).json({ error: "Temple not found" });
    }

    // Get the current date and time
    const now = new Date();
    // Convert the current date to a string in YYYY-MM-DD format
    const currentDateString = now.toISOString().split('T')[0];
    // Convert the current time to a string in HH:MM:SS format
    const currentTime = now.toTimeString().split(' ')[0];
    const bookingsForTemple = temple.booking_management.filter(booking => {
      const bookingDate = new Date(booking.start_date);
      const bookingDateString = bookingDate.toISOString().split('T')[0];
      const bookingStartTime = booking.start_time;
     
      // Check if the booking is enabled
      if (!booking.enabled) {
        
        return false; // Exclude disabled bookings
      }
    
      // Check if the booking's start date is in the future
      if (bookingDateString > currentDateString) {
        
        return true; // Include bookings with future start dates
      }
      
      
      if (bookingDateString === currentDateString ) {
       
        return true; 
      }
    
      return false; // Exclude other bookings
    });
    

    // Log the filtered bookings to the console
   

    // Calculate the total available slots for future enabled bookings
    let availableSlots = 0;
    bookingsForTemple.forEach((booking) => {
      availableSlots += booking.slots;
    });

    // Send a JSON response containing the temple details, the filtered bookings, and the available slots
    res.status(200).json({
      temple: {
        name: temple.name,
        address: temple.address,
        location: temple.location,
        images: temple.images,
        about: temple.about,
      },
      bookings: bookingsForTemple,
      availableSlots,
    });
  } catch (error) {
    // Log any errors to the console and send a 500 response with an error message
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//  Route for fetching bookings for the authenticated temple
app.get("/templeinfo", verifyTempleToken, async (req, res) => {
  try {
    
    const temple = req.temple;
    
    // Pick the fields you want to include in the response
    const templeInfo = {
      name: temple.name,
      location: temple.location,
      images: temple.images,
      about: temple.about,
      last_booking_id: temple.last_booking_id,
      bookings: temple.bookings,
      booking_management: temple.booking_management,
      t_id: temple._id
    };

    // Send temple data in the response
    res.status(200).json({ templeinfo: templeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to handle bookings
// Route to handle bookings
app.post("/bookings", verifyToken, async (req, res) => {
  try {
    const { templeId, evebookingId } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

    // Find the temple by ID
    const temple = await Temple.findById(templeId);
    
    if (!temple) {
      return res.status(404).send({ message: "Temple not found" });
    }
    const bookingIndex = temple.booking_management.findIndex(booking => booking._id.toString() === evebookingId);
    
    // Ensure bookingIndex is within bounds
    if (bookingIndex < 0 || bookingIndex >= temple.booking_management.length) {
      return res.status(400).send({ message: "Invalid booking index" });
    }

    // Check if slots are available
    let bookingSlot = temple.booking_management[bookingIndex].slots;
    if (bookingSlot <= 0) {
      return res.status(400).send({ message: "No slots available" });
    }
   
    // Increment the last used booking ID
    temple.last_booking_id += 1;
    const bookingId = temple.last_booking_id.toString();

    // Create the booking object
    const newBooking = {
      booking_id: bookingId,
      user_id: user.username,
      index: bookingIndex,
      event_id: temple.booking_management[bookingIndex]._id
    };

    // Add the booking to the temple's bookings array
    temple.bookings.push(newBooking);

    // Decrease the slots count
    temple.booking_management[bookingIndex].slots--;

    // Save the changes to the temple document
    console.log("tem = ",temple);
    await temple.save();

    // Create a new booking object for the user
    const userBooking = {
      temple_name: temple.name,
      event_name: temple.booking_management[bookingIndex].event_name,
      event_description: temple.booking_management[bookingIndex].event_description,
      booking_id: bookingId,
      temple_id: templeId,
      booking_date: temple.booking_management[bookingIndex].start_date,
      booking_time: temple.booking_management[bookingIndex].start_time,
    };

    // Add the booking to the user's bookings array
    user.bookings.push(userBooking);

    // Save the changes to the user document
    await user.save();
    res.status(200).send({ message: "Booking successful", bookingId });
    // Send confirmation email
    await transporter.sendMail({
      from: 'sunil.singh.p9000@gmail.com', // Sender's email address
      to: user.email, // User's email address
      subject: 'Booking Confirmation', // Email subject
      text: `Dear ${user.username},\n\nYour booking has been confirmed.\n\nBooking Details:\nTemple: ${temple.name}\nEvent: ${temple.booking_management[bookingIndex].event_name}\nDate: ${temple.booking_management[bookingIndex].start_date}\nTime: ${temple.booking_management[bookingIndex].start_time}\nBooking ID: ${bookingId}\n\nThank you for your booking.\n\nBest regards,\nTemple Management` // Email body
    });

   
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
