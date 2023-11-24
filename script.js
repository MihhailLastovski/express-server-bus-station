window.onload = function() {
    const savedUser = getUser();
    checkLoginStatus();
    if (savedUser.username !== null) {
        fetchRoutes(savedUser.username, savedUser.password);
        toggleRouteBlock(savedUser.role)
    }
};

function saveUser(username, password, role) {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    localStorage.setItem('role', role);
}

function getUser() {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    const role = localStorage.getItem('role');
    return { username, password, role };
}


function logOff() {
    localStorage.removeItem('username');
    localStorage.removeItem('password'); 
    localStorage.removeItem('role');               
    window.location.href = 'http://localhost:3000/';
}

function checkLoginStatus() {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    if (username && password) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('logoffButton').style.display = 'inline-block';
        document.getElementById('logoffButton').innerHTML = username + ' <i class="fa fa-sign-out" style="font-size:16px"></i>';

    } 
    else 
    {
        document.getElementById('loginBtn').style.display = 'inline-block';
        document.getElementById('registerBtn').style.display = 'inline-block';
        document.getElementById('logoffButton').style.display = 'none';
    }
}
const routesTable = document.getElementById('routesTable');
const logsTable = document.getElementById('logsTable');

async function fetchRoutes(username, password) {
    try 
    {
        const response = await fetch(`http://localhost:32149/Users/login/${username}/${password}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.status === 200) 
        {
            const allRoutesResponse = await fetch('http://localhost:32149/Routes/routes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const allRoutes = await allRoutesResponse.json();
            renderRoutes(allRoutes, data.role);  
            renderLogs(); 
        } 
        else 
        {
            alert('Authentication failed.');
        }
    } 
    catch (error) 
    {
        console.error('Error fetching routes:', error);
    }
}


function renderRoutes(routesData, userRole) 
{
    routesTable.innerHTML = '';

    routesData.forEach(route => {
        const row = `
            <tr>
                ${userRole === 'employee' ? `<td data-bs-toggle="modal" data-bs-target="#routeInfoModal" onclick="displayRouteInfo(${route.id})">${route.departureLocation}</td>` : `<td>${route.departureLocation}</td>`}                           
                ${userRole === 'employee' ? `<td data-bs-toggle="modal" data-bs-target="#routeInfoModal" onclick="displayRouteInfo(${route.id})">${route.destination}</td>` : `<td>${route.destination}</td>`}                           
                ${userRole === 'employee' ? `<td data-bs-toggle="modal" data-bs-target="#routeInfoModal" onclick="displayRouteInfo(${route.id})">${route.departureTime}</td>` : `<td>${route.departureTime}</td>`}                           
                ${userRole === 'employee' ? `<td><button class="btn btn-danger" onclick="deleteRoute(${route.id})">Delete</button></td>` : ''}
            </tr>
        `;
        routesTable.innerHTML += row;
    });

    const deleteColumnHeader = document.querySelector('th:nth-child(4)');
    if (userRole !== 'employee') 
    {
        deleteColumnHeader.style.display = 'none';
    } 
    else 
    {
        deleteColumnHeader.style.display = '';
    }
}

async function renderLogs()
{
    const allLogsResponse = await fetch('http://localhost:32149/Logs/logs', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const allLogs = await allLogsResponse.json();
    logsTable.innerHTML = '';

    allLogs.forEach(log => {
        const row = `
            <tr>
                <td>${log.action}</td>               
                <td>${log.username}</td>               
                <td>${log.timestamp.replace('T', ' ')}</td>               
            </tr>
        `;
        logsTable.innerHTML += row;
    });

}

async function deleteRoute(routeId) 
{
    try 
    {
        const user = getUser();
        const response = await fetch(`http://localhost:32149/Routes/routes/${routeId}/${user.username}`, 
        {
            method: 'DELETE'
        });

        if (response.status === 200) 
        {
            const user = getUser();
            fetchRoutes(user.username, user.password);
            alert('Route deleted successfully');
        } 
        else 
        {
            console.error('Failed to delete route.');
        }
    } 
    catch (error) 
    {
        console.error('Error deleting route:', error);
    }
}

async function deleteRouteFromModal() 
{
    const routeId = document.getElementById('routeId').value;

    try 
    {
        const user = getUser();
        const response = await fetch(`http://localhost:32149/Routes/routes/${routeId}/${user.username}`, 
        {
            method: 'DELETE'
        });

        if (response.status === 200) 
        {
            const user = getUser();
            fetchRoutes(user.username, user.password);
            alert('Route deleted successfully');
            $('#routeInfoModal').modal('hide');
        } 
        else 
        {
            console.error('Failed to delete route.');
        }
    } 
    catch (error) 
    {
        console.error('Error deleting route:', error);
    }
}

async function displayRouteInfo(routeId) 
{
    try {
        const response = await fetch(`http://localhost:32149/Routes/routes/${routeId}`);
        const route = await response.json();
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="mb-3">
                <label for="routeId">Route ID:</label>
                <input type="text" class="form-control" id="routeId" readonly value="${route.id}">
            </div>
            <table class="table table-striped">
                <tr><th>Departure Location</th><td>${route.departureLocation}</td></tr>
                <tr><th>Destination</th><td>${route.destination}</td></tr>
                <tr><th>Departure Time</th><td>${route.departureTime}</td></tr>
            </table>
        `;

        document.getElementById('routeId').value = route.id;
        document.getElementById('departureLocation').value = route.departureLocation;
        document.getElementById('destination').value = route.destination;
        document.getElementById('departureTime').value = route.departureTime;
    } 
    catch (error)
    {
        console.error('Error fetching route information:', error);
    }
}

async function updateRouteInTable() 
{
    const updatedRouteData = getFormData();

    try 
    {
        const user = getUser();
        const response = await fetch(`http://localhost:32149/Routes/routes/${updatedRouteData.id}/${updatedRouteData.departure_location}/${updatedRouteData.destination}/${updatedRouteData.departure_time}/${user.username}`, 
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 200) 
        {
            const user = getUser();
            fetchRoutes(user.username, user.password);
            alert('Route updated successfully');

            document.getElementById('departureLocation').value = '';
            document.getElementById('destination').value = '';
            document.getElementById('departureTime').value = '';

            $('#routeInfoModal').modal('hide'); 
        } 
        else 
        {
            console.error('Failed to update route.');
        }
    } 
    catch (error) 
    {
        console.error('Error updating route:', error);
    }
}

async function addNewRoute() {
    const newRouteData = getFormData(true);
    const isEmpty = Object.values(newRouteData).some(value => value === null || value === undefined || value.trim() === '');
    if (isEmpty) {
        alert('Please fill in all fields.');
        return;
    }
    try 
    {
        const user = getUser();
        const response = await fetch(`http://localhost:32149/Routes/routes/${newRouteData.departure_location}/${newRouteData.destination}/${newRouteData.departure_time}/${user.username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 201) 
        {
            const user = getUser();
            fetchRoutes(user.username, user.password);
            alert('Route added successfully');

            document.getElementById('newDepartureLocation').value = '';
            document.getElementById('newDestination').value = '';
            document.getElementById('newDepartureTime').value = '';
        } 
        else 
        {
            console.error('Failed to add route.');
        }
    } 
    catch (error) 
    {
        console.error('Error adding route:', error);
    }
}

function getFormData(isNewRoute) 
{
    let id = null;
    if (!isNewRoute) 
    {
        id = document.getElementById('routeId').value;
    }

    const departureLocation = isNewRoute ? document.getElementById('newDepartureLocation').value : document.getElementById('departureLocation').value;
    const destination = isNewRoute ? document.getElementById('newDestination').value : document.getElementById('destination').value;
    let departureTime = isNewRoute ? document.getElementById('newDepartureTime').value : document.getElementById('departureTime').value;
    departureTime = departureTime.replace('T', ' '); 

    const formData = 
    {
        departure_location: departureLocation,
        destination: destination,
        departure_time: departureTime
    };

    if (!isNewRoute) 
    {
        formData.id = parseInt(id);
    }

    return formData;
}

async function loginUser() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try 
    {
        const response = await fetch(`http://localhost:32149/Users/login/${username}/${password}`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.status === 200) 
        {
            alert(data.message);
            renderLogs();
            saveUser(username, password, data.role);
            fetchRoutes(username, password);
            toggleRouteBlock(data.role);   
            checkLoginStatus();                
        } 
        else 
        {
            alert(data.message);
        }
    } 
    catch (error) 
    {
        console.error('Error logging in:', error);
    }
}


async function registerUser(username, password, role) 
{
    try 
    {
        const response = await fetch(`http://localhost:32149/Users/register/${username}/${password}/${role}`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();
        if (response.status === 201) 
        {
            alert(data.message);
        } 
        else 
        {
            alert(data.message);
        }
    } 
    catch (error) 
    {
        console.error('Error registering user:', error);
    }
}

document.getElementById('loginButton').addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    loginUser(username, password);
});

document.getElementById('registerButton').addEventListener('click', () => {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    if (username.trim() === '' || password.trim() === '' || password.length < 6) {
        alert('Please fill in all fields and ensure the password is at least 6 characters long.');
        return;
    }
    registerUser(username, password, role); 
});

function toggleRouteBlock(userRole) {
    const addRouteBlock = document.querySelector('.container.mt-5');
    const searchBlock = document.querySelector('#searchRegular');
    const sortBlock = document.querySelector('#sortRegular');
    const logsBlock = document.querySelector('#logsTableDiv');
    const routesBlock = document.querySelector('#tableRoutesDiv');


    if (userRole === 'employee') 
    {
        logsBlock.style.display = 'none';
        addRouteBlock.style.display = 'block'; 
        routesBlock.style.display = 'block'; 
        searchBlock.style.display = 'none'; 
        sortBlock.style.display = 'none'; 
        
    } 
    else if (userRole === 'admin')
    {
        addRouteBlock.style.display = 'none'; 
        searchBlock.style.display = 'none'; 
        sortBlock.style.display = 'none'; 
        logsBlock.style.display = 'block';
        routesBlock.style.display = 'none'; 
    }
    else 
    {
        addRouteBlock.style.display = 'none'; 
        logsBlock.style.display = 'none';
        searchBlock.style.display = 'block'; 
        sortBlock.style.display = 'block'; 
        routesBlock.style.display = 'block'; 
    }
}

function searchTable() 
{
    let input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById("routeSearch");
    filter = input.value.toUpperCase();
    table = document.querySelector("table");
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) 
    {
        let found = false;
        for (j = 0; j < 3; j++) 
        {
            td = tr[i].getElementsByTagName("td")[j];
            if (td) 
            {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) 
                {
                    found = true;
                    break;
                }
            }
        }
        if 
        (found) 
        {
            tr[i].style.display = "";
        }
        else 
        {
            tr[i].style.display = "none";
        }
    }
}  
let sortByTimeAscending = true;
let sortAlphabeticallyAscending = true;

function filterByTime() 
{
    const table = document.querySelector("table");
    const rows = table.querySelectorAll("tbody tr");

    const fragment = document.createDocumentFragment();
    const sortedRows = Array.from(rows).sort((rowA, rowB) => 
    {
        const timeA = rowA.cells[2].innerText.toLowerCase().trim();
        const timeB = rowB.cells[2].innerText.toLowerCase().trim();

        return sortByTimeAscending ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
    });

    sortedRows.forEach(row => 
    {
        fragment.appendChild(row);
    });

    table.querySelector("tbody").appendChild(fragment);

    sortByTimeAscending = !sortByTimeAscending;
}

function filterAlphabetically() 
{
    const table = document.querySelector("table");
    const rows = Array.from(table.getElementsByTagName("tr")).slice(1); 

    const fragment = document.createDocumentFragment();
    const sortedRows = rows.sort((rowA, rowB) => 
    {
        const textA = rowA.cells[0].innerText.toLowerCase().trim();
        const textB = rowB.cells[0].innerText.toLowerCase().trim();

        return sortAlphabeticallyAscending ? textA.localeCompare(textB) : textB.localeCompare(textA);
    });

    sortedRows.forEach(row => 
    {
        fragment.appendChild(row);
    });

    table.querySelector("tbody").appendChild(fragment);

    sortAlphabeticallyAscending = !sortAlphabeticallyAscending;
}             