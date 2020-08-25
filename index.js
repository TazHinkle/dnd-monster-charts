var canvasElement = document.getElementById('myChart');
var contentHolder = document.getElementById('content-holder');
var nextBtn = document.getElementById('next-btn');
var prevBtn = document.getElementById('prev-btn');

var tablePaginateClickHandler = function(clickEvent) {
    var destinationPage = clickEvent.target.destinationPage;
    requestMonsterList(destinationPage);
};

nextBtn.addEventListener('click', tablePaginateClickHandler);
prevBtn.addEventListener('click', tablePaginateClickHandler);

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

var requestMonsterList = function(page) {
    fetch(page)
        .then(function(response) {
            response.json().then(function(data) {
                console.log('requestData: data', data);
                makeMonsterTable(data);
                if (data.previous) {
                    prevBtn.removeAttribute("disabled");
                    prevBtn.destinationPage = data.previous;
                } else {
                    prevBtn.setAttribute("disabled", true);
                }
                if (data.next) {
                    nextBtn.removeAttribute("disabled");
                    nextBtn.destinationPage = data.next;
                } else {
                    nextBtn.setAttribute("disabled", true);
                }
            })
        });
};

requestMonsterList(`https://api.open5e.com/monsters/`);
