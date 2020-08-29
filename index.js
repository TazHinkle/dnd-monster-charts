var canvasElement = document.getElementById('myChart');
var contentHolder = document.getElementById('content-holder');
var nextBtn = document.getElementById('next-btn');
var prevBtn = document.getElementById('prev-btn');

var tablePaginateClickHandler = function(clickEvent) {
    var monsterListUrl = clickEvent.target.destinationPage;
    requestMonsterList(monsterListUrl);
};

nextBtn.addEventListener('click', tablePaginateClickHandler);
prevBtn.addEventListener('click', tablePaginateClickHandler);

var makeMonsterTable = function(monsterTableData) {
    var rows = monsterTableData.map(function(monster) {
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

var monsterDataPromise = new Promise(function(resolve) {
    var dataFromLocalStorage = JSON.parse(localStorage.getItem('monsters'));
    if (dataFromLocalStorage) {
        resolve(dataFromLocalStorage);
    } else {
        fetch('https://gist.githubusercontent.com/TazHinkle/9b7374b07a66e725263262e4debbcaa3/raw/431861e93ea55a6db017cd55195ef63d81a529ae/monsters.json')
            .then(function(response) {
                response.json().then(function(data) {
                    console.log('requestData: data', data);
                    localStorage.setItem('monsters', JSON.stringify(data));
                    resolve(data);
                })
            });
    }
});
monsterDataPromise.then(makeMonsterTable);

