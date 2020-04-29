let bookList = document.querySelector('#list')
let bookViewer = document.querySelector('#show-panel')
let userLoggedIn = {
    "id": 1, 
    "username":"pouros"
}
let likeButtonText = {
    true: 'UNLIKE',
    false: 'LIKE'
}
let userLikes = []


fetch('http://localhost:3000/books')
    .then(r => r.json())
    .then(bookArray => bookArray.forEach(book => {
        fillBookList(book)
        setUserLikes(book)
    }))

function setUserLikes(book) {
    let bookLikers = book.users.map(user => {return user.id})
    bookLikers.includes(userLoggedIn.id) ? addLikes(book) : removeLikes(book)
}

function addLikes(book) {userLikes.push(book.id)}

// Only invoked when the User is not one of the 'Likers' of a book. This function says: if the User is not a liker, check if userLikes dataset includes this book and remove it, if so.
function removeLikes(book) {
        if (userLikes.includes(book.id)) {
            let index = userLikes.indexOf(book.id)
            userLikes.splice(index, 1)} 
    }


function fillBookList(book) {
    let bookLi = document.createElement('li')
    bookLi.innerText = book.title

    bookList.append(bookLi)

    bookLi.addEventListener('click', () => {
        showBook(book)
    })
}

function showBook(book) {
    resetChildren(bookViewer)
    let bookImg = document.createElement('img')
    bookImg.src = book.img_url

    let bookTitle = document.createElement('h4')
    bookTitle.innerText = book.title

    let bookDesc = document.createElement('p')
    bookDesc.innerText = book.description

    let likerList = document.createElement('ul')
    book.users.forEach(user => {
        let userLi = document.createElement('li')
        userLi.innerText = user.username
        likerList.append(userLi)
    })

    let likeButton = document.createElement('button')
    likeButton.innerText = likeButtonText[userLikes.includes(book.id)]

    likeButton.addEventListener("click", (evt) => {
        evt.preventDefault()
        toggleBookLike(book)
    })

    bookViewer.append(bookImg, bookTitle, bookDesc, likerList, likeButton)    
}

// Thanks to the conditional logic in 'setNewUsersArray' (below) and 'setUserLikes' (above) this function will add a user like or remove a user like via patch request and adjust the userLikes dataset accordingly. There's no need to add the user directly to the DOM's 'likerList' since invoking 'showBook(book)' will reset the container and recreate the list from the updated book being passed in.
function toggleBookLike(book) {
    let usersArray = setNewUsersArray(book)
    fetch(`http://localhost:3000/books/${book.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            users: usersArray
        })
    })
    .then(r => r.json())
    .then(book => {
        setUserLikes(book)
        showBook(book)

    })
}

// Function creates a new 'users' array for the book by adding/removing the user from the array based on whether they're currently part of it. If they are, remove them, if they aren't add them. 
function setNewUsersArray(book) {
    let bookLikers = book.users
    if (userLikes.includes(book.id)) {
        let index = bookLikers.indexOf(userLoggedIn)
        bookLikers.splice(index, 1)
    } else {
        bookLikers = [...bookLikers, 
        {id: userLoggedIn.id,
        username: userLoggedIn.username} ]
    }
    return bookLikers
}

function resetChildren(element) {
    let child = element.lastElementChild
    while(child) {
        element.removeChild(child)
        child = element.lastElementChild
    }
}