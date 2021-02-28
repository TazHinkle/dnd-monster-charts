var contentHolder = document.getElementById('content-holder');
var topContent = document.getElementById('top-content');
var urlParams = {};
var monsters = [];
var monstersPerPage = 100;
var bounds = {};
var stats = [
    "strength",
    "intelligence",
    "wisdom",
    "charisma",
    "dexterity",
    "constitution"
];

var getPropertyBounds = function(propertyName) {
    var target = {};
    bounds[propertyName] = target;
    monsters.forEach(function(monster) {
        var currentValue = monster[propertyName];
        target.min = Math.min(target.min || currentValue, currentValue);
        target.max = Math.max(target.max || currentValue, currentValue);
    });
};

var parseUrlHash = function(urlString) {
    var hash = urlString.split('#').pop();
    var params = {};
    hash.slice(1).split("&").forEach(function(item) {
        var split = item.split('=');
        params[split[0]] = split[1];
    });
    if(params.page !== undefined) {
        params.page = parseInt(params.page, 10);
    }
    return params;
};

var actUponHashParameters = function(urlString) {
    urlParams = parseUrlHash(urlString);
    console.log('window hash change listener', urlParams);
    if(urlParams.monster) {
        renderMonsterDetails(urlParams);
    } else {
        topContent.innerHTML = '';
        topContent.scrollIntoView(true);
    }
    makeMonsterTable(monsters, urlParams);
}

var renderMonsterDetails = function(urlParams) {
    var monster = monsters.find(function(item) {
        return item.slug === urlParams.monster;
    });
    console.log("renderMonsterDetails: monster", monster);
    topContent.innerHTML = `
        <div class="card mb-3">
            <div class="card-header">${monster.name}</div>
            <canvas
                id="chart"
                class="card-img-top h-100"
                width="512"
                height="256"
            ></canvas>
            <div class="card-body">
                <p class="card-text">${monster.legendary_desc}</p>
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <strong>Armor Class: </strong>
                    <span>${monster.armor_class}</span>
                </li>
                <li class="list-group-item">
                    <strong>Languages:</strong>
                    <span>${monster.languages}</span>
                </li><li class="list-group-item">
                    <strong>Senses:</strong>
                    <span>${monster.senses}</span>
                </li>
                <li class="list-group-item">
                    <strong>Speed (walking, flying, swimming):</strong>
                    <span>
                        ${monster.speed.walk || 0},
                        ${monster.speed.fly || 0},
                        ${monster.speed.swim || 0}
                    </span>
                </li>
                <li class="list-group-item">
                    <strong>Size:</strong>
                    <span>${monster.size}</span>
                </li>
                <li class="list-group-item">
                    <strong>Hit Dice:</strong>
                    <span>${monster.hit_dice}</span>
                </li>
            </ul>
            <div class="card-body">
                <a href="#?page=${urlParams.page || 0}&sort=${urlParams.sort}" class="card-link">Close</a>
            </div>
        </div>
    `
    topContent.scrollIntoView(true);
    var canvasElement = document.getElementById('chart');
    var options = {};
    var myBarChart = new Chart(
        canvasElement.getContext('2d'),
        {
            "type": "horizontalBar",
            "data": {
                "labels": stats,
                "datasets": [
                    {
                        "label": "Stats",
                        "data": stats.map(function(statName) {
                            return monster[statName];
                        }),
                        "fill": false,
                        "backgroundColor": [
                            "rgba(255, 99, 132, 0.2)",
                            "rgba(255, 159, 64, 0.2)",
                            "rgba(255, 205, 86, 0.2)",
                            "rgba(75, 192, 192, 0.2)",
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(153, 102, 255, 0.2)",
                            "rgba(201, 203, 207, 0.2)"
                        ],
                        "borderColor": [
                            "rgb(255, 99, 132)",
                            "rgb(255, 159, 64)",
                            "rgb(255, 205, 86)",
                            "rgb(75, 192, 192)",
                            "rgb(54, 162, 235)",
                            "rgb(153, 102, 255)",
                            "rgb(201, 203, 207)"
                        ],
                        "borderWidth": 1
                    }]
            },
            "options": {
                "scales": {
                    "xAxes": [{
                        "ticks": {
                            "beginAtZero": true,
                            "suggestedMin": 30,
                            "suggestedMax": 30
                        }
                    }]
                }
            }
        }
    );
}

window.addEventListener("hashchange", function(hashChangeEvent) {
    actUponHashParameters(hashChangeEvent.newURL);
});

var sanitizeFraction = function(string) {
    var result = parseInt(string, 10);
    if(string.indexOf('/') > -1) {
        var split = string.split('/');
        var a = parseInt(split[0], 10);
        var b = parseInt(split[1], 10);
        result = a / b;
    }
    return result;
}

var numericAscending = function(a, b) {
    return a - b;
}

var numericDescending = function(a, b) {
    return b - a;
}

var alphabeticAscending = function(a, b) {
    return a.localeCompare(b);
}

var alphabeticDescending = function(a, b) {
    return b.localeCompare(a);
}

var sortNumericallyWithFractions = function(property, direction) {
    var sortDirection = direction === 'desc'
        ? numericDescending
        : numericAscending;
    return function(a, b) {
        var fractionA = sanitizeFraction(a[property]) || 0;
        var fractionB = sanitizeFraction(b[property]) || 0;
        return sortDirection(fractionA, fractionB);
    };
};

var sortAlphabetically = function(property, direction) {
    var sortDirection = direction === 'desc'
        ? alphabeticDescending
        : alphabeticAscending;
    return function(a, b) {
        var nameA = a[property].toLocaleLowerCase();
        var nameB = b[property].toLocaleLowerCase();
        return sortDirection(nameA, nameB);
    };
};

var sizeMap = {
    tiny: 0,
    small: 1,
    medium: 2,
    large: 3,
    huge: 4,
    gargantuan: 5
};
var sortBySize = function(property, direction) {
    var sortDirection = direction === 'desc'
        ? numericDescending
        : numericAscending;
    return function(a, b) {
        var sizeA = sizeMap[a[property].toLocaleLowerCase()] || 0;
        var sizeB = sizeMap[b[property].toLocaleLowerCase()] || 0;
        return sortDirection(sizeA, sizeB);
    };
};

var sortMethods = {
    name: sortAlphabetically,
    type: sortAlphabetically,
    size: sortBySize,
    challenge_rating: sortNumericallyWithFractions
};

var sortMonsters = function(monsters, sort) {
    var sortSplit = sort.split('-')
    var property = sortSplit[0];
    var direction = sortSplit[1];
    var sortMethod = sortMethods[property](property, direction);
    monsters.sort(sortMethod);
}

var makeMonsterTableColumnHeader = function(label, fieldName) {
    return `
        <th scope="col">
            <span 
                class="d-block"
            >${label}</span>
            <span 
                class="d-block"
            >
                <a
                    href="#?sort=${fieldName}-asc"
                    class="
                        btn
                        btn-info
                    "
                >↓</a>
                <a
                    href="#?sort=${fieldName}-desc"
                    class="
                        btn
                        btn-info
                    "
                >↑</a>
            </span>
        </th>
    `
}

var makeMonsterTable = function(monsters, urlParams) {
    var page = urlParams.page || 0;
    var sort = urlParams.sort || 'name';
    var sortedMonsters = monsters.slice();
    console.log(
        'makeMonsterTable: args',
        {
            page:page,
            sort:sort
        }
    );
    sortMonsters(sortedMonsters, sort);
    var monstersOnThisPage = sortedMonsters.slice(
        monstersPerPage * page,
        monstersPerPage * (page + 1)
    );
    var numberOfPages = Math.ceil(monsters.length / monstersPerPage);
    var pageLinks = [];
    for(var i = 0; i < numberOfPages; i++) {
        var active = i === page ? ' active' : '';
        var fitsMobileView = (Math.abs(page - i) < 3) ? '' : ' d-none d-sm-inline';
        pageLinks.push(`
            <li 
                class="page-item${active}${fitsMobileView}"
            >
                <a 
                    class="page-link" 
                    href="#?page=${i}&sort=${sort}"
                >${i + 1}</a>
            </li>
        `);
    }
    var rows = monstersOnThisPage.map(function(monster) {
        return `
            <tr>
                <th scope="row">
                    <a href="#?page=${page}&sort=${sort}&monster=${monster.slug}">${monster.name}</a>
                </th>
                <td>${monster.type}</td>
                <td>${monster.size}</td>
                <td>${monster.challenge_rating}</td>
            </tr>
        `
    });
    contentHolder.innerHTML = `
        <nav aria-label="Page navigation example">
            <ul class="pagination justify-content-center">
                <li class="page-item">
                    <a class="page-link" href="#?page=${Math.max((page - 1), 0)}">Prev</a>
                </li>
                ${pageLinks.join('')}
                <li class="page-item">
                    <a class="page-link" href="#?page=${Math.min((page + 1), (numberOfPages - 1))}">Next</a>
                </li>
            </ul>
        </nav>
        <table class="table table-striped table-bordered">
            <thead>
                <tr>
                    ${makeMonsterTableColumnHeader('Name', 'name')}
                    ${makeMonsterTableColumnHeader('Type', 'type')}
                    ${makeMonsterTableColumnHeader('Size', 'size')}
                    ${makeMonsterTableColumnHeader('Challenge Rating', 'challenge_rating')}
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
monsterDataPromise.then(function(data) {
    monsters = data;
    stats.forEach(getPropertyBounds);
    actUponHashParameters(window.location.href);
});
