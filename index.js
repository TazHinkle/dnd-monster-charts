var canvasElement = document.getElementById('myChart');
var contentHolder = document.getElementById('content-holder');
var apiURL = 'https://api.open5e.com/monsters/';

var makeMonsterTable = function(monsterTableData) {
    var rows = monsterTableData.results.map(function(monster) {
        return `
            <tr>
                <th scope="row">${monster.name}</th>
                <td>${monster.type}</td>
                <td>${monster.size}</td>
                <td>${monster.challenge_rating}</td>
            </tr>
        `
    });
    contentHolder.innerHTML = `
        <table class="table table-striped table-bordered">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Type</th>
                    <th scope="col">Size</th>
                    <th scope="col">Challenge Rating</th>
                </tr>
            </thead>
            <tbody>
                ${rows.join('')}
            </tbody>
        </table>
    `
};

var requestData = function() {
    fetch(apiURL).then(function(response) {
        response.json().then(function(data) {
            console.log('requestData: data', data);
            makeMonsterTable(data);
        })
    });
};

requestData();
