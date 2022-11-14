// This is the JavaScript entry file - your code begins here
// Do not delete or rename this file ********

// An example of how you tell webpack to use a CSS (SCSS) file
import "./css/styles.scss";
import Hotel from "./classes/hotel";
import Customer from "./classes/customer";
import loadData from "./apiCalls";

// An example of how you tell webpack to use an image (also need to link to it in the index.html)
import "./images/HotelRoom1.png";
import "./images/HotelRoom2.png";
import "./images/HotelRoom3.png";
import "./images/HotelRoom4.png";
import "./images/lock.png";
import "./images/user.png";

//GLOBAL VAR

let currentUser;
let overlookHotel;
let chosenDate;

//VARIABLES

//QUERY SELECTORS
const loginSection = document.querySelector(".log-in");
const loginButton = document.getElementById("login-btn");
const username = document.getElementById("name");
const password = document.getElementById("password");
const loginError = document.querySelector(".bad-login");
const signIn = document.querySelector(".sign-in");

const navigationBar = document.querySelector(".first-navigation");
const managerNavigation = document.querySelector(".manager-nav");
const manageBookingsSection = document.querySelector(".manage-bookings");
const addBookingsSection = document.querySelector(".add-booking");
const welcome = document.querySelector(".welcome");

let availableRooms = document.querySelector(".room-thumbnails");
let myBookings = document.querySelector(".manage-bookings");

let wantedRoomType = document.querySelector("#select-room");
let submitBookingButton = document.querySelector("#submit-booking");
const calendar = document.getElementById("calendar");

const managerDashboard = document.querySelector(".manager-dashboard");
const hotelInformation = document.querySelector(".hotel-information");
const managerSearchForm = document.querySelector(".manager-add-booking");

const roomsAvailableInfo = document.querySelector("#rooms-available");
const totalRevenueInfo = document.querySelector("#total-revenue");
const occupiedRoomsInfo = document.querySelector("#percentage-occupied");
const findCustomer = document.querySelector("#find-customer");
const searchCustomersButton = document.querySelector("#search-customers");
const currentSearchedCustomer = document.querySelector(
  "#current-searched-customer"
);
const searchedCustomerBookings = document.querySelector(
  "#manager-customer-bookings"
);
const managerAvailableRoomsSection =
  document.querySelector("#manager-book-room");
const managerSearchBookingButton = document.querySelector(
  "#manager-submit-booking"
);
const managerCalender = document.querySelector("#manager-calendar");
const managerAvailableRooms = document.querySelector(
  "#manager-available-rooms"
);
const managerWantedRoomType = document.querySelector("#manager-select-room");

//even listeners
window.addEventListener("load", loadAllData);
loginButton.addEventListener("click", loginUser);
navigationBar.addEventListener("click", changePageDisplay);
managerNavigation.addEventListener("click", changePageDisplay);
signIn.addEventListener("click", backToLogin);
submitBookingButton.addEventListener("click", searchForBookableRooms);
searchCustomersButton.addEventListener("click", searchForCustomer);
availableRooms.addEventListener("dblclick", bookRoom);
availableRooms.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    bookRoomKeyDown(e);
  }
});
managerSearchBookingButton.addEventListener(
  "click",
  managerSearchForBookableRooms
);

function loadAllData() {
  Promise.all([
    loadData("http://localhost:3001/api/v1/customers"),
    loadData("http://localhost:3001/api/v1/rooms"),
    loadData("http://localhost:3001/api/v1/bookings"),
  ])
    .then((data) => {
      overlookHotel = new Hotel(data[1].rooms, data[2].bookings);
      overlookHotel.createCustomers(data[0].customers);
    })
    .catch((error) => {
      loginError.innerText =
        "We are so sorry! There was a problem loading the data!";
      show(loginError);
    });
}

//Starting functions

function loginUser() {
  currentUser = overlookHotel.login(username.value, password.value);
  if (currentUser === undefined) {
    loginError.innerText = "Invalid credentials! Please try again!";
    show(loginError);
    return "did not work";
  } else {
    if (currentUser === "manager") {
      console.log("manager");
      loginManager();
      displayHotelInfo();
    } else {
      loginCustomer();
    }
  }
}

function loginCustomer() {
  hide(loginSection);
  show(navigationBar);
  show(welcome);
  show(signIn);
  welcome.innerText = `Welcome ${currentUser.name}`;
  updateCustomerBookings();
  return currentUser;
}

function loginManager() {
  hide(loginSection);
  hide(navigationBar);
  show(signIn);
  show(managerNavigation);
  show(managerDashboard);
}

function changePageDisplay(event) {
  hide(manageBookingsSection);
  hide(addBookingsSection);
  hide(searchedCustomerBookings);
  hide(welcome);
  hide(hotelInformation);
  hide(managerSearchForm);
  if (event.target.classList.contains("manage-bookings-button")) {
    updateCustomerBookings();
    show(manageBookingsSection);
  } else if (event.target.classList.contains("create-bookings-button")) {
    hide(searchedCustomerBookings);
    show(addBookingsSection);
  } else if (event.target.classList.contains("manager-dashboard-button")) {
    show(hotelInformation);
    show(managerSearchForm);
  } else if (
    event.target.classList.contains("manager-customer-bookings-button")
  ) {
    show(searchedCustomerBookings);
    displaySearchedCustomerRoomBookings();
  }
}

function backToLogin() {
  hide(manageBookingsSection);
  hide(addBookingsSection);
  hide(welcome);
  hide(navigationBar);
  hide(managerNavigation);
  hide(signIn);
  hide(managerDashboard);
  show(loginSection);
  username.value = "";
  password.value = "";
}

function updateCustomerBookings() {
  displayRoomBookings(generateCustomerBookings());
}

function generateCustomerBookings() {
  const booking = currentUser.getMyBookings(overlookHotel.allBookings);
  return booking;
}

function displayRoomBookings(data) {
  let cost = overlookHotel.findCustomerBookingExpenses(currentUser);
  cost = cost.toFixed(2);
  myBookings.innerHTML = "";
  data.forEach((booking) => {
    myBookings.innerHTML += `
    <section class="user-booking" id="${booking.id}">
      <p>Date: ${booking.date}</p>
      <p>Room: ${booking.roomNumber}</p>
    </section>
    `;
  });
  myBookings.innerHTML += `<h2 class='total-spent'>Total Spent: $${cost}</h2>`;
}

function searchForBookableRooms() {
  event.preventDefault();
  getAllBookings();
  let date = `${calendar.value}`;
  date = date.split("-").join("/");
  chosenDate = overlookHotel.chooseADate(date);
  availableRooms.innerHTML = "";
  const room = wantedRoomType.value;
  const foundRooms = overlookHotel.findAvailableRooms(date);
  if (chosenDate === "Please choose a valid date") {
    availableRooms.innerHTML = `
    <h3 class='try-again'>We cannot search for bookings with a past date! Please try again.</h3>
    `;
  } else if (room === "") {
    availableRooms.innerHTML = `
    <h3 class='try-again'>Please select a room prefrence!</h3>
    `;
  } else if (foundRooms.length === 0) {
    availableRooms.innerHTML = `<h3 class="try-again">We are so sorry, there are no bookings available with your specifications!
    Please modify your search!</h3>`;
  } else {
    if (room === "no-preference") {
      console.log(foundRooms);
      displayAvailableRooms(foundRooms);
    } else if (room != "no-preference") {
      const withRoom = overlookHotel.filterRoomsByType(room, foundRooms);
      console.log(foundRooms);
      console.log(withRoom);
      if (withRoom.length === 0) {
        availableRooms.innerHTML = `<h3 class="try-again">We are so sorry, there are no bookings available with your specifications!
    Please modify your search!</h3>`;
      } else {
        console.log(withRoom);
        displayAvailableRooms(withRoom);
      }
    }
  }
}

function displayAvailableRooms(data) {
  data.forEach((room) => {
    availableRooms.innerHTML += `
    <section class="single-room-thumbnail" id ="${room.number}" tabindex='0'> 
      <img class="single-room-img" src="./images/HotelRoom4.png" alt="Image of room ${room.number}"> 
        <div class="room-info"> 
          <p>Room number: ${room.number}</p>
          <p>Room type: ${room.roomType}</p>
          <p>Bidet: ${room.bidet}</p>
          <p>Bed size: ${room.bedSize}</p>
          <p>Number of beds: ${room.numBeds}</p>
          <p>Cost per night: ${room.costPerNight}</p>
        </div> 
    </section>`;
  });
}

function bookRoom(event) {
  const id = +event.target.parentElement.id;
  const booking = overlookHotel.createNewBooking(currentUser, id, chosenDate);
  postBooking(booking);
}

function bookRoomKeyDown(event) {
  const id = +event.target.id;
  const booking = overlookHotel.createNewBooking(currentUser, id, chosenDate);
  postBooking(booking);
}

function postBooking(bookingToSend) {
  fetch("http://localhost:3001/api/v1/bookings", {
    method: "POST",
    body: JSON.stringify(bookingToSend),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      availableRooms.innerHTML = `
      <h3>Saved Booking</h3>`;
      getAllBookings();
      console.log(overlookHotel);
    })
    .catch((err) => {
      availableRooms.innerHTML = `
    <h3 class='try-again'>There was a problem saving your booking!</h3>
    `;
    });
}

function getAllBookings() {
  fetch("http://localhost:3001/api/v1/bookings")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      return res.json();
    })
    .then((data) => {
      overlookHotel.createBookings(data.bookings);
    })
    .catch((error) => {
      myBookings.innerHTML = `
    <h3 class='try-again'>There was a problem retrieving your bookings data!</h3>
    `;
    });
}

function displayHotelInfo() {
  const today = overlookHotel.chooseADate(overlookHotel.getToday());
  const available = overlookHotel.findAvailableRooms(today);
  const totalRevenue = overlookHotel.totalRevenue(today);
  const percentageBooked =
    (available.length / overlookHotel.allRooms.length) * 100;
  roomsAvailableInfo.innerText = `Rooms Available: ${available.length}`;
  totalRevenueInfo.innerText = `Total Revenue: $${totalRevenue}`;
  occupiedRoomsInfo.innerText = `Percentage of rooms booked: ${percentageBooked}%`;
}

function searchForCustomer() {
  const name = findCustomer.value;
  currentUser = overlookHotel.findACustomer(name);
  currentSearchedCustomer.innerText = `Customer: ${currentUser.name}`;
}

function displaySearchedCustomerRoomBookings() {
  const bookings = generateCustomerBookings();
  let cost = overlookHotel.findCustomerBookingExpenses(currentUser);
  cost = cost.toFixed(2);
  searchedCustomerBookings.innerHTML = "";
  bookings.forEach((booking) => {
    searchedCustomerBookings.innerHTML += `
    <section class="user-booking" id="${booking.id}" tabindex='0'>
      <p>Date: ${booking.date}</p>
      <p>Room: ${booking.roomNumber}</p>
    </section>
    `;
  });
  searchedCustomerBookings.innerHTML += `<h2 class='total-spent'>Total Customer Spent: $${cost}</h2>`;
}

function managerDisplayAvailableRooms(data) {
  data.forEach((room) => {
    managerAvailableRoomsSection.innerHTML += `
    <section class="manager-single-room-thumbnail" id ="${room.number}" tabindex='0'> 
      <img class="single-room-img" src="./images/HotelRoom4.png" alt="Image of room ${room.number}"> 
        <div class="room-info"> 
          <p>Room number: ${room.number}</p>
          <p>Room type: ${room.roomType}</p>
          <p>Bidet: ${room.bidet}</p>
          <p>Bed size: ${room.bedSize}</p>
          <p>Number of beds: ${room.numBeds}</p>
          <p>Cost per night: ${room.costPerNight}</p>
        </div> 
    </section>`;
  });
}

function managerSearchForBookableRooms() {
  event.preventDefault();
  getAllBookings();
  let date = `${managerCalender.value}`;
  date = date.split("-").join("/");
  chosenDate = overlookHotel.chooseADate(date);
  managerAvailableRooms.innerHTML = "";
  const room = managerWantedRoomType.value;
  const foundRooms = overlookHotel.findAvailableRooms(date);
  if (chosenDate === "Please choose a valid date") {
    managerAvailableRooms.innerHTML = `
    <h3 class='try-again'>We cannot search for bookings with a past date! Please try again.</h3>
    `;
  } else if (room === "") {
    managerAvailableRooms.innerHTML = `
    <h3 class='try-again'>Please select a room prefrence!</h3>
    `;
  } else if (foundRooms.length === 0) {
    managerAvailableRooms.innerHTML = `<h3 class="try-again">We are so sorry, there are no bookings available with your specifications!
    Please modify your search!</h3>`;
  } else {
    if (room === "no-preference") {
      managerDisplayAvailableRooms(foundRooms);
    } else if (room != "no-preference") {
      const withRoom = overlookHotel.filterRoomsByType(room, foundRooms);
      if (withRoom.length === 0) {
        managerAvailableRooms.innerHTML = `<h3 class="try-again">We are so sorry, there are no bookings available with your specifications!
    Please modify your search!</h3>`;
      } else {
        managerDisplayAvailableRooms(withRoom);
      }
    }
  }
}

function hide(element) {
  element.classList.add("hide");
}

function show(element) {
  element.classList.remove("hide");
}
