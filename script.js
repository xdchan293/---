'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2023-03-02T17:01:17.194Z',
        '2023-03-06T23:36:17.929Z',
        '2023-03-08T10:51:36.790Z',
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
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

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

// the guy use system now
let currentAcc;
let timer;
let sort = false;

// function all
const getUsername = function(accounts) {
    accounts.forEach(element => {
        element.username = element.owner
            .toLowerCase()
            .split(' ')
            .map(el => el[0]) //return the first ele
            .join('')
    });
};

const formatCur = function(val, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(val);
}

const formatMovementDate = function(date, locale) {
    const calByPass = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = calByPass(new Date(), date);

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    return new Intl.DateTimeFormat(locale).format(date);

}

const displayMovements = function(acc, sort = false) {
    containerMovements.innerHTML = '';
    let toDisplay = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

    toDisplay.forEach((val, index) => {
        let date = new Date(acc.movementsDates[index]);
        const displayDate = formatMovementDate(date, acc.locale);
        const formattedMov = formatCur(val, acc.locale, acc.currency);
        // console.log(date, displayDate);
        const type = val > 0 ? 'deposit' : 'withdrawal';
        const html = ` 
        <div class="movements__row">
        <div class="movements__type movements__type--${type}">${index} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
        </div>`
        containerMovements.insertAdjacentHTML('afterbegin', html);
    })

}

const calcDisplayBalance = function(acc) {
    acc.balance = acc.movements.reduce((sum, val) => sum + val, 0);
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
}

const calcDisplaySummary = function(acc) {
    const income = acc.movements
        .filter(val => val > 0)
        .reduce((sum, val) => sum + val, 0);
    labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);

    const out = acc.movements
        .filter(val => val < 0)
        .reduce((sum, val) => sum + val, 0);
    labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

    const interest = acc.movements
        .filter(val => val > 0)
        .map(cur => (cur * acc.interestRate) / 100)
        .filter(val => val > 1)
        .reduce((sum, val) => sum + val, 0);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
}

const updateUi = function(acc) {
    displayMovements(acc);

    calcDisplayBalance(acc);

    calcDisplaySummary(acc);
}

getUsername(accounts)
    // console.log(accounts);

const startLogOutTimer = function() {
    const tick = function() {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const second = String(time % 60).padStart(2, 0);

        labelTimer.textContent = `${min}:${second}`;

        if (time === 0) {
            clearInterval(timer);
            labelWelcome.textContent = "Log in to get started";
            containerApp.style.opacity = 0;
        }

        time--;

    }

    let time = 300;

    tick();

    return setInterval(tick, 1000);
}

//event 
//1 when btnLogin is clicked begin login event 
btnLogin.addEventListener('click', function(e) {
    e.preventDefault();
    // console.log(inputLoginUsername.value, inputLoginPin.value);
    currentAcc = accounts.find(ele => ele.username === inputLoginUsername.value);
    if (currentAcc && currentAcc.pin === Number(inputLoginPin.value)) {
        containerApp.style.opacity = 100;
        //waiting to update ui
        labelWelcome.textContent = `Welcome back, ${currentAcc.owner.split(' ')[0]}`;


        const now = new Date();
        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        };
        // console.log(now)
        labelDate.textContent = new Intl.DateTimeFormat(currentAcc.locale, options).format(now);

        if (timer) clearInterval(timer);
        timer = startLogOutTimer();
        updateUi(currentAcc);
    }
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();
})


btnTransfer.addEventListener('click', function(e) {
    e.preventDefault();
    // console.log(inputTransferTo.value)
    const amount = Number(inputTransferAmount.value);
    const target = accounts.find(ele => ele.username === inputTransferTo.value);
    inputTransferAmount.value = inputTransferTo.value = ''
    if (amount > 0 &&
        target &&
        currentAcc.balance >= amount &&
        target.username !== currentAcc.username) {
        currentAcc.movements.push(-amount);
        target.movements.push(amount);
        // console.log(1111)
        currentAcc.movementsDates.push(new Date().toISOString());
        target.movementsDates.push(new Date().toISOString());

        clearInterval(timer);
        timer = startLogOutTimer();
        updateUi(currentAcc);
    } else {
        alert('there is something wrong');
    }

})

btnLoan.addEventListener('click', function(e) {
    e.preventDefault();
    const amount = Number(inputLoanAmount.value);
    if (amount > 0 &&
        currentAcc.movements.some(mov => mov > amount * 0.1)) {
        setTimeout(() => {
            currentAcc.movements.push(amount);
            currentAcc.movementsDates.push(new Date().toISOString());

            clearInterval(timer);
            timer = startLogOutTimer();
            updateUi(currentAcc);
        }, 2500);
    } else {
        alert('wrong amount!');
    }
    inputLoanAmount.value = '';
})

btnSort.addEventListener('click', function(e) {
    e.preventDefault();
    displayMovements(currentAcc, !sort);
    sort = !sort;
})

btnClose.addEventListener('click', function(e) {
    e.preventDefault();
    if (inputCloseUsername.value === currentAcc.username &&
        Number(inputClosePin.value) === currentAcc.pin) {
        const index = accounts.findIndex(val => val.username === currentAcc.username);

        accounts.splice(index, 1);

        containerApp.style.opacity = 0;

        inputCloseUsername.value = inputClosePin.value = '';
    }
})