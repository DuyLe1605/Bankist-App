'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-11-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2024-04-01T10:17:24.185Z',
    '2024-05-08T14:11:59.604Z',
    '2025-02-20T17:01:17.194Z',
    '2025-02-25T23:36:17.929Z',
    '2025-02-25T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-02-05T16:33:06.386Z',
    '2024-04-10T14:43:26.374Z',
    '2024-06-25T18:49:59.371Z',
    '2025-02-25T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

//Format date
const formatMovementDate = function (date) {
  const calcDaysPassed = function (date1, date2) {
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  };
  const dayPassed = calcDaysPassed(new Date(), date);
  //Check
  if (dayPassed === 0) return `Today`;
  if (dayPassed === 1) return `Yesterday`;
  if (dayPassed <= 7) return `${dayPassed} days ago`;
  //
  const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
  return Intl.DateTimeFormat('vi-VN', options).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
// Tạo 1 hàm nhận vào là 1 mảng chứa các movement
const displayMovements = function (acc, sort = false) {
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  //Xóa hết nội dung cũ trong thẻ movements
  containerMovements.innerHTML = '';

  for (const [i, mov] of movs.entries()) {
    const type = mov > 0 ? `deposit` : `withdrawal`;
    //date
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);
    //
    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    //
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
     <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>`;

    // Sử dụng phương thức insertAdjacentHTMl vào thẻ movements để chèn thêm nội dung vào
    containerMovements.insertAdjacentHTML('afterbegin', html);
  }
};

//Cập nhật và hiển thị Balance mới
const calcDisplayBalance = function (acc) {
  //ThamTham số trong hàm reduce là 1 func với mức bắt đầu của accuments
  //Tham số trong func lần lượt là acc,value,index,array
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//Tính toán và hiển thị in, out ,interest
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const out = Math.abs(
    acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  );
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => mov * (acc.interestRate / 100))
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//Hàm nhận đầu vào là 1 mảng các account
const createUserName = function (accounts) {
  //Duyệt qua từng account trong mảng accounts
  //For of loop
  for (const acc of accounts) {
    acc.username = acc.owner
      .toLowerCase()
      .trim()
      .split(' ')
      .map(word => word.at(0))
      .join('');
  }
};
createUserName(accounts);
console.log(accounts);
//--------------------------------------------------------------------Update UI--------------------------------------------------------------------
const updateUI = function (acc) {
  //Display movements
  displayMovements(acc);
  //Display Balance
  calcDisplayBalance(acc);
  //Display SummarySummary
  calcDisplaySummary(acc);
};
//Log out
const logOut = function () {
  labelWelcome.textContent = `Log in to get started`;
  containerApp.style.opacity = 0;
};

// const startLogoutTimer = function () {
//   //func
//   const tick = function () {
//     const min = `${Math.floor(time / 60)}`.padStart(2, 0);
//     const second = `${time % 60}`.padStart(2, 0);
//     //in each call, print the remaining time to UI
//     labelTimer.textContent = `${min}:${second}`;

//     //When 0 seconds, stop timeFormatted and log out user
//     if (time === 0) {
//       clearInterval(timer);
//       logOut();
//     }
//     // Giảm 1 giây
//     time--;
//   };
//   // Set time to 5 mins
//   let time = 60 * 5;

//   //Call the timer every second
//   tick();
//   const timer = setInterval(tick, 1000);
//   return timer;
// };
const startLogoutTimer = function () {
  //Hàm cập nhật thời gian sau mỗi giây
  const tick = function () {
    //Tạo biến phút và giây
    const min = String(Math.round(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //Sau mỗi lần lặp, hiển thị thời gian mới lên UI
    labelTimer.textContent = `${min}:${sec}`;
    //khi bộ đếm về 0, dừng bộ đếm và đăng xuất
    if (time === 0) {
      clearInterval(timer);
      logOut();
    }
    time--;
  };
  //Thời gian mặc định là 5 phút
  let time = 5 * 60;

  //Gọi hàm để khi logout,hàm sẽ trả lại giá trị ban đầu
  tick();
  //Hiển thị thời gian mỗi 1s
  const timer = setInterval(tick, 1000);
  return timer;
};
//--------------------------------------------------------------------Event handler--------------------------------------------------------------------
let currentAccount, timer;

//-------------------Login
btnLogin.addEventListener('click', function (e) {
  //Câu lệnh ngăn biểu mẫu được gửi đi
  e.preventDefault();

  //Check xem dữ liệu đầu vào có trùng với acc nào trong mảng accounts không
  currentAccount = accounts.find(function (acc) {
    return acc.username === inputLoginUsername.value;
  });

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Hiển thị first name của account,vd Jonas Schmedtmann = Jonas
    labelWelcome.textContent = `Welcome Back ${currentAccount.owner
      .split(' ')
      .at(0)}`;

    containerApp.style.opacity = 1;

    //Create current Date
    const now = new Date();
    const dateOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Ho_Chi_Minh',
    };
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Ho_Chi_Minh',
    };
    // Định dạng ngày và giờ riêng biệt
    const formattedDate = new Intl.DateTimeFormat('vi-VN', dateOptions).format(
      now
    );
    const formattedTime = new Intl.DateTimeFormat('vi-VN', timeOptions).format(
      now
    );
    // Ghép lại đúng thứ tự mong muốn
    labelDate.innerHTML = `${formattedDate}, ${formattedTime}`;

    // -------Set time----------
    //Mỗi khi đăng nhập,sẽ kiểm tra có bộ đếm nào chưa,nếu có rồi thì dừng bộ đếm
    if (timer) clearInterval(timer);
    //Bắt đầu bộ đếm mới
    timer = startLogoutTimer();

    //Update UI
    updateUI(currentAccount);

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    //blur dùng để bỏ focus khỏi user và pin(Con trỏ chuột nháy )
    inputLoginUsername.blur();
    inputLoginPin.blur();
  }
  console.log(currentAccount);
});

//-------------------Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  //Giá trị
  const amount = Number(inputTransferAmount.value);

  //Tìm xem có acc nào giống trong mảng accounts và khác current acc không
  const transferAccount = accounts.find(function (acc) {
    return (
      acc.username === inputTransferTo.value &&
      acc.username !== currentAccount.username
    );
  });

  //Nếu tài khoản tồn tại,số dư lớn hơn số tiền cần chuyển thì thực thi
  if (transferAccount && currentAccount.balance >= amount && amount > 0) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    transferAccount.movements.push(amount);
    transferAccount.movementsDates.push(new Date().toISOString());
    //Update UI
    updateUI(currentAccount);
  }
  //Clear focus
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
  inputTransferTo.blur();
});

//-------------------Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value);
  const check = currentAccount.movements.some(mov => mov >= loanAmount / 10);

  if (check && loanAmount > 0) {
    setTimeout(() => {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 3000);
  }

  //Clear focus
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

//-------------------Delete account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    accounts.splice(index, 1);
    //Clear close form value
    inputClosePin.value = inputCloseUsername.value = '';
    //Logout
    logOut();
  }
});

//Sort : Sắp xếp từ lớn tới bé
let sorted = false;
btnSort.addEventListener('click', function () {
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
  console.log(sorted);
});
const arr = new Array(10);
arr.fill(`Hello world!`);
console.log(arr);

//From method
labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );
  console.log(movementsUI);
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
//SetTimeout : lên lịch để 1 hàm chạy sau 1 khoảng thời gian ,chỉ được thực hiện 1 lần
setTimeout(() => console.log(`Here is your pizza 🍕`), 1000);
console.log(`Waiting...`);
//Cách dùng đối số trong hàm setTimeout
setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1}, ${ing2} 🍕`),
  2000,
  `olives`,
  `spinach`
);
//Đối số là 1 mảng
const ingredients = [`chilies`, `olives`, 'sausage'];
const pizzaTimer = setTimeout(
  (ing1, ing2, ing3) =>
    console.log(`Here is your pizza with ${ing1}, ${ing2} and ${ing3}  🍕`),
  3000,
  ...ingredients
);
if (ingredients.includes('spinach ')) clearTimeout(pizzaTimer);

//setInterval : thực thi 1 hàm sau mỗi khoảng thời gian nhất định
const Clock = setInterval(function () {
  const now = new Date();

  console.log(
    Intl.DateTimeFormat('vi-VI', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now)
  );
}, 1000);
setTimeout(() => clearInterval(Clock), 5000);
*/
