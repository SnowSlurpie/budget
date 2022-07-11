let db;
// Below line creates DB if it doesn't exist already. Otherwise it'll open the database if it actually exists.
const request = indexedDB.open('pwa_budget', 1);

// updates the database when needed
request.onupgradeneeded = function(event) {
    const db = event.target.result;

    // new object is stored for transactions
    db.createObjectStore('new_transaction', { autoIncrement: true });
}

// Connection to DB is successful hopefully
request.onsuccess = function(event) {
    db = event.target.result;
    console.log(`Success! ${event.type}`);
// checks if app is online before reading from db
    if (navigator.onLine) {
        addbalance();
    }
}

// listens for errors
request.onerror = function(event) {
    console.log(event.target.errorCode);
}

// save transaction functionality
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to store 
    transactionObjectStore.add(record);
}

function addbalance() {
    // opens new transaction 
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from transaction object store
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    // clears all itimes in transaction object store
                    transactionObjectStore.clear();

                    alert('All saved transactions have been submtitted');
                    // refresh the page
                    window.location.reload();
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
}

// listen for app coming back online
window.addEventListener('online', addbalance);